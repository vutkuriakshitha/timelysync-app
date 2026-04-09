  function enhanceDashboardPage() {
    if (window.location.pathname !== "/dashboard") {
      return;
    }

    installStyles();

    var pageRoot = document.querySelector(".container-fluid.py-4");
    if (pageRoot) {
      pageRoot.classList.add("tsi-dashboard-page");
    }

    var searchInput = Array.prototype.find.call(document.querySelectorAll("input"), function (input) {
      return /search tasks/i.test(input.getAttribute("placeholder") || "");
    });
    var filterButtons = Array.prototype.filter.call(document.querySelectorAll("button, .btn"), function (button) {
      return /^(all active|today \(|upcoming \(|overdue \(|high risk \(|completed \()/i.test(getText(button));
    });
    var sortControl = Array.prototype.find.call(document.querySelectorAll("button, .btn, [role='button']"), function (node) {
      return /^sort:/i.test(getText(node));
    });
    var activeHeading = Array.prototype.find.call(document.querySelectorAll("h1,h2,h3,h4,h5,h6,div,span,p"), function (node) {
      return getText(node) === "Active Tasks";
    });

    var searchBlock = searchInput ? (searchInput.closest(".input-group") || searchInput.parentElement) : null;
    var sortBlock = sortControl ? (sortControl.closest(".dropdown") || sortControl.closest(".btn-group") || sortControl.parentElement) : null;
    var toolbar = findCommonAncestor([searchBlock, sortBlock]) ||
      findCommonAncestor([searchInput, sortControl]) ||
      (searchBlock && sortBlock && searchBlock.parentElement === sortBlock.parentElement ? searchBlock.parentElement : null) ||
      (searchBlock ? searchBlock.parentElement : null);
    var filtersRow = findCommonAncestor(filterButtons) ||
      (filterButtons.length ? filterButtons[0].parentElement : null);
    var taskCard = activeHeading ? (activeHeading.closest(".card") || activeHeading.parentElement) : null;
    var focusArea = findCommonAncestor([toolbar, filtersRow, taskCard]);

    if (focusArea && focusArea !== pageRoot) {
      focusArea.classList.add("tsi-dashboard-focus");
    }
    if (toolbar) {
      toolbar.classList.add("tsi-dashboard-toolbar");
      setImportantStyle(toolbar, "display", "flex");
      setImportantStyle(toolbar, "align-items", "center");
      setImportantStyle(toolbar, "justify-content", "center");
      setImportantStyle(toolbar, "gap", "1rem");
      setImportantStyle(toolbar, "flex-wrap", window.innerWidth <= 991 ? "wrap" : "nowrap");
    }
    if (searchBlock) {
      searchBlock.classList.add("tsi-dashboard-search");
      setImportantStyle(searchBlock, "display", "flex");
      setImportantStyle(searchBlock, "align-items", "center");
      setImportantStyle(searchBlock, "min-height", "46px");
      setImportantStyle(searchBlock, "margin-top", "0");
      setImportantStyle(searchBlock, "margin-bottom", "0");
      Array.prototype.forEach.call(searchBlock.querySelectorAll(".input-group-text,.btn,.btn-outline-secondary,button,span,div"), function (node) {
        if (node.contains(searchInput) && node !== searchBlock) {
          return;
        }
        setImportantStyle(node, "margin-top", "0");
        setImportantStyle(node, "margin-bottom", "0");
      });
      Array.prototype.forEach.call(searchBlock.querySelectorAll(".input-group-text,.btn,.btn-outline-secondary,button"), function (node) {
        setImportantStyle(node, "height", "46px");
        setImportantStyle(node, "min-height", "46px");
        setImportantStyle(node, "display", "inline-flex");
        setImportantStyle(node, "align-items", "center");
        setImportantStyle(node, "justify-content", "center");
        setImportantStyle(node, "padding-top", "0");
        setImportantStyle(node, "padding-bottom", "0");
      });
      Array.prototype.forEach.call(searchBlock.querySelectorAll("svg,i"), function (node) {
        setImportantStyle(node, "display", "block");
        setImportantStyle(node, "align-self", "center");
        setImportantStyle(node, "vertical-align", "middle");
      });
      Array.prototype.forEach.call(searchBlock.querySelectorAll(".input-group"), function (node) {
        setImportantStyle(node, "flex-wrap", "nowrap");
        setImportantStyle(node, "display", "flex");
        setImportantStyle(node, "align-items", "stretch");
      });
    }
    if (searchInput) {
      setImportantStyle(searchInput, "flex", "1 1 auto");
      setImportantStyle(searchInput, "width", "1%");
      setImportantStyle(searchInput, "min-width", "0");
      setImportantStyle(searchInput, "height", "46px");
      setImportantStyle(searchInput, "min-height", "46px");
      setImportantStyle(searchInput, "line-height", "46px");
      setImportantStyle(searchInput, "margin-top", "0");
      setImportantStyle(searchInput, "margin-bottom", "0");
      setImportantStyle(searchInput, "padding-top", "0");
      setImportantStyle(searchInput, "padding-bottom", "0");
    }
    if (sortBlock) {
      sortBlock.classList.add("tsi-dashboard-sort");
      setImportantStyle(sortBlock, "display", "flex");
      setImportantStyle(sortBlock, "align-items", "center");
      setImportantStyle(sortBlock, "margin-top", "0");
      setImportantStyle(sortBlock, "margin-bottom", "0");
      Array.prototype.forEach.call(sortBlock.querySelectorAll("button,.btn,[role='button']"), function (node) {
        setImportantStyle(node, "height", "46px");
        setImportantStyle(node, "min-height", "46px");
        setImportantStyle(node, "display", "inline-flex");
        setImportantStyle(node, "align-items", "center");
        setImportantStyle(node, "margin-top", "0");
        setImportantStyle(node, "margin-bottom", "0");
        setImportantStyle(node, "white-space", "nowrap");
      });
    }
    if (sortControl) {
      setImportantStyle(sortControl, "height", "46px");
      setImportantStyle(sortControl, "min-height", "46px");
      setImportantStyle(sortControl, "display", "inline-flex");
      setImportantStyle(sortControl, "align-items", "center");
    }
    if (filtersRow) {
      filtersRow.classList.add("tsi-dashboard-filters");
    }
    if (taskCard) {
      if (taskCard.parentElement) {
        taskCard.parentElement.classList.add("tsi-dashboard-taskcard-wrap");
        setImportantStyle(taskCard.parentElement, "display", "flex");
        setImportantStyle(taskCard.parentElement, "justify-content", "center");
        setImportantStyle(taskCard.parentElement, "width", "100%");
        setImportantStyle(taskCard.parentElement, "max-width", "100%");
        setImportantStyle(taskCard.parentElement, "flex", "0 0 100%");
        setImportantStyle(taskCard.parentElement, "clear", "both");
      }
      taskCard.classList.add("tsi-dashboard-taskcard");
      taskCard.classList.add("tsi-dashboard-action-target");
      setImportantStyle(taskCard, "width", "100%");
      setImportantStyle(taskCard, "max-width", "1120px");
      setImportantStyle(taskCard, "margin-left", "auto");
      setImportantStyle(taskCard, "margin-right", "auto");
    }

    normalizeDashboardOverviewCards(pageRoot, taskCard, filtersRow);
  }

  function findDashboardCardByTitle(titles) {
    return Array.prototype.find.call(document.querySelectorAll(".card"), function (card) {
      var text = getText(card).toLowerCase();
      return titles.some(function (title) {
        return text.indexOf(title) >= 0;
      });
    }) || null;
  }

  function ensureDashboardOverviewGrid(pageRoot, beforeNode) {
    if (!pageRoot) {
      return null;
    }

    var grid = pageRoot.querySelector(".tsi-dashboard-overview-grid");
    if (!grid) {
      grid = document.createElement("div");
      grid.className = "tsi-dashboard-overview-grid";

      var referenceNode = beforeNode && beforeNode.parentNode ? beforeNode.parentNode : beforeNode;
      if (referenceNode && referenceNode.parentNode) {
        referenceNode.parentNode.insertBefore(grid, referenceNode);
      } else {
        pageRoot.appendChild(grid);
      }
    }

    return grid;
  }

  function moveCardIntoOverviewGrid(grid, card) {
    if (!grid || !card) {
      return;
    }

    if (card.parentElement === grid) {
      card.classList.add("tsi-dashboard-overview-card");
      return;
    }

    var sourceParent = card.parentElement;
    if (sourceParent && sourceParent !== grid) {
      card.classList.add("tsi-dashboard-overview-card");
      grid.appendChild(card);

      if (!sourceParent.querySelector(".card:not([hidden])")) {
        sourceParent.style.display = "none";
      }
    }
  }

  function flashDashboardTarget(target) {
    if (!target) {
      return;
    }

    target.classList.add("tsi-dashboard-attention");
    window.setTimeout(function () {
      target.classList.remove("tsi-dashboard-attention");
    }, 1800);
  }

  function normalizeImpactLevel(level) {
    var normalized = String(level || "").toUpperCase();
    if (normalized === "CRITICAL" || normalized === "HIGH") {
      return { label: "High", variant: "danger" };
    }
    if (normalized === "SERIOUS" || normalized === "WARNING" || normalized === "MEDIUM") {
      return { label: "Medium", variant: "warning" };
    }
    return { label: "Low", variant: "info" };
  }

  function findTaskIdFromLocation() {
    var match = window.location.pathname.match(/^\/task\/([^/?#]+)/);
    return match ? match[1] : "";
  }

  function captureImpactContext(trigger) {
    if (!trigger) {
      return;
    }

    var title = "";
    var container = trigger.closest(".list-group-item,.card,.modal,.row,.col,[class*='task']");
    if (container) {
      var heading = container.querySelector("h1,h2,h3,h4,h5,h6,.fw-semibold");
      title = heading ? getText(heading) : "";
    }

    if (!title && /^\/task\//.test(window.location.pathname)) {
      var pageTitle = document.querySelector("h2");
      title = pageTitle ? getText(pageTitle) : "";
    }

    window.__tsiImpactContext = {
      taskId: findTaskIdFromLocation(),
      title: title,
      capturedAt: Date.now()
    };
  }

  function installImpactTriggerCapture() {
    if (window.__tsiImpactCaptureInstalled) {
      return;
    }

    window.__tsiImpactCaptureInstalled = true;
    document.addEventListener("click", function (event) {
      var trigger = event.target && event.target.closest("button,a,.btn,[role='button']");
      if (!trigger) {
        return;
      }

      var text = getText(trigger).toLowerCase().replace(/\s+/g, " ").trim();
      if (
        text === "impact"
        || text === "view impact"
        || text === "view full impact analysis"
        || text === "view full impact analysis ->"
        || text === "view impact ->"
      ) {
        captureImpactContext(trigger);
      }
    }, true);
  }

  async function resolveImpactTaskContext(modal) {
    var context = window.__tsiImpactContext || {};
    var titleNode = modal.querySelector("h4");
    var modalTitle = titleNode ? getText(titleNode).replace(/^if you miss\s*"?/i, "").replace(/"?$/, "").trim() : "";
    var taskId = context.taskId || findTaskIdFromLocation();
    var title = modalTitle || context.title || "";

    if (taskId) {
      return { taskId: taskId, title: title };
    }

    if (!title) {
      return null;
    }

    var tasksPayload = await fetchAuthenticatedJson("/tasks");
    var tasks = tasksPayload && tasksPayload.tasks ? tasksPayload.tasks : (Array.isArray(tasksPayload) ? tasksPayload : []);
    var matchedTask = Array.prototype.find.call(tasks, function (task) {
      return String(task.title || "").trim().toLowerCase() === title.toLowerCase();
    });

    if (!matchedTask) {
      return null;
    }

    return {
      taskId: matchedTask.id,
      title: matchedTask.title,
      task: matchedTask
    };
  }

  function inferTaskTheme(task, impactPayload) {
    var text = [
      task && task.title,
      task && task.description,
      task && task.category,
      impactPayload && impactPayload.summary,
      impactPayload && impactPayload.description
    ].join(" ").toLowerCase();

    if (/fee|payment|loan|emi|installment|bill|invoice/.test(text)) {
      return "payment";
    }
    if (/exam|assignment|academic|class|semester|submission|project/.test(text)) {
      return "academic";
    }
    if (/apply|application|interview|opportunity|internship|job|career/.test(text)) {
      return "opportunity";
    }
    if (/gym|health|habit|workout|exercise|personal/.test(text)) {
      return "personal";
    }
    return "general";
  }

  function buildConsequenceDrivenStep(consequences) {
    var joined = (consequences || []).map(function (item) {
      return String(item && item.description ? item.description : item || "").toLowerCase();
    }).join(" ");

    if (/stress|confidence/.test(joined)) {
      return "Reduce decision pressure by defining one exact next step and one finish point before you stop today.";
    }
    if (/related task|cascade|ripple|delay|momentum|productivity/.test(joined)) {
      return "Protect the rest of your schedule by finishing the blocking part first before starting any new task.";
    }
    if (/streak|xp|score/.test(joined)) {
      return "Add a checkpoint reminder so you can recover progress before this task starts hurting your streak or score.";
    }
    return "Use one short checkpoint later today to confirm the task is moving and not slipping silently.";
  }

  function buildRecoveryPlan(task, impactPayload) {
    if (impactPayload && impactPayload.recoveryPlan) {
      return {
        heading: impactPayload.recoveryPlan.heading || "Recovery Plan",
        summary: impactPayload.recoveryPlan.summary || "Use a short recovery plan now so this task does not create a bigger chain reaction.",
        steps: Array.isArray(impactPayload.recoveryPlan.steps) ? impactPayload.recoveryPlan.steps : []
      };
    }

    var normalizedTask = task || {};
    var dueDate = normalizedTask.dueDate ? new Date(normalizedTask.dueDate) : null;
    var hoursLeft = dueDate && !Number.isNaN(dueDate.getTime())
      ? Math.max(0, Math.round((dueDate.getTime() - Date.now()) / 3600000))
      : null;
    var theme = inferTaskTheme(normalizedTask, impactPayload);
    var urgencyPrefix = hoursLeft !== null && hoursLeft <= 24
      ? "Today"
      : hoursLeft !== null && hoursLeft <= 72
        ? "In the next day"
        : "This week";
    var firstStep = "Start with the first unfinished part of \"" + (normalizedTask.title || "this task") + "\" instead of planning around it.";
    var secondStep = "";

    if (theme === "payment") {
      secondStep = urgencyPrefix + ", confirm the payment route, amount, and proof so the task can be finished end-to-end in one sitting.";
    } else if (theme === "academic") {
      secondStep = urgencyPrefix + ", finish the submission-critical portion first, then review any formatting or document requirements after that.";
    } else if (theme === "opportunity") {
      secondStep = urgencyPrefix + ", complete the application essentials first: core form details, required document, and final review.";
    } else if (theme === "personal") {
      secondStep = urgencyPrefix + ", reduce friction by preparing the exact time, place, or material needed so the task becomes easy to start.";
    } else {
      secondStep = urgencyPrefix + ", break this into 2 or 3 recovery steps and finish the first one before switching to another task.";
    }

    var thirdStep = buildConsequenceDrivenStep(impactPayload && impactPayload.consequences);
    if (String(normalizedTask.priority || "").toUpperCase() === "HIGH" || String(normalizedTask.impact || "").toUpperCase() === "HIGH") {
      thirdStep = thirdStep + " Treat it as a protected priority item until the risky part is cleared.";
    }

    var summaryParts = [];
    if (impactPayload && impactPayload.recommendation) {
      summaryParts.push(String(impactPayload.recommendation));
    }
    if (hoursLeft !== null) {
      summaryParts.push(hoursLeft <= 24 ? "The deadline is very close, so recovery should start immediately." : "You still have time to recover if you move this task forward now.");
    }

    return {
      heading: "Recovery Plan",
      summary: summaryParts.join(" ") || "Use a short recovery plan now so this task does not create a bigger chain reaction.",
      steps: [firstStep, secondStep, thirdStep]
    };
  }

  function renderImpactModalContent(modal, task, impactPayload) {
    var body = modal.querySelector(".modal-body");
    var footer = modal.querySelector(".modal-footer");
    var header = modal.querySelector(".modal-header");
    if (!body || !footer) {
      return;
    }

    var severity = normalizeImpactLevel(
      impactPayload.severityLevel || impactPayload.impactLevel || impactPayload.impact
    );
    var taskTitle = (task && task.title) || impactPayload.title || "this task";
    var summary = impactPayload.summary || impactPayload.description || "This task has a measurable effect on nearby commitments if it slips.";
    var consequences = Array.isArray(impactPayload.consequences) ? impactPayload.consequences : [];

    if (header) {
      header.classList.remove("bg-danger", "bg-warning", "bg-info");
      header.classList.add("text-white", "bg-" + severity.variant);
    }

    body.innerHTML = [
      '<div class="tsi-impact-shell">',
      '<div class="text-center">',
      '<h4>If you miss "' + escapeHtml(taskTitle) + '"</h4>',
      '<p class="text-muted mb-0">Here is the task-specific impact analysis.</p>',
      "</div>",
      '<div class="tsi-impact-summary">',
      '<strong>Severity: ' + escapeHtml(severity.label) + "</strong>",
      '<p>' + escapeHtml(summary) + "</p>",
      "</div>",
      '<div><h6 class="fw-semibold mb-3">Potential Consequences</h6>',
      '<div class="tsi-impact-list">' + consequences.map(function (consequence) {
        var percent = consequence && typeof consequence.probabilityPercent !== "undefined"
          ? Number(consequence.probabilityPercent)
          : null;
        var label = consequence && consequence.description ? consequence.description : String(consequence || "Related task impact");
        return [
          '<div class="tsi-impact-item">',
          '<div class="tsi-impact-item-head">',
          '<span class="tsi-impact-item-label">' + escapeHtml(label) + "</span>",
          percent !== null ? '<span class="tsi-impact-item-probability text-' + (percent >= 70 ? "danger" : "warning") + '">' + escapeHtml(percent) + "%</span>" : "",
          "</div>",
          percent !== null ? '<div class="tsi-impact-bar"><span style="width:' + Math.max(0, Math.min(100, percent)) + '%;"></span></div>' : "",
          "</div>"
        ].join("");
      }).join("") + "</div></div>",
      '<div data-tsi-role="recovery"></div>',
      "</div>"
    ].join("");

    footer.innerHTML = [
      '<button type="button" class="tsi-impact-button tsi-impact-button-secondary" data-bs-dismiss="modal">Close</button>',
      '<button type="button" class="tsi-impact-button tsi-impact-button-primary" data-tsi-role="recovery-trigger">Create Recovery</button>'
    ].join("");

    var recoveryTrigger = footer.querySelector('[data-tsi-role="recovery-trigger"]');
    var recoveryHost = body.querySelector('[data-tsi-role="recovery"]');
    if (recoveryTrigger && recoveryHost) {
      recoveryTrigger.addEventListener("click", function () {
        if (recoveryHost.innerHTML) {
          recoveryHost.innerHTML = "";
          recoveryTrigger.textContent = "Create Recovery";
          return;
        }

        var recovery = buildRecoveryPlan(task, impactPayload);
        recoveryHost.innerHTML = [
          '<div class="tsi-recovery-panel">',
          '<h6>' + escapeHtml(recovery.heading) + "</h6>",
          '<p>' + escapeHtml(recovery.summary) + "</p>",
          '<ul>' + recovery.steps.map(function (step) {
            return "<li>" + escapeHtml(step) + "</li>";
          }).join("") + "</ul>",
          "</div>"
        ].join("");
        recoveryTrigger.textContent = "Hide Recovery";
      });
    }
  }

  async function enhanceImpactSimulationExperience() {
    installImpactTriggerCapture();

    var modal = Array.prototype.find.call(document.querySelectorAll(".modal"), function (node) {
      return /impact simulation/i.test(getText(node));
    });
    if (!modal) {
      return;
    }

    if (!modal.classList.contains("show") && modal.style.display !== "block") {
      modal.removeAttribute("data-tsi-impact-open");
      modal.removeAttribute("data-tsi-impact-key");
      return;
    }

    var context = await resolveImpactTaskContext(modal);
    if (!context || !context.taskId) {
      return;
    }

    var impactKey = context.taskId + ":" + (context.title || "");
    if (modal.getAttribute("data-tsi-impact-open") === "true" && modal.getAttribute("data-tsi-impact-key") === impactKey) {
      return;
    }

    modal.setAttribute("data-tsi-impact-open", "true");
    modal.setAttribute("data-tsi-impact-key", impactKey);

    try {
      var impactPayload = await fetchAuthenticatedJson("/tasks/" + context.taskId + "/impact");
      renderImpactModalContent(modal, context.task || { id: context.taskId, title: context.title }, impactPayload || {});
    } catch (error) {
      console.error("Error enhancing impact simulation:", error);
    }
  }

  function removeCognitiveLoadActions(card) {
    if (!card) {
      return;
    }

    Array.prototype.forEach.call(card.querySelectorAll("button,a,.btn,[role='button'],div,span,p,strong"), function (node) {
      var text = getText(node).toLowerCase().replace(/\s+/g, " ").trim();
      if (text !== "view active tasks" && text !== "review and prioritize") {
        return;
      }

      var target = node.closest("button,a,.btn,[role='button']") || node;
      if (!target) {
        return;
      }

      target.style.display = "none";
      target.setAttribute("hidden", "hidden");
    });
  }

  function normalizeDashboardOverviewCards(pageRoot, taskCard, filtersRow) {
    var aiFailureCard = findDashboardCardByTitle(["ai failure predictions"]);
    if (aiFailureCard) {
      var aiFailureContainer = aiFailureCard.parentElement;
      aiFailureCard.style.display = "none";
      aiFailureCard.setAttribute("hidden", "hidden");
      if (aiFailureContainer && aiFailureContainer !== pageRoot && !aiFailureContainer.querySelector(".card:not([hidden])")) {
        aiFailureContainer.style.display = "none";
      }
    }

    var overviewCards = [
      findDashboardCardByTitle(["critical alerts"]),
      findDashboardCardByTitle(["cognitive load"])
    ].filter(Boolean);

    if (!overviewCards.length) {
      return;
    }

    var grid = ensureDashboardOverviewGrid(pageRoot, taskCard);
    if (!grid) {
      return;
    }

    grid.classList.toggle("tsi-dashboard-overview-single", overviewCards.length <= 1);

    overviewCards.forEach(function (card) {
      moveCardIntoOverviewGrid(grid, card);
    });

    var cognitiveLoadCard = findDashboardCardByTitle(["cognitive load"]);
    removeCognitiveLoadActions(cognitiveLoadCard);

    bindDashboardActionButtons(grid, taskCard, filtersRow);
  }

  function bindDashboardActionButtons(grid, taskCard, filtersRow) {
    Array.prototype.forEach.call(grid.querySelectorAll("button,a,.btn,[role='button'],div,span,p,strong"), function (node) {
      if (!node) {
        return;
      }

      var text = getText(node).toLowerCase().replace(/\s+/g, " ").trim();
      if (text !== "view active tasks" && text !== "review and prioritize") {
        return;
      }

      var button = node.closest("button,a,.btn,[role='button']") || node;
      if (!button || button.dataset.tsiDashboardBound === "true") {
        return;
      }

      button.dataset.tsiDashboardBound = "true";
      button.style.cursor = "pointer";
      if (!button.matches("button,a,[role='button']")) {
        button.setAttribute("role", "button");
        button.setAttribute("tabindex", "0");
      }

      function handleDashboardAction(event) {
        event.preventDefault();
        event.stopPropagation();

        if (text === "view active tasks" && taskCard) {
          taskCard.scrollIntoView({ behavior: "smooth", block: "start" });
          flashDashboardTarget(taskCard);
          return;
        }

        var target = filtersRow || taskCard;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          flashDashboardTarget(target);
        }
      }

      button.addEventListener("click", handleDashboardAction);
      button.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          handleDashboardAction(event);
        }
      });
    });
  }

  function removeSwitchAccountOption() {
    Array.prototype.forEach.call(document.querySelectorAll("button,a,div,span,p,li"), function (node) {
      if (!node || node.dataset && node.dataset.tsiSwitchProcessed) {
        return;
      }

      var text = getText(node);
      if (!/^switch account$/i.test(text)) {
        return;
      }

      node.dataset.tsiSwitchProcessed = "true";

      var target = node.closest('[role="menuitem"],button,a,li,.dropdown-item,.list-group-item,.list-group-item-action,.menu-item,.nav-link,.btn');
      if (!target) {
        target = node.closest(".card,.dropdown-menu,.popover,.modal,.offcanvas,.list-group,.nav-item") || node;
      }

      if (target) {
        target.style.display = "none";
        target.setAttribute("hidden", "hidden");
      }
    });
  }

  function findHeaderActionsContainer() {
    var actionables = Array.prototype.filter.call(document.querySelectorAll("button,a,[role='button']"), function (node) {
      if (!node || node.id === "tsi-global-dashboard-link") {
        return false;
      }

      var rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return false;
      }

      return rect.top >= 0 &&
        rect.top <= 180 &&
        rect.left >= window.innerWidth * 0.5 &&
        rect.right <= window.innerWidth &&
        rect.width >= 28 &&
        rect.height >= 28;
    });

    if (!actionables.length) {
      return null;
    }

    var topRow = Math.min.apply(null, actionables.map(function (node) {
      return node.getBoundingClientRect().top;
    }));

    var rowButtons = actionables.filter(function (node) {
      return Math.abs(node.getBoundingClientRect().top - topRow) <= 18;
    });

    if (!rowButtons.length) {
      return null;
    }

    var common = findCommonAncestor(rowButtons);
    while (common && common !== document.body) {
      var rect = common.getBoundingClientRect();
      if (rect.top >= 0 &&
        rect.top <= 180 &&
        rect.left >= window.innerWidth * 0.42 &&
        rect.right <= window.innerWidth &&
        rect.width <= window.innerWidth * 0.55) {
        return common;
      }
      common = common.parentElement;
    }

    return rowButtons[0].parentElement || null;
  }

  function ensureDashboardShortcut() {
    installStyles();

    var existing = document.getElementById("tsi-global-dashboard-link");
    if (window.location.pathname === "/dashboard") {
      if (existing) {
        existing.remove();
      }
      return;
    }

    var actionsContainer = findHeaderActionsContainer();
    if (!actionsContainer) {
      if (existing) {
        existing.remove();
      }
      return;
    }

    actionsContainer.classList.add("tsi-header-actionbar");

    var shortcut = existing || document.createElement("a");
    shortcut.id = "tsi-global-dashboard-link";
    shortcut.className = "tsi-header-dashboard-link tsi-topbar-link";
    shortcut.href = "/dashboard";
    shortcut.title = "Go to Dashboard";
    shortcut.setAttribute("aria-label", "Go to Dashboard");
    if (!shortcut.innerHTML) {
      shortcut.innerHTML = [
        '<svg viewBox="0 0 24 24" aria-hidden="true">',
        '<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.2"></rect>',
        '<rect x="14" y="3.5" width="6.5" height="6.5" rx="1.2"></rect>',
        '<rect x="3.5" y="14" width="6.5" height="6.5" rx="1.2"></rect>',
        '<rect x="14" y="14" width="6.5" height="6.5" rx="1.2"></rect>',
        "</svg>"
      ].join("");
    }

    var firstAction = Array.prototype.find.call(actionsContainer.children, function (child) {
      return child !== shortcut && child.matches && child.matches("button,a,[role='button'],div");
    });

    if (shortcut.parentElement !== actionsContainer) {
      if (firstAction) {
        actionsContainer.insertBefore(shortcut, firstAction);
      } else {
        actionsContainer.appendChild(shortcut);
      }
    } else if (actionsContainer.firstElementChild !== shortcut) {
      actionsContainer.insertBefore(shortcut, actionsContainer.firstElementChild);
    }
  }

  function enhanceSharedNavigation() {
    removeSwitchAccountOption();
    ensureDashboardShortcut();
    enhanceImpactSimulationExperience();
  }

