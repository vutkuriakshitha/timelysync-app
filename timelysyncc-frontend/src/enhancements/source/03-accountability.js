
  function formatMetricValue(value) {
    var number = Number(value || 0);
    var rounded = Math.round(number * 10) / 10;
    return rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
  }

  function toDisplayLabel(value) {
    var text = String(value || "Uncategorized").trim();
    if (!text) {
      return "Uncategorized";
    }

    return text
      .toLowerCase()
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
  }

  function isCompletedTask(task) {
    return String(task && task.status || "").toUpperCase() === "COMPLETED";
  }

  function isActiveTask(task) {
    return !isCompletedTask(task);
  }

  function getRiskScoreFromTask(task) {
    if (!task || !task.riskAnalysis) {
      return 0;
    }

    var risk = task.riskAnalysis;
    if (typeof risk === "number") {
      return Number(risk) || 0;
    }
    if (typeof risk === "object") {
      return Number(risk.riskScore || risk.score || risk.overallScore || 0) || 0;
    }
    if (typeof risk === "string") {
      var match = risk.match(/riskScore[^0-9]*([0-9]+)/i) || risk.match(/([0-9]{1,3})/);
      return match ? Number(match[1]) || 0 : 0;
    }

    return 0;
  }

  function formatTaskDateLabel(raw) {
    var date = parseTaskDate(raw);
    if (!date) {
      return "No due date";
    }

    return date.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function buildWeeklyTrendFromTasks(tasks) {
    var trend = [];
    var now = new Date();

    for (var i = 6; i >= 0; i -= 1) {
      var day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      var nextDay = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
      var completed = (tasks || []).filter(function (task) {
        var completedAt = parseTaskDate(task.completedAt);
        return completedAt && completedAt >= day && completedAt < nextDay;
      }).length;
      var due = (tasks || []).filter(function (task) {
        var dueDate = parseTaskDate(task.dueDate);
        return dueDate && dueDate >= day && dueDate < nextDay;
      }).length;

      trend.push({
        label: day.toLocaleDateString(undefined, { weekday: "short" }),
        completed: completed,
        total: due
      });
    }

    return trend;
  }

  function buildFallbackSummary(tasks) {
    var now = new Date();
    var completedTasks = (tasks || []).filter(isCompletedTask);
    var activeTasks = (tasks || []).filter(isActiveTask);
    var overdueTasks = activeTasks.filter(function (task) {
      var dueDate = parseTaskDate(task.dueDate);
      return dueDate && dueDate < now;
    });
    var onTimeCompleted = completedTasks.filter(function (task) {
      var dueDate = parseTaskDate(task.dueDate);
      var completedAt = parseTaskDate(task.completedAt);
      return dueDate && completedAt && completedAt <= dueDate;
    }).length;
    var avgRiskScore = activeTasks.length
      ? activeTasks.reduce(function (sum, task) {
        return sum + getRiskScoreFromTask(task);
      }, 0) / activeTasks.length
      : 0;

    return {
      totalTasks: tasks.length,
      activeTasks: activeTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      completionRate: tasks.length ? (completedTasks.length / tasks.length) * 100 : 0,
      onTimeRate: completedTasks.length ? (onTimeCompleted / completedTasks.length) * 100 : 0,
      avgRiskScore: avgRiskScore,
      weeklyTrend: buildWeeklyTrendFromTasks(tasks),
      cognitiveLoad: {
        activeTasksCount: activeTasks.length,
        isOverloaded: activeTasks.length > 5,
        maxCapacity: 5,
        warningMessage: activeTasks.length > 5
          ? "You are above the recommended active-task capacity."
          : "Your current active task load is manageable."
      }
    };
  }

  function buildCategoryPerformance(tasks) {
    var grouped = {};

    (tasks || []).forEach(function (task) {
      var key = toDisplayLabel(task.category);
      if (!grouped[key]) {
        grouped[key] = {
          name: key,
          total: 0,
          completed: 0,
          overdue: 0,
          active: 0
        };
      }

      grouped[key].total += 1;
      if (isCompletedTask(task)) {
        grouped[key].completed += 1;
      } else {
        grouped[key].active += 1;
        var dueDate = parseTaskDate(task.dueDate);
        if (dueDate && dueDate < new Date()) {
          grouped[key].overdue += 1;
        }
      }
    });

    return Object.keys(grouped).map(function (key) {
      var item = grouped[key];
      item.score = item.total ? Math.round((item.completed / item.total) * 100) : 0;
      item.statusLabel = item.score >= 80 ? "Strong" : item.score >= 50 ? "Average" : "Needs focus";
      item.statusTone = item.score >= 80 ? "success" : item.score >= 50 ? "warning" : "danger";
      return item;
    }).sort(function (a, b) {
      if (b.total !== a.total) {
        return b.total - a.total;
      }
      return a.name.localeCompare(b.name);
    });
  }

  function buildAttentionItems(tasks) {
    var now = new Date();

    return (tasks || []).map(function (task) {
      if (!isActiveTask(task)) {
        return null;
      }

      var dueDate = parseTaskDate(task.dueDate);
      var riskScore = getRiskScoreFromTask(task);
      var hoursLeft = hoursUntil(dueDate);
      var badgeClass = "";
      var badgeText = "";
      var sortWeight = 99;

      if (dueDate && dueDate < now) {
        badgeClass = "tsi-acc-badge-danger";
        badgeText = "Overdue";
        sortWeight = 0;
      } else if (hoursLeft !== null && hoursLeft <= 72) {
        badgeClass = "tsi-acc-badge-warning";
        badgeText = "Due soon";
        sortWeight = 1;
      } else if (riskScore >= 70) {
        badgeClass = "tsi-acc-badge-warning";
        badgeText = "High risk";
        sortWeight = 2;
      } else {
        return null;
      }

      return {
        title: task.title || "Untitled task",
        dueDate: task.dueDate,
        badgeClass: badgeClass,
        badgeText: badgeText,
        priority: toDisplayLabel(task.priority || "Medium"),
        sortWeight: sortWeight,
        sortDate: dueDate ? dueDate.getTime() : Number.MAX_SAFE_INTEGER
      };
    }).filter(Boolean).sort(function (a, b) {
      if (a.sortWeight !== b.sortWeight) {
        return a.sortWeight - b.sortWeight;
      }
      return a.sortDate - b.sortDate;
    }).slice(0, 4);
  }

  function buildAccountabilityMetrics(tasks, summary) {
    var safeTasks = Array.isArray(tasks) ? tasks : [];
    var liveSummary = summary || buildFallbackSummary(safeTasks);
    var categoryPerformance = buildCategoryPerformance(safeTasks);
    var weeklyTrend = Array.isArray(liveSummary.weeklyTrend) && liveSummary.weeklyTrend.length
      ? liveSummary.weeklyTrend.map(function (item) {
        return {
          label: item.day || item.label || "",
          completed: Number(item.completed || 0),
          total: Number(item.total || 0)
        };
      })
      : buildWeeklyTrendFromTasks(safeTasks);
    var attentionItems = buildAttentionItems(safeTasks);
    var completedThisWeek = weeklyTrend.reduce(function (sum, item) {
      return sum + Number(item.completed || 0);
    }, 0);

    return {
      totalTasks: Number(liveSummary.totalTasks || safeTasks.length || 0),
      activeTasks: Number(liveSummary.activeTasks || safeTasks.filter(isActiveTask).length || 0),
      completedTasks: Number(liveSummary.completedTasks || safeTasks.filter(isCompletedTask).length || 0),
      overdueTasks: Number(liveSummary.overdueTasks || 0),
      completionRate: Number(liveSummary.completionRate || 0),
      onTimeRate: Number(liveSummary.onTimeRate || 0),
      avgRiskScore: Number(liveSummary.avgRiskScore || 0),
      weeklyTrend: weeklyTrend,
      categoryPerformance: categoryPerformance,
      attentionItems: attentionItems,
      completedThisWeek: completedThisWeek,
      cognitiveLoad: liveSummary.cognitiveLoad || {},
      totalCategories: categoryPerformance.length
    };
  }

  function renderAccountabilityMarkup(metrics) {
    var maxCompleted = Math.max.apply(null, metrics.weeklyTrend.map(function (item) {
      return Number(item.completed || 0);
    }).concat([1]));
    var categoryMax = Math.max.apply(null, metrics.categoryPerformance.map(function (item) {
      return item.total;
    }).concat([1]));
    var workloadLabel = metrics.cognitiveLoad.isOverloaded ? "Above capacity" : "Within capacity";
    var workloadTone = metrics.cognitiveLoad.isOverloaded ? "tsi-acc-badge-danger" : "tsi-acc-badge-success";

    return [
      '<div class="tsi-acc-header">',
      '<div>',
      '<h2 class="tsi-acc-title">Accountability & Analytics</h2>',
      '<p class="tsi-acc-subtitle">Live accountability view based on your real TimelySync tasks, deadlines, completions, and category performance.</p>',
      '</div>',
      '<button type="button" class="tsi-button tsi-button-secondary" data-tsi-role="acc-refresh">Refresh Data</button>',
      '</div>',
      '<div class="tsi-acc-stats">',
      '<div class="tsi-acc-stat tsi-acc-stat-blue"><h6>Completion Rate</h6><strong>' + escapeHtml(formatMetricValue(metrics.completionRate)) + '%</strong><span>' + escapeHtml(metrics.completedTasks) + ' completed out of ' + escapeHtml(metrics.totalTasks) + ' total tasks</span></div>',
      '<div class="tsi-acc-stat tsi-acc-stat-green"><h6>On-Time Completion</h6><strong>' + escapeHtml(formatMetricValue(metrics.onTimeRate)) + '%</strong><span>' + escapeHtml(metrics.completedThisWeek) + ' tasks completed in the last 7 days</span></div>',
      '<div class="tsi-acc-stat tsi-acc-stat-amber"><h6>Overdue Tasks</h6><strong>' + escapeHtml(metrics.overdueTasks) + '</strong><span>Tasks already past deadline and needing attention</span></div>',
      '<div class="tsi-acc-stat tsi-acc-stat-cyan"><h6>Active Tasks</h6><strong>' + escapeHtml(metrics.activeTasks) + '</strong><span>' + escapeHtml(metrics.totalCategories) + ' categories currently contributing to your workload</span></div>',
      '</div>',
      '<div class="tsi-acc-grid">',
      '<section class="tsi-acc-card">',
      '<h5>Weekly Completion</h5>',
      '<p>Completed tasks tracked over the last 7 days using your actual completion history.</p>',
      metrics.weeklyTrend.some(function (item) { return item.completed || item.total; })
        ? '<div class="tsi-acc-chart">' + metrics.weeklyTrend.map(function (item) {
          var height = Math.max(12, Math.round((Number(item.completed || 0) / maxCompleted) * 100));
          return [
            '<div class="tsi-acc-bar-col">',
            '<div class="tsi-acc-bar-value">' + escapeHtml(item.completed) + '</div>',
            '<div class="tsi-acc-bar-track"><div class="tsi-acc-bar-fill" style="height:' + height + '%;"></div></div>',
            '<div class="tsi-acc-bar-day">' + escapeHtml(item.label) + "</div>",
            "</div>"
          ].join("");
        }).join("") + "</div>"
        : '<div class="tsi-acc-empty">No completed tasks yet, so the weekly completion chart is still empty.</div>',
      '</section>',
      '<aside class="tsi-acc-card">',
      '<h5>Workload Snapshot</h5>',
      '<p>These signals update from your real task load, deadlines, and risk profile.</p>',
      '<div class="tsi-acc-summary">',
      '<div class="tsi-acc-kpi-grid">',
      '<div class="tsi-acc-kpi"><strong>Average Risk</strong><span>' + escapeHtml(formatMetricValue(metrics.avgRiskScore)) + '%</span></div>',
      '<div class="tsi-acc-kpi"><strong>Workload</strong><span><span class="tsi-acc-badge ' + escapeHtml(workloadTone) + '">' + escapeHtml(workloadLabel) + '</span></span></div>',
      '<div class="tsi-acc-kpi"><strong>Active vs Capacity</strong><span>' + escapeHtml(metrics.cognitiveLoad.activeTasksCount || metrics.activeTasks) + ' / ' + escapeHtml(metrics.cognitiveLoad.maxCapacity || 5) + "</span></div>",
      '<div class="tsi-acc-kpi"><strong>Total Tasks</strong><span>' + escapeHtml(metrics.totalTasks) + "</span></div>",
      "</div>",
      metrics.attentionItems.length
        ? '<div><div class="tsi-block-title">Needs attention</div><div class="tsi-acc-list">' + metrics.attentionItems.map(function (item) {
          return [
            '<div class="tsi-acc-item">',
            '<div style="display:flex;justify-content:space-between;gap:.75rem;align-items:flex-start;">',
            '<div class="tsi-acc-item-title">' + escapeHtml(item.title) + "</div>",
            '<span class="tsi-acc-badge ' + escapeHtml(item.badgeClass) + '">' + escapeHtml(item.badgeText) + "</span>",
            "</div>",
            '<div class="tsi-acc-item-meta">Due: ' + escapeHtml(formatTaskDateLabel(item.dueDate)) + ' | Priority: ' + escapeHtml(item.priority) + "</div>",
            "</div>"
          ].join("");
        }).join("") + "</div></div>"
        : '<div class="tsi-acc-alert">No overdue or urgent tasks right now. Your current queue looks stable.</div>',
      metrics.cognitiveLoad.warningMessage
        ? '<div class="tsi-acc-alert">' + escapeHtml(metrics.cognitiveLoad.warningMessage) + "</div>"
        : "",
      "</div>",
      "</aside>",
      "</div>",
      '<section class="tsi-acc-card">',
      '<h5>Category Performance</h5>',
      '<p>Each category is calculated from your real tasks, completed work, and overdue load.</p>',
      metrics.categoryPerformance.length
        ? '<div class="tsi-acc-category-stack">' + metrics.categoryPerformance.slice(0, 4).map(function (item) {
          var shareWidth = Math.max(12, Math.round((item.total / categoryMax) * 100));
          return [
            '<div class="tsi-acc-category-row">',
            '<div class="tsi-acc-category-name">' + escapeHtml(item.name) + "</div>",
            '<div class="tsi-acc-progress"><span style="width:' + shareWidth + '%;"></span></div>',
            '<div class="tsi-acc-category-meta">' + escapeHtml(item.total) + " tasks</div>",
            "</div>"
          ].join("");
        }).join("") + "</div>"
        : '<div class="tsi-acc-empty">Create a few tasks first. Category analytics will appear here automatically.</div>',
      metrics.categoryPerformance.length
        ? '<table class="tsi-acc-table"><thead><tr><th>Category</th><th>Total</th><th>Completed</th><th>Overdue</th><th>Performance</th><th>Status</th></tr></thead><tbody>' + metrics.categoryPerformance.map(function (item) {
          return [
            "<tr>",
            "<td>" + escapeHtml(item.name) + "</td>",
            "<td>" + escapeHtml(item.total) + "</td>",
            "<td>" + escapeHtml(item.completed) + "</td>",
            "<td>" + escapeHtml(item.overdue) + "</td>",
            '<td><div class="tsi-acc-progress"><span style="width:' + escapeHtml(item.score) + '%;"></span></div><div class="tsi-acc-item-meta" style="margin-top:.35rem;">' + escapeHtml(item.score) + "% completed</div></td>",
            '<td><span class="tsi-acc-badge tsi-acc-badge-' + escapeHtml(item.statusTone) + '">' + escapeHtml(item.statusLabel) + "</span></td>",
            "</tr>"
          ].join("");
        }).join("") + "</tbody></table>"
        : "",
      "</section>"
    ].join("");
  }

  function renderAccountabilityLoading(pageRoot) {
    pageRoot.innerHTML = [
      '<div class="tsi-acc-header">',
      '<div>',
      '<h2 class="tsi-acc-title">Accountability & Analytics</h2>',
      '<p class="tsi-acc-subtitle">Loading your live task accountability data...</p>',
      "</div>",
      "</div>",
      '<div class="tsi-acc-loading">Fetching your real tasks, completion trend, and category performance.</div>'
    ].join("");
  }

  async function loadAccountabilityData(force) {
    if (ACCOUNTABILITY_STATE.loading) {
      return;
    }

    if (!force && ACCOUNTABILITY_STATE.loaded && Date.now() - ACCOUNTABILITY_STATE.lastFetchedAt < 30000) {
      return;
    }

    ACCOUNTABILITY_STATE.loading = true;
    ACCOUNTABILITY_STATE.error = "";
    enhanceAccountabilityPage();

    try {
      var tasksPayload = await fetchAuthenticatedJson("/tasks");
      var summaryPayload = null;
      try {
        summaryPayload = await fetchAuthenticatedJson("/dashboard/summary");
      } catch (summaryError) {
        console.warn("Accountability summary fallback in use", summaryError);
      }

      ACCOUNTABILITY_STATE.tasks = Array.isArray(tasksPayload && tasksPayload.tasks) ? tasksPayload.tasks : [];
      ACCOUNTABILITY_STATE.summary = summaryPayload || buildFallbackSummary(ACCOUNTABILITY_STATE.tasks);
      ACCOUNTABILITY_STATE.loaded = true;
      ACCOUNTABILITY_STATE.lastFetchedAt = Date.now();
    } catch (error) {
      ACCOUNTABILITY_STATE.error = getErrorMessage(error, "Could not load accountability data.");
    } finally {
      ACCOUNTABILITY_STATE.loading = false;
      enhanceAccountabilityPage();
    }
  }

  function enhanceAccountabilityPage() {
    if (window.location.pathname !== "/accountability") {
      return;
    }

    installStyles();

    var pageRoot = document.querySelector(".container-fluid.p-4");
    if (!pageRoot) {
      return;
    }

    pageRoot.classList.add("tsi-accountability-page");

    if (ACCOUNTABILITY_STATE.loading && !ACCOUNTABILITY_STATE.loaded) {
      renderAccountabilityLoading(pageRoot);
      return;
    }

    if (!ACCOUNTABILITY_STATE.loaded && !ACCOUNTABILITY_STATE.loading) {
      renderAccountabilityLoading(pageRoot);
      loadAccountabilityData(false);
      return;
    }

    if (ACCOUNTABILITY_STATE.error && !ACCOUNTABILITY_STATE.loaded) {
      pageRoot.innerHTML = [
        '<div class="tsi-acc-header">',
        '<div>',
        '<h2 class="tsi-acc-title">Accountability & Analytics</h2>',
        '<p class="tsi-acc-subtitle">We could not load your live accountability data yet.</p>',
        "</div>",
        '<button type="button" class="tsi-button tsi-button-secondary" data-tsi-role="acc-refresh">Retry</button>',
        "</div>",
        '<div class="tsi-acc-loading">' + escapeHtml(ACCOUNTABILITY_STATE.error) + "</div>"
      ].join("");
    } else {
      var metrics = buildAccountabilityMetrics(ACCOUNTABILITY_STATE.tasks, ACCOUNTABILITY_STATE.summary);
      pageRoot.innerHTML = renderAccountabilityMarkup(metrics);
    }

    var refreshButton = pageRoot.querySelector('[data-tsi-role="acc-refresh"]');
    if (refreshButton && !refreshButton.dataset.tsiBound) {
      refreshButton.dataset.tsiBound = "true";
      refreshButton.addEventListener("click", function () {
        loadAccountabilityData(true);
      });
    }
  }

