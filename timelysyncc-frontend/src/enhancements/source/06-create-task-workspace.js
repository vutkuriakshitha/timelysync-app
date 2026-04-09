  function ensurePanel(card, fileInput) {
    var existing = card.querySelector(".tsi-panel");
    if (existing) {
      return existing;
    }

    var dropZone = card.querySelector(".border.border-dashed");
    if (!dropZone || !dropZone.parentNode) {
      return null;
    }

    var panel = document.createElement("div");
    panel.className = "tsi-panel";
    panel.innerHTML = [
      '<section class="tsi-step-card">',
      '<div class="tsi-step-header">',
      '<span class="tsi-step-number">Step 1</span>',
      '<div><h6>Upload Document</h6><p>Choose a PDF, image, screenshot, or paste the document text below. SmartIntake will analyze it before anything is added to the task form.</p></div>',
      "</div>",
      '<div class="tsi-step-meta">Supported formats: PDF, JPG, PNG, TXT</div>',
      '<div style="margin-top:1rem;">',
      '<div class="tsi-block-title">Optional pasted text</div>',
      '<textarea class="tsi-input" data-tsi-role="text" placeholder="Paste notice, circular, email, or official document text here..."></textarea>',
      '<div class="tsi-inline-note">Use pasted text when OCR is unclear or if the content came from email text.</div>',
      "</div>",
      '<div class="tsi-actions">',
      '<button type="button" class="tsi-button tsi-button-primary" data-tsi-role="analyze">Analyze with SmartIntake</button>',
      '<button type="button" class="tsi-button tsi-button-secondary" data-tsi-role="clear">Clear</button>',
      "</div>",
      '<div class="tsi-filename" data-tsi-role="filename"></div>',
      '<div class="tsi-status tsi-status-info" data-tsi-role="status" hidden></div>',
      "</section>",
      '<div class="tsi-preview" data-tsi-role="preview" hidden></div>'
    ].join("");

    dropZone.insertAdjacentElement("afterend", panel);
    return panel;
  }

  function ensureWorkspace(column, formCard, smartCard, mode) {
    var workspace = column.querySelector(".tsi-workspace");
    var mainColumn;
    var sideColumn;

    if (!workspace) {
      workspace = document.createElement("div");
      workspace.className = "tsi-workspace";

      mainColumn = document.createElement("div");
      mainColumn.className = "tsi-main-column";

      sideColumn = document.createElement("aside");
      sideColumn.className = "tsi-side-column";

      workspace.appendChild(mainColumn);
      workspace.appendChild(sideColumn);
      column.appendChild(workspace);
    } else {
      mainColumn = workspace.querySelector(".tsi-main-column");
      sideColumn = workspace.querySelector(".tsi-side-column");
    }

    if (formCard && formCard.parentNode !== mainColumn) {
      mainColumn.appendChild(formCard);
    }
    if (smartCard) {
      var smartTarget = mode === "smart" ? mainColumn : sideColumn;
      if (smartCard.parentNode !== smartTarget) {
        smartTarget.appendChild(smartCard);
      }
    }

    return {
      workspace: workspace,
      mainColumn: mainColumn,
      sideColumn: sideColumn
    };
  }

  function findFieldBlock(form, labelPrefix, wrapperSelector) {
    var labels = Array.prototype.slice.call(form.querySelectorAll("label"));
    var label = labels.find(function (element) {
      return String(element.textContent || "").trim().indexOf(labelPrefix) === 0;
    });
    return label ? label.closest(wrapperSelector) : null;
  }

  function insertSectionMarker(target, key, title, text) {
    if (!target || target.previousElementSibling && target.previousElementSibling.dataset && target.previousElementSibling.dataset.tsiSection === key) {
      return;
    }

    var marker = document.createElement("div");
    marker.className = "tsi-section-marker";
    marker.dataset.tsiSection = key;
    marker.innerHTML = [
      '<p class="tsi-section-marker-title">' + escapeHtml(title) + "</p>",
      '<p class="tsi-section-marker-text">' + escapeHtml(text) + "</p>"
    ].join("");
    target.parentNode.insertBefore(marker, target);
  }

  function structureManualForm(formCard) {
    if (!formCard) {
      return;
    }

    formCard.classList.add("tsi-manual-card");

    var header = formCard.querySelector(".card-header");
    if (header && !header.dataset.tsiStructured) {
      header.dataset.tsiStructured = "true";
      header.innerHTML = [
        '<div class="tsi-card-kicker">Manual Add</div>',
        '<h4 class="tsi-card-title">Create a task with full control</h4>',
        '<p class="tsi-card-subtitle">Add the task manually or use SmartIntake on the right to prefill the fields and review the result before saving.</p>'
      ].join("");
    }

    var form = formCard.querySelector("form");
    if (!form) {
      return;
    }

    var basicBlock = findFieldBlock(form, "Task Title", ".mb-2");
    var planningBlock = findFieldBlock(form, "Priority", ".row");
    var notesBlock = findFieldBlock(form, "Tags", ".mb-2");
    var actionRow = form.querySelector(".d-flex.gap-2.mt-4");

    insertSectionMarker(basicBlock, "basic", "Task Details", "Define the title, description, category, and due date.");
    insertSectionMarker(planningBlock, "planning", "Planning & Risk", "Set priority, impact, and effort so TimelySync can evaluate urgency.");
    insertSectionMarker(notesBlock, "notes", "Context", "Add tags or short notes only if they help with follow-up.");

    if (actionRow) {
      actionRow.classList.add("tsi-actions-row");
      Array.prototype.forEach.call(actionRow.querySelectorAll("button, .btn"), function (button) {
        var label = String(button.textContent || "").trim().toLowerCase();
        if (label.indexOf("create") >= 0) {
          button.classList.add("tsi-primary-action");
        } else if (label.indexOf("cancel") >= 0) {
          button.classList.add("tsi-secondary-action");
        }
      });
    }
  }

  function ensureAiPanel(sideColumn) {
    var panel = sideColumn.querySelector(".tsi-ai-panel");
    if (panel) {
      return panel;
    }

    panel = document.createElement("div");
    panel.className = "card tsi-ai-panel";
    panel.innerHTML = [
      '<div class="card-header">',
      '<div class="tsi-card-kicker">AI Risk & Recommendations</div>',
      '<h5 class="tsi-card-title" style="font-size:1.05rem;margin-top:.15rem;">Smart guidance for this task</h5>',
      '<p class="tsi-card-subtitle" style="color:#5d6e86;">Risk score, estimated effort, and recommendations appear here after you add task details or run analysis.</p>',
      "</div>",
      '<div class="card-body"><div class="tsi-ai-stack" data-tsi-role="ai-content"></div></div>'
    ].join("");
    sideColumn.appendChild(panel);
    return panel;
  }

  function syncAiPanel(formCard, sideColumn) {
    if (!formCard || !sideColumn) {
      return;
    }

    var aiPanel = ensureAiPanel(sideColumn);
    var content = aiPanel.querySelector('[data-tsi-role="ai-content"]');
    if (!content) {
      return;
    }

    var alerts = Array.prototype.filter.call(formCard.querySelectorAll(".alert"), function (alert) {
      var text = String(alert.textContent || "").toLowerCase();
      return text.indexOf("live risk score") >= 0 || text.indexOf("ai task analysis") >= 0;
    });

    content.innerHTML = "";

    if (!alerts.length && SMART_STATE.response && SMART_STATE.response.task && window.location.pathname === "/create-task" && getCreateTaskMode() === "manual") {
      renderDraftAiContent(content, SMART_STATE.response.task);
      return;
    }

    if (!alerts.length) {
      content.innerHTML = '<div class="tsi-ai-placeholder">After you choose priority, impact, effort, or run SmartIntake, TimelySync will show the live risk score and recommendations here.</div>';
      return;
    }

    alerts.forEach(function (alert) {
      content.appendChild(alert);
    });
  }

  function restoreSmartDraftToForm() {
    if (SMART_STATE.restoredDraft) {
      return;
    }

    var draft = consumeSmartDraft();
    SMART_STATE.restoredDraft = true;

    if (!draft || !draft.task) {
      return;
    }

    applyTaskToForm(draft.task);
    SMART_STATE.response = draft;
    SMART_STATE.applied = true;
  }

  function getErrorMessage(error, fallback) {
    if (!error) {
      return fallback;
    }

    if (typeof error === "string") {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    return fallback;
  }

  function parseApiError(payload, fallback) {
    if (!payload) {
      return fallback;
    }

    if (typeof payload === "string") {
      return payload;
    }

    return payload.message || payload.error || fallback;
  }

  function shouldReplaceExistingValues() {
    if (!formHasManualValues()) {
      return true;
    }

    return window.confirm("Replace the current task details with SmartIntake suggestions?");
  }

  function setMessage(type, text) {
    SMART_STATE.messageType = type;
    SMART_STATE.message = text;
  }

  function applySmartIntakeToForm() {
    var payload = SMART_STATE.response;
    if (!payload || !payload.task) {
      return;
    }

    SMART_STATE.applied = true;
    saveSmartDraft(payload);
    window.location.href = "/create-task";
  }

  async function analyzeDocument(fileInput, textArea) {
    var token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }

    var file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
    var pastedText = textArea ? String(textArea.value || "").trim() : "";

    SMART_STATE.pastedText = pastedText;

    if (!file && !pastedText) {
      setMessage("warning", "Upload a document or paste some text so SmartIntake can analyze it.");
      return;
    }

    if (file && file.size > 10 * 1024 * 1024) {
      setMessage("warning", "The selected document is larger than 10MB. Please choose a smaller file.");
      return;
    }

    SMART_STATE.analyzing = true;
    SMART_STATE.response = null;
    SMART_STATE.applied = false;
    setMessage("info", "SmartIntake is reading the document and extracting task details...");
    enhanceCreateTaskPage();

    var formData = new FormData();
    if (file) {
      formData.append("file", file);
    }
    if (pastedText) {
      formData.append("text", pastedText);
    }

    try {
      var response = await fetch(API_BASE + "/smart-intake/analyze", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token
        },
        body: formData
      });

      var payload = await response.json().catch(function () {
        return null;
      });

      if (!response.ok) {
        throw new Error(parseApiError(payload, "SmartIntake could not analyze this document."));
      }

      if (!payload || !payload.task) {
        throw new Error("SmartIntake returned an incomplete response. Please try again.");
      }

      SMART_STATE.response = payload;
      SMART_STATE.analyzing = false;
      SMART_STATE.applied = false;
      setMessage("success", payload.message || "SmartIntake finished analyzing. Review the summary and apply it to the task form when you are ready.");
      enhanceCreateTaskPage();

      var previewCard = document.querySelector('[data-tsi-role="preview"]');
      if (previewCard) {
        previewCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (error) {
      SMART_STATE.analyzing = false;
      setMessage("danger", getErrorMessage(error, "SmartIntake could not analyze the document."));
      enhanceCreateTaskPage();
    }
  }

  function clearSmartIntake(fileInput, textArea) {
    SMART_STATE.pastedText = "";
    SMART_STATE.fileName = "";
    SMART_STATE.response = null;
    SMART_STATE.analyzing = false;
    SMART_STATE.message = "";
    SMART_STATE.messageType = "";
    SMART_STATE.applied = false;

    if (fileInput) {
      fileInput.value = "";
    }
    if (textArea) {
      textArea.value = "";
    }

    enhanceCreateTaskPage();
  }

  function enhanceCreateTaskPage() {
    if (window.location.pathname !== "/create-task") {
      return;
    }

    installStyles();
    var mode = getCreateTaskMode();

    var pageRoot = document.querySelector(".container-fluid.py-4");
    if (pageRoot) {
      pageRoot.classList.add("tsi-create-page");
      pageRoot.classList.toggle("tsi-smart-mode", mode === "smart");
      pageRoot.classList.toggle("tsi-manual-mode", mode === "manual");
      ensureModeSwitch(pageRoot, mode);
    }

    var row = pageRoot ? pageRoot.querySelector(".row") : null;
    var column = row ? row.querySelector(".col-lg-8.mx-auto") : null;
    var allCards = column ? Array.prototype.slice.call(column.querySelectorAll(".card")) : [];
    var formCard = allCards.find(function (card) {
      return card.dataset.tsiCard === "manual";
    }) || (allCards[0] || null);
    var smartCard = allCards.find(function (card) {
      return card.dataset.tsiCard === "smart";
    }) || (allCards[1] || null);

    if (formCard && !formCard.dataset.tsiCard) {
      formCard.dataset.tsiCard = "manual";
    }
    if (smartCard && !smartCard.dataset.tsiCard) {
      smartCard.dataset.tsiCard = "smart";
    }

    if (column && formCard && smartCard) {
      var workspace = ensureWorkspace(column, formCard, smartCard, mode);
      formCard.classList.add("tsi-manual-card");
      smartCard.classList.add("tsi-smart-card");
      structureManualForm(formCard);

      if (mode === "manual") {
        restoreSmartDraftToForm();
        syncAiPanel(formCard, workspace.sideColumn);
      }
    }

    var fileInput = document.getElementById("smart-upload");
    if (!fileInput) {
      return;
    }

    var card = fileInput.closest(".card");
    if (!card) {
      return;
    }

    var heading = card.querySelector("h5");
    if (heading) {
      heading.textContent = "SmartIntake";
    }

    var intro = card.querySelector(".card-body > p.text-muted.small");
    if (intro) {
      intro.textContent = "Upload a PDF, image, screenshot, notice, or email and let TimelySync extract deadlines, rules, and impact automatically.";
    }

    var chooseFileButton = Array.prototype.find.call(card.querySelectorAll("button"), function (button) {
      var text = String(button.textContent || "").trim();
      return text === "Choose File" || text === "Choose Document" || text === "Document Selected";
    });
    if (chooseFileButton) {
      chooseFileButton.textContent = "Choose Document";
    }

    fileInput.accept = ".pdf,.jpg,.jpeg,.png,.txt";

    var panel = ensurePanel(card, fileInput);
    if (!panel) {
      return;
    }

    var textArea = panel.querySelector('[data-tsi-role="text"]');
    var analyzeButton = panel.querySelector('[data-tsi-role="analyze"]');
    var clearButton = panel.querySelector('[data-tsi-role="clear"]');
    var fileName = panel.querySelector('[data-tsi-role="filename"]');
    var status = panel.querySelector('[data-tsi-role="status"]');
    var preview = panel.querySelector('[data-tsi-role="preview"]');

    if (textArea && textArea.value !== SMART_STATE.pastedText) {
      textArea.value = SMART_STATE.pastedText;
    }

    if (!fileInput.dataset.tsiBound) {
      fileInput.dataset.tsiBound = "true";
      fileInput.addEventListener("change", function () {
        updateFileName(fileInput, fileName, analyzeButton, chooseFileButton, textArea);
      });
    }

    if (textArea && !textArea.dataset.tsiBound) {
      textArea.dataset.tsiBound = "true";
      textArea.addEventListener("input", function () {
        SMART_STATE.pastedText = textArea.value;
        updateFileName(fileInput, fileName, analyzeButton, chooseFileButton, textArea);
      });
    }

    if (analyzeButton && !analyzeButton.dataset.tsiBound) {
      analyzeButton.dataset.tsiBound = "true";
      analyzeButton.addEventListener("click", function () {
        analyzeDocument(fileInput, textArea);
      });
    }

    if (clearButton && !clearButton.dataset.tsiBound) {
      clearButton.dataset.tsiBound = "true";
      clearButton.addEventListener("click", function () {
        clearSmartIntake(fileInput, textArea);
      });
    }

    analyzeButton.disabled = SMART_STATE.analyzing;
    analyzeButton.textContent = SMART_STATE.analyzing ? "Analyzing..." : "Analyze with SmartIntake";
    clearButton.disabled = SMART_STATE.analyzing;

    updateFileName(fileInput, fileName, analyzeButton, chooseFileButton, textArea);
    renderStatus(status);
    renderPreview(preview);

    var applyButton = preview.querySelector('[data-tsi-role="apply"]');
    if (applyButton && !applyButton.dataset.tsiBound) {
      applyButton.dataset.tsiBound = "true";
      applyButton.addEventListener("click", function () {
        applySmartIntakeToForm();
      });
    }

    var params = new URLSearchParams(window.location.search);
    if (params.get("smart") === "true" && !SMART_STATE.highlighted) {
      SMART_STATE.highlighted = true;
      card.classList.add("tsi-highlight");
      card.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(function () {
        card.classList.remove("tsi-highlight");
      }, 2000);
    }
  }

