  function renderPreview(container) {
    if (!container) {
      return;
    }

    var response = SMART_STATE.response;
    if (!response || !response.task) {
      container.hidden = true;
      container.innerHTML = "";
      return;
    }

    var task = response.task;
    var warnings = uniqueStrings([].concat(response.warnings || [], task.warnings || []));
    var tags = Array.isArray(task.tags) ? task.tags : [];
    var summaryLines = Array.isArray(task.summaryLines) ? task.summaryLines : [];
    var readableDueDate = formatReadableDate(task.dueDate);
    var deadlineLine = trimSummaryPrefix(findSummaryLine(summaryLines, ["last date", "deadline", "due date", "on or before"])) || readableDueDate;
    var actionLine = truncateText(
      trimSummaryPrefix(task.actionSummary || findSummaryLine(summaryLines, ["action"])) || truncateText(task.description || "", 160),
      140
    ) || "Review the extracted action before applying it to the task form.";
    var impactLine = truncateText(
      trimSummaryPrefix(task.impactSummary || findSummaryLine(summaryLines, ["if missed", "impact"])) || "Review the extracted impact before saving.",
      140
    );
    var detailsItems = buildDetailsItems(task);

    container.hidden = false;
    container.innerHTML = [
      '<section class="tsi-step-card">',
      '<div class="tsi-step-header">',
      '<span class="tsi-step-number">Step 2</span>',
      '<div><h6>AI Extraction</h6><p>Review the deadline, action, and impact first. Then continue to Step 3 for the full extracted details.</p></div>',
      "</div>",
      '<div class="tsi-summary-card">',
      '<div class="d-flex justify-content-between align-items-start gap-3 flex-wrap">',
      '<div><div class="tsi-block-title">SmartIntake Summary</div><h6>' + escapeHtml(task.title || "Untitled task suggestion") + "</h6></div>",
      '<span class="tsi-chip">Confidence ' + escapeHtml(task.confidence || 0) + "%</span>",
      "</div>",
      '<div class="tsi-summary-stack">',
      '<div class="tsi-summary-row"><span class="tsi-summary-label">Last Date</span><span>' + escapeHtml(deadlineLine) + "</span></div>",
      '<div class="tsi-summary-row"><span class="tsi-summary-label">Action</span><span>' + escapeHtml(actionLine) + "</span></div>",
      '<div class="tsi-summary-row"><span class="tsi-summary-label">Impact</span><span>' + escapeHtml(impactLine) + "</span></div>",
      "</div>",
      '<div class="tsi-meta-grid">',
      '<div class="tsi-meta-card"><strong>Category</strong><span>' + escapeHtml(task.category || "ACADEMIC") + "</span></div>",
      '<div class="tsi-meta-card"><strong>Priority</strong><span>' + escapeHtml(task.priority || "MEDIUM") + "</span></div>",
      '<div class="tsi-meta-card"><strong>Effort</strong><span>' + escapeHtml(task.effort || "MEDIUM") + "</span></div>",
      "</div>",
      "</div>",
      "</section>",
      '<details class="tsi-details" open>',
      '<summary><span class="tsi-step-number">Step 3</span><span>Review Full Details Before Continuing</span></summary>',
      '<div class="tsi-details-content">',
      detailsItems.length
        ? '<div class="tsi-detail-group"><div class="tsi-block-title">Extracted Information</div><ul class="tsi-list">' + detailsItems.map(function (item) {
          return "<li>" + escapeHtml(item) + "</li>";
        }).join("") + "</ul></div>"
        : "",
      tags.length
        ? '<div class="tsi-detail-group"><div class="tsi-block-title">Suggested Tags</div><div class="tsi-chip-list">' + tags.map(function (tag) {
          return '<span class="tsi-chip">' + escapeHtml(tag) + "</span>";
        }).join("") + "</div></div>"
        : "",
      warnings.length
        ? '<div class="tsi-detail-group"><div class="tsi-block-title">Review Notes</div><ul class="tsi-list">' + warnings.map(function (warning) {
          return "<li>" + escapeHtml(warning) + "</li>";
        }).join("") + "</ul></div>"
        : "",
      '<div class="tsi-detail-group"><div class="tsi-block-title">Metadata</div><p>Due date: ' + escapeHtml(readableDueDate) + ' | Impact level: ' + escapeHtml(task.impact || "MEDIUM") + ' | Record: ' + escapeHtml(response.recordId || "Generated") + "</p></div>",
      '<div class="tsi-button-block">',
      '<button type="button" class="tsi-button tsi-button-primary" data-tsi-role="apply">' + escapeHtml(SMART_STATE.applied ? "Continue to Manual Add Again" : "Continue to Manual Add") + "</button>",
      "</div>",
      "</div>",
      "</details>"
    ].join("");
  }

  function renderStatus(container) {
    if (!container || !SMART_STATE.message) {
      if (container) {
        container.hidden = true;
      }
      return;
    }

    container.hidden = false;
    container.className = "tsi-status tsi-status-" + (SMART_STATE.messageType || "info");
    container.textContent = SMART_STATE.message;
  }

  function updateFileName(fileInput, label, analyzeButton, chooseFileButton, textArea) {
    if (!label) {
      return;
    }

    var file = fileInput && fileInput.files && fileInput.files[0];
    var hasPastedText = !!(textArea && String(textArea.value || "").trim());
    SMART_STATE.fileName = file ? file.name : "";
    label.className = "tsi-filename" + ((SMART_STATE.fileName || hasPastedText) ? " tsi-filename-ready" : "");
    label.textContent = SMART_STATE.fileName
      ? "Document selected: " + SMART_STATE.fileName
      : hasPastedText
        ? "Text is ready for SmartIntake analysis."
        : "No document chosen yet. You can upload a file or paste text below.";

    if (analyzeButton) {
      analyzeButton.classList.toggle("tsi-button-ready", !!(SMART_STATE.fileName || hasPastedText) && !SMART_STATE.analyzing);
    }

    if (chooseFileButton) {
      chooseFileButton.classList.toggle("tsi-upload-ready", !!SMART_STATE.fileName);
      chooseFileButton.textContent = SMART_STATE.fileName ? "Document Selected" : "Choose Document";
    }
  }

  function ensureModeSwitch(pageRoot, mode) {
    if (!pageRoot) {
      return;
    }

    var switcher = pageRoot.querySelector(".tsi-mode-switch");
    if (!switcher) {
      switcher = document.createElement("div");
      switcher.className = "tsi-mode-switch";
      switcher.innerHTML = [
        '<div class="tsi-mode-switch-head">',
        '<div>',
        '<p class="tsi-mode-switch-title">Choose how you want to add the task</p>',
        '<p class="tsi-mode-switch-text">Use Manual Add for direct entry or open SmartIntake for document-based extraction and then continue in the manual form.</p>',
        "</div>",
        '<div class="tsi-mode-switch-actions">',
        '<a class="tsi-nav-link" data-tsi-nav="manual" href="/create-task">Manual Add</a>',
        '<a class="tsi-nav-link" data-tsi-nav="smart" href="/create-task?smart=true">SmartIntake</a>',
        "</div>",
        "</div>"
      ].join("");
      pageRoot.insertBefore(switcher, pageRoot.firstChild);
    }

    Array.prototype.forEach.call(switcher.querySelectorAll("[data-tsi-nav]"), function (link) {
      link.classList.toggle("active", link.getAttribute("data-tsi-nav") === mode);
    });
  }

