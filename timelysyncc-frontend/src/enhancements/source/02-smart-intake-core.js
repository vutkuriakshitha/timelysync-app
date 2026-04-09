
  function findCommonAncestor(elements) {
    var valid = (elements || []).filter(Boolean);
    if (!valid.length) {
      return null;
    }

    function getAncestors(node) {
      var ancestors = [];
      while (node && node.nodeType === 1) {
        ancestors.push(node);
        node = node.parentElement;
      }
      return ancestors;
    }

    var ancestorSets = valid.map(getAncestors);
    return ancestorSets[0].find(function (candidate) {
      return ancestorSets.every(function (list) {
        return list.indexOf(candidate) >= 0;
      });
    }) || null;
  }

  function setImportantStyle(node, property, value) {
    if (!node || !node.style) {
      return;
    }
    node.style.setProperty(property, value, "important");
  }

  function getCreateTaskMode() {
    var params = new URLSearchParams(window.location.search);
    return params.get("smart") === "true" || params.get("mode") === "smart"
      ? "smart"
      : "manual";
  }

  function formHasManualValues() {
    return fieldHasValue("title") ||
      fieldHasValue("description") ||
      fieldHasValue("dueDate") ||
      fieldHasValue("notes") ||
      fieldHasValue("tags");
  }

  function uniqueStrings(items) {
    var seen = {};
    var result = [];
    (items || []).forEach(function (item) {
      var value = String(item || "").trim();
      if (!value) {
        return;
      }
      var key = value.toLowerCase();
      if (!seen[key]) {
        seen[key] = true;
        result.push(value);
      }
    });
    return result;
  }

  function normalizeDateValue(raw) {
    if (!raw) {
      return "";
    }

    if (Array.isArray(raw)) {
      var year = Number(raw[0] || 0);
      var month = Math.max(Number(raw[1] || 1) - 1, 0);
      var day = Number(raw[2] || 1);
      var hour = Number(raw[3] || 18);
      var minute = Number(raw[4] || 0);
      return formatDateLocal(new Date(year, month, day, hour, minute));
    }

    if (typeof raw === "string") {
      var normalized = raw.replace(" ", "T");
      var parsed = new Date(normalized);
      if (!isNaN(parsed.getTime())) {
        return formatDateLocal(parsed);
      }
      return normalized.slice(0, 16);
    }

    if (typeof raw === "object" && raw.year) {
      return formatDateLocal(new Date(
        Number(raw.year),
        Math.max(Number(raw.monthValue || raw.month || 1) - 1, 0),
        Number(raw.dayOfMonth || raw.day || 1),
        Number(raw.hour || 18),
        Number(raw.minute || 0)
      ));
    }

    return "";
  }

  function formatDateLocal(date) {
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    var hour = String(date.getHours()).padStart(2, "0");
    var minute = String(date.getMinutes()).padStart(2, "0");
    return year + "-" + month + "-" + day + "T" + hour + ":" + minute;
  }

  function saveSmartDraft(payload) {
    try {
      sessionStorage.setItem(SMART_DRAFT_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Could not store SmartIntake draft", error);
    }
  }

  function consumeSmartDraft() {
    try {
      var raw = sessionStorage.getItem(SMART_DRAFT_STORAGE_KEY);
      if (!raw) {
        return null;
      }

      sessionStorage.removeItem(SMART_DRAFT_STORAGE_KEY);
      return JSON.parse(raw);
    } catch (error) {
      sessionStorage.removeItem(SMART_DRAFT_STORAGE_KEY);
      return null;
    }
  }

  function formatReadableDate(raw) {
    var normalized = normalizeDateValue(raw);
    if (!normalized) {
      return "Review needed";
    }

    var parsed = new Date(normalized);
    if (isNaN(parsed.getTime())) {
      return normalized.replace("T", " ");
    }

    var datePart = parsed.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    var timePart = parsed.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit"
    });

    return datePart + " â€¢ " + timePart;
  }

  function buildNotes(task) {
    var notes = [];
    if (Array.isArray(task.noteItems) && task.noteItems.length) {
      notes = uniqueStrings(task.noteItems).map(function (item) {
        return "- " + item;
      });
      return notes.join("\n");
    }

    if (Array.isArray(task.requiredDocuments) && task.requiredDocuments.length) {
      notes.push("- Required documents: " + task.requiredDocuments.join(", ") + ".");
    }

    return uniqueStrings(notes).join("\n");
  }

  function applyTaskToForm(task) {
    var dueDate = normalizeDateValue(task.dueDate);
    var tags = Array.isArray(task.tags) ? task.tags.join(", ") : "";
    var notes = buildNotes(task);

    setFieldValue("title", task.title || "");
    setFieldValue("description", task.description || "");
    setFieldValue("category", task.category || "ACADEMIC");
    setFieldValue("dueDate", dueDate);
    setFieldValue("priority", task.priority || "MEDIUM");
    setFieldValue("impact", task.impact || "MEDIUM");
    setFieldValue("effort", task.effort || "MEDIUM");
    setFieldValue("tags", tags);
    setFieldValue("notes", notes);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function trimSummaryPrefix(text) {
    return String(text || "")
      .replace(/^(last date|deadline|due date|action|impact|if missed)\s*:\s*/i, "")
      .trim();
  }

  function truncateText(text, maxLength) {
    var value = String(text || "").trim();
    if (!value || value.length <= maxLength) {
      return value;
    }

    return value.slice(0, maxLength - 1).trim() + "â€¦";
  }

  function findSummaryLine(summaryLines, keywords) {
    return (summaryLines || []).find(function (line) {
      var lowerLine = String(line || "").toLowerCase();
      return keywords.some(function (keyword) {
        return lowerLine.indexOf(keyword) >= 0;
      });
    }) || "";
  }

  function buildDetailsItems(task) {
    var items = [];

    if (Array.isArray(task.requiredDocuments) && task.requiredDocuments.length) {
      items.push("Required documents: " + uniqueStrings(task.requiredDocuments).join(", ") + ".");
    }

    items = items
      .concat(Array.isArray(task.rules) ? task.rules : [])
      .concat(Array.isArray(task.noteItems) ? task.noteItems : []);

    return uniqueStrings(items);
  }

  function parseTaskDate(raw) {
    var normalized = normalizeDateValue(raw);
    if (!normalized) {
      return null;
    }

    var parsed = new Date(normalized);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  function hoursUntil(date) {
    if (!date) {
      return null;
    }

    return Math.round((date.getTime() - Date.now()) / 36e5);
  }

  function buildDraftRecommendations(task) {
    var priority = String(task.priority || "MEDIUM").toUpperCase();
    var impact = String(task.impact || "MEDIUM").toUpperCase();
    var effort = String(task.effort || "MEDIUM").toUpperCase();
    var dueDate = parseTaskDate(task.dueDate);
    var hoursLeft = hoursUntil(dueDate);
    var priorityScores = { LOW: 24, MEDIUM: 48, HIGH: 72, CRITICAL: 90 };
    var impactScores = { LOW: 10, MEDIUM: 18, HIGH: 28, CRITICAL: 34 };
    var effortScores = { LOW: 8, MEDIUM: 14, HIGH: 22 };
    var urgencyScore = 0;

    if (hoursLeft !== null) {
      if (hoursLeft <= 24) {
        urgencyScore = 26;
      } else if (hoursLeft <= 72) {
        urgencyScore = 18;
      } else if (hoursLeft <= 168) {
        urgencyScore = 10;
      } else {
        urgencyScore = 4;
      }
    }

    var score = Math.min(98, Math.round(
      (priorityScores[priority] || 48) * 0.45 +
      (impactScores[impact] || 18) * 0.8 +
      (effortScores[effort] || 14) * 0.9 +
      urgencyScore
    ));

    var level = score >= 85 ? "critical" : score >= 70 ? "high" : score >= 45 ? "medium" : "low";
    var levelLabel = level.charAt(0).toUpperCase() + level.slice(1);
    var leadDays = effort === "HIGH" ? 3 : effort === "MEDIUM" ? 2 : 1;
    if (priority === "HIGH" || impact === "HIGH" || level === "critical") {
      leadDays += 1;
    }

    var recommendedStart = "Add a due date to get the recommended start time.";
    if (dueDate) {
      var startDate = new Date(dueDate.getTime());
      startDate.setDate(startDate.getDate() - leadDays);
      recommendedStart = startDate.getTime() <= Date.now()
        ? "Start today"
        : formatReadableDate(startDate);
    }

    var estimatedTime = effort === "HIGH"
      ? "4-6 hours"
      : effort === "MEDIUM"
        ? "2-4 hours"
        : "30-90 mins";

    var suggestions = [];
    if (task.actionSummary) {
      suggestions.push(task.actionSummary);
    }
    if (Array.isArray(task.requiredDocuments) && task.requiredDocuments.length) {
      suggestions.push("Prepare " + uniqueStrings(task.requiredDocuments).join(", ") + " before submission.");
    }
    if (hoursLeft !== null) {
      if (hoursLeft <= 24) {
        suggestions.push("This is close to the deadline. Finish the mandatory pieces first.");
      } else if (hoursLeft <= 72) {
        suggestions.push("Start this now so there is time to review before the deadline.");
      }
    }
    if (task.impactSummary) {
      suggestions.push(task.impactSummary);
    }

    suggestions = uniqueStrings(suggestions).slice(0, 3);

    return {
      score: score,
      level: level,
      levelLabel: levelLabel,
      estimatedTime: estimatedTime,
      recommendedStart: recommendedStart,
      suggestions: suggestions
    };
  }

  function renderDraftAiContent(content, task) {
    if (!content || !task) {
      return;
    }

    var recommendation = buildDraftRecommendations(task);
    content.innerHTML = [
      '<div class="tsi-ai-kpi-grid">',
      '<div class="tsi-ai-kpi-card"><strong>Risk Score</strong><div class="tsi-ai-kpi-value">' + escapeHtml(recommendation.score) + '%</div></div>',
      '<div class="tsi-ai-kpi-card"><strong>Risk Level</strong><div><span class="tsi-ai-badge tsi-ai-badge-' + escapeHtml(recommendation.level) + '">' + escapeHtml(recommendation.levelLabel) + "</span></div></div>",
      '<div class="tsi-ai-kpi-card"><strong>Estimated Time</strong><div class="tsi-ai-kpi-value">' + escapeHtml(recommendation.estimatedTime) + "</div></div>",
      '<div class="tsi-ai-kpi-card"><strong>Recommended Start</strong><div class="tsi-ai-kpi-value" style="font-size:.92rem;">' + escapeHtml(recommendation.recommendedStart) + "</div></div>",
      "</div>",
      recommendation.suggestions.length
        ? '<div class="tsi-detail-group"><div class="tsi-block-title">Suggestions</div><ul class="tsi-list">' + recommendation.suggestions.map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        }).join("") + "</ul></div>"
        : '<div class="tsi-ai-placeholder">SmartIntake added the draft to the form. Update due date, priority, or impact for more specific recommendations.</div>'
    ].join("");
  }

  async function fetchAuthenticatedJson(endpoint) {
    var token = getToken();
    if (!token) {
      window.location.href = "/login";
      throw new Error("Please sign in again.");
    }

    var response = await fetch(API_BASE + endpoint, {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    var payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(parseApiError(payload, "Could not load accountability data."));
    }

    return payload;
  }
