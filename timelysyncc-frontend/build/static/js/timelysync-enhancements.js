(function () {
  var API_BASE = window.__TIMELYSYNC_API_BASE__ || "http://localhost:8080/api";
  var SMART_STATE = {
    pastedText: "",
    fileName: "",
    analyzing: false,
    message: "",
    messageType: "",
    response: null,
    applied: false,
    restoredDraft: false,
    highlighted: false,
    scheduled: false,
    lastRoute: ""
  };
  var SMART_DRAFT_STORAGE_KEY = "timelysync.smartDraft";
  var ACCOUNTABILITY_STATE = {
    loading: false,
    loaded: false,
    error: "",
    tasks: [],
    summary: null,
    lastFetchedAt: 0
  };
  var AUTH_UI_STATE = {
    submitting: false,
    message: "",
    messageType: "",
    forgotMessage: "",
    googleMessage: "",
    email: "",
    password: ""
  };
  var SIGNUP_UI_STATE = {
    mode: "signup",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
    submitting: false,
    message: "",
    messageType: "",
    deliveryNote: ""
  };
  var RESET_UI_STATE = {
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
    codeSent: false,
    submitting: false,
    message: "",
    messageType: "",
    deliveryNote: ""
  };
  var REMEMBERED_EMAIL_KEY = "timelysync.rememberedEmail";

  function installStyles() {
    if (document.getElementById("timelysync-enhancement-styles")) {
      return;
    }

    var style = document.createElement("style");
    style.id = "timelysync-enhancement-styles";
    style.textContent = [
      ".tsi-panel{margin-top:1rem;display:flex;flex-direction:column;gap:.95rem;}",
      ".tsi-panel h6{margin:0 0 .2rem 0;font-size:1rem;font-weight:700;color:#0f4ec9;}",
      ".tsi-panel p{margin:0;color:#526072;font-size:.92rem;line-height:1.5;}",
      ".tsi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.75rem;margin-top:1rem;}",
      ".tsi-input{width:100%;border:1px solid #cfe0ff;border-radius:12px;padding:.8rem .95rem;font-size:.95rem;min-height:118px;resize:vertical;background:#fff;outline:none;}",
      ".tsi-input:focus{border-color:#1d6cff;box-shadow:0 0 0 3px rgba(29,108,255,.12);}",
      ".tsi-actions{display:flex;flex-direction:column;gap:.7rem;align-items:center;justify-content:center;margin-top:1rem;}",
      ".tsi-button{border:none;border-radius:12px;padding:.72rem 1rem;font-weight:600;cursor:pointer;transition:transform .15s ease,box-shadow .15s ease;}",
      ".tsi-button:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(15,78,201,.14);}",
      ".tsi-button-primary{background:#1763ff;color:#fff;}",
      ".tsi-actions .tsi-button-primary{min-width:260px;display:inline-flex;align-items:center;justify-content:center;}",
      ".tsi-button-secondary{background:#fff;color:#1b3a68;border:1px solid #cfe0ff;}",
      ".tsi-button-ready{background:linear-gradient(135deg,#0f9f68 0%,#13c17b 100%)!important;color:#fff!important;box-shadow:0 14px 28px rgba(15,159,104,.24)!important;}",
      ".tsi-button-block{display:flex;gap:.7rem;flex-wrap:wrap;margin-top:1rem;}",
      ".tsi-button-block .tsi-button{flex:1 1 180px;justify-content:center;display:inline-flex;align-items:center;}",
      ".tsi-filename{font-size:.9rem;color:#4d5d73;}",
      ".tsi-filename-ready{color:#137b4c;font-weight:700;}",
      ".tsi-upload-ready{background:linear-gradient(135deg,#ecfff5 0%,#d9ffeb 100%)!important;border-color:#7bd7a8!important;color:#0d7d48!important;box-shadow:0 10px 22px rgba(19,123,76,.12)!important;}",
      ".tsi-status{margin-top:1rem;padding:.8rem .95rem;border-radius:12px;font-size:.93rem;}",
      ".tsi-status-info{background:#e8f1ff;color:#14499b;}",
      ".tsi-status-success{background:#e9f8ef;color:#1c7a42;}",
      ".tsi-status-warning{background:#fff4df;color:#8a5b00;}",
      ".tsi-status-danger{background:#ffe8e8;color:#a11d2f;}",
      ".tsi-preview{margin-top:.1rem;display:flex;flex-direction:column;gap:.95rem;}",
      ".tsi-preview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-top:.8rem;}",
      ".tsi-chip-list{display:flex;flex-wrap:wrap;gap:.45rem;}",
      ".tsi-chip{display:inline-flex;align-items:center;padding:.3rem .6rem;border-radius:999px;background:#edf3ff;color:#2554b8;font-size:.82rem;font-weight:600;}",
      ".tsi-block-title{font-size:.8rem;text-transform:uppercase;letter-spacing:.06em;color:#6b7a91;margin-bottom:.35rem;font-weight:700;}",
      ".tsi-list{margin:0;padding-left:1rem;color:#39485c;}",
      ".tsi-list li{margin-bottom:.3rem;}",
      ".tsi-highlight{box-shadow:0 0 0 3px rgba(23,99,255,.14),0 24px 50px rgba(23,99,255,.12)!important;transform:translateY(-2px);transition:all .2s ease;}",
      ".tsi-inline-note{margin-top:.75rem;font-size:.87rem;color:#5d6b80;}",
      ".tsi-step-card{border:1px solid #dce6fb;border-radius:18px;background:linear-gradient(180deg,#fbfdff 0%,#f6faff 100%);padding:1rem 1rem 1.05rem;box-shadow:0 10px 24px rgba(26,72,152,.06);}",
      ".tsi-step-header{display:flex;align-items:flex-start;gap:.8rem;}",
      ".tsi-step-number{display:inline-flex;align-items:center;justify-content:center;min-width:70px;padding:.3rem .65rem;border-radius:999px;background:#e8f1ff;color:#1454c6;font-size:.78rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;}",
      ".tsi-step-meta{margin-top:.8rem;font-size:.84rem;color:#6b7a91;}",
      ".tsi-summary-card{margin-top:.85rem;padding:1rem;border-radius:16px;border:1px solid #dbe7ff;background:#fff;}",
      ".tsi-summary-stack{display:flex;flex-direction:column;gap:.7rem;margin-top:.9rem;}",
      ".tsi-summary-row{display:grid;grid-template-columns:110px minmax(0,1fr);gap:.8rem;align-items:start;padding:.72rem .8rem;border-radius:14px;background:#f8fbff;border:1px solid #ecf2ff;}",
      ".tsi-summary-label{font-size:.78rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#63728a;}",
      ".tsi-meta-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.65rem;margin-top:.85rem;}",
      ".tsi-meta-card{padding:.75rem .8rem;border-radius:14px;background:#f8fbff;border:1px solid #ecf2ff;}",
      ".tsi-meta-card strong{display:block;font-size:.76rem;letter-spacing:.05em;text-transform:uppercase;color:#6c7990;margin-bottom:.15rem;}",
      ".tsi-details{border:1px solid #dce6fb;border-radius:18px;background:#fff;overflow:hidden;}",
      ".tsi-details summary{list-style:none;display:flex;align-items:center;gap:.8rem;padding:1rem;cursor:pointer;font-weight:700;color:#163d7a;}",
      ".tsi-details summary::-webkit-details-marker{display:none;}",
      ".tsi-details[open] summary{border-bottom:1px solid #edf2ff;}",
      ".tsi-details-content{padding:0 1rem 1rem;display:flex;flex-direction:column;gap:.9rem;}",
      ".tsi-detail-group{padding:.85rem .9rem;border-radius:14px;background:#f8fbff;border:1px solid #edf2ff;}",
      ".tsi-detail-group p{margin:0;color:#425167;font-size:.92rem;line-height:1.55;}",
      ".tsi-create-page{max-width:1320px;margin:0 auto;padding:1.1rem 1rem 2rem;}",
      ".tsi-create-page>.row{display:block;margin:0;}",
      ".tsi-create-page>.row>.col-lg-8.mx-auto{width:100%;max-width:none;flex:none;padding:0;}",
      ".tsi-workspace{display:grid;grid-template-columns:minmax(0,1.72fr) minmax(320px,.78fr);gap:1.6rem;align-items:start;}",
      ".tsi-main-column,.tsi-side-column{display:flex;flex-direction:column;gap:1rem;min-width:0;}",
      ".tsi-manual-card,.tsi-smart-card,.tsi-ai-panel{margin:0!important;border:1px solid #e4ebff;border-radius:22px;overflow:hidden;box-shadow:0 18px 42px rgba(20,59,138,.08)!important;background:#fff;}",
      ".tsi-manual-card .card-header{padding:1rem 1.25rem;background:linear-gradient(135deg,#0f62fe 0%,#1f83ff 100%)!important;border-bottom:none;}",
      ".tsi-smart-card .card-body,.tsi-manual-card .card-body,.tsi-ai-panel .card-body{padding:1.1rem 1.2rem;}",
      ".tsi-card-kicker{font-size:.77rem;letter-spacing:.08em;text-transform:uppercase;opacity:.78;font-weight:700;}",
      ".tsi-card-title{font-size:1.15rem;font-weight:700;margin:0;}",
      ".tsi-card-subtitle{margin:.28rem 0 0;font-size:.92rem;line-height:1.45;opacity:.92;}",
      ".tsi-smart-card .card-body>h5{font-size:1.05rem;font-weight:700;color:#0f4ec9;margin-bottom:.35rem;}",
      ".tsi-smart-card .card-body>p.text-muted.small{font-size:.9rem;margin-bottom:.85rem!important;}",
      ".tsi-smart-card .border.border-dashed{background:#fbfdff;border:1px dashed #cfe0ff!important;border-radius:16px!important;padding:1rem!important;margin-bottom:.2rem;}",
      ".tsi-section-marker{margin:0 0 .85rem;padding-bottom:.55rem;border-bottom:1px solid #edf2ff;}",
      ".tsi-section-marker-title{font-size:.95rem;font-weight:700;color:#163d7a;margin:0;}",
      ".tsi-section-marker-text{font-size:.85rem;color:#6a7890;margin:.2rem 0 0;}",
      ".tsi-manual-card .form-label{font-weight:600;color:#31435d;margin-bottom:.38rem;}",
      ".tsi-manual-card .form-control,.tsi-manual-card .form-select{border-radius:12px;border-color:#d7e3ff;box-shadow:none;}",
      ".tsi-manual-card .form-control:focus,.tsi-manual-card .form-select:focus{border-color:#1763ff;box-shadow:0 0 0 3px rgba(23,99,255,.12);}",
      ".tsi-ai-panel .card-header{background:linear-gradient(135deg,#eef4ff 0%,#e8f1ff 100%);border-bottom:1px solid #d8e5ff;padding:1rem 1.2rem;}",
      ".tsi-ai-placeholder{font-size:.9rem;color:#6b7a91;background:#f7faff;border:1px dashed #d3def7;border-radius:14px;padding:.95rem;}",
      ".tsi-ai-panel .alert{margin:0;border-radius:16px;}",
      ".tsi-ai-stack{display:flex;flex-direction:column;gap:.85rem;}",
      ".tsi-ai-kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:.7rem;}",
      ".tsi-ai-kpi-card{padding:.8rem .85rem;border-radius:14px;background:#f8fbff;border:1px solid #e8efff;}",
      ".tsi-ai-kpi-card strong{display:block;font-size:.76rem;letter-spacing:.05em;text-transform:uppercase;color:#6c7990;margin-bottom:.2rem;}",
      ".tsi-ai-kpi-value{font-size:1.05rem;font-weight:700;color:#183d78;}",
      ".tsi-ai-badge{display:inline-flex;align-items:center;padding:.3rem .55rem;border-radius:999px;font-size:.78rem;font-weight:700;}",
      ".tsi-ai-badge-low{background:#eaf7ef;color:#177a45;}",
      ".tsi-ai-badge-medium{background:#fff6df;color:#8a5b00;}",
      ".tsi-ai-badge-high{background:#ffe9d7;color:#b75400;}",
      ".tsi-ai-badge-critical{background:#ffe6ea;color:#b4213a;}",
      ".tsi-actions-row{padding-top:.35rem;border-top:1px solid #edf2ff;margin-top:1rem;display:flex;flex-direction:column;gap:.75rem;}",
      ".tsi-actions-row .btn,.tsi-actions-row button{width:100%;border-radius:14px;padding:.88rem 1rem;font-weight:700;}",
      ".tsi-primary-action{background:#1763ff!important;border-color:#1763ff!important;color:#fff!important;box-shadow:0 12px 28px rgba(23,99,255,.18);}",
      ".tsi-secondary-action{background:#eef2f7!important;border-color:#d6dee9!important;color:#425067!important;}",
      ".tsi-secondary-action:hover{background:#e6ebf2!important;color:#2f3b4d!important;}",
      ".tsi-mode-switch{margin-bottom:1rem;padding:.9rem 1rem;border:1px solid #e3ebff;border-radius:20px;background:linear-gradient(180deg,#fbfdff 0%,#f4f8ff 100%);box-shadow:0 12px 30px rgba(29,65,138,.06);}",
      ".tsi-mode-switch-head{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;flex-wrap:wrap;margin-bottom:.85rem;}",
      ".tsi-mode-switch-title{margin:0;font-size:1rem;font-weight:700;color:#163d7a;}",
      ".tsi-mode-switch-text{margin:.22rem 0 0;color:#63728a;font-size:.9rem;line-height:1.45;}",
      ".tsi-mode-switch-actions{display:flex;gap:.7rem;flex-wrap:wrap;}",
      ".tsi-nav-link{display:inline-flex;align-items:center;justify-content:center;padding:.72rem 1rem;border-radius:14px;border:1px solid #d8e4ff;background:#fff;color:#31507b;font-weight:700;text-decoration:none;min-width:150px;}",
      ".tsi-nav-link.active{background:#1763ff;color:#fff;border-color:#1763ff;box-shadow:0 12px 24px rgba(23,99,255,.18);}",
      ".tsi-smart-mode .tsi-workspace{grid-template-columns:minmax(0,900px);justify-content:center;}",
      ".tsi-smart-mode .tsi-side-column,.tsi-smart-mode .tsi-manual-card{display:none!important;}",
      ".tsi-manual-mode .tsi-smart-card{display:none!important;}",
      ".tsi-dashboard-overview-grid{display:grid;grid-template-columns:repeat(2,minmax(280px,1fr));gap:1.1rem;width:min(100%,1120px);margin:0 auto 1.1rem;align-items:start;justify-content:start;clear:both;}",
      ".tsi-dashboard-overview-grid.tsi-dashboard-overview-single{display:block;width:min(100%,380px);max-width:380px;margin:0 auto 1.1rem;}",
      ".tsi-dashboard-overview-card{width:100%!important;min-width:0;margin:0!important;align-self:start;}",
      ".tsi-dashboard-overview-grid .card,.tsi-dashboard-overview-grid>.card{height:100%;margin:0!important;}",
      ".tsi-dashboard-overview-grid.tsi-dashboard-overview-single .card,.tsi-dashboard-overview-grid.tsi-dashboard-overview-single>.card{height:auto!important;}",
      ".tsi-dashboard-overview-grid .card-body{height:100%;}",
      ".tsi-dashboard-overview-grid.tsi-dashboard-overview-single .card-body{height:auto!important;min-height:0!important;}",
      ".tsi-dashboard-action-target{scroll-margin-top:110px;}",
      ".tsi-dashboard-attention{box-shadow:0 0 0 3px rgba(23,99,255,.12),0 18px 36px rgba(23,99,255,.12)!important;transition:box-shadow .2s ease;}",
      "@media (max-width: 1100px){.tsi-dashboard-overview-grid{grid-template-columns:repeat(2,minmax(240px,1fr));}}",
      "@media (max-width: 768px){.tsi-workspace,.tsi-manual-mode .tsi-workspace,.tsi-dashboard-overview-grid{grid-template-columns:minmax(0,1fr)!important;}.tsi-dashboard-toolbar{flex-wrap:wrap!important;}.tsi-dashboard-search,.tsi-dashboard-sort{width:100%;max-width:none;}}",
      ".tsi-dashboard-page{max-width:1320px;margin:0 auto;}",
      ".tsi-dashboard-focus{display:flex;flex-direction:column;align-items:stretch;gap:1rem;width:100%;max-width:1120px;margin:0 auto;}",
      ".tsi-dashboard-toolbar{display:flex!important;justify-content:center!important;align-items:stretch!important;flex-wrap:nowrap;gap:1rem;width:min(100%,1040px);margin:0 auto;}",
      ".tsi-dashboard-search{flex:1 1 620px;max-width:760px;min-width:280px;display:flex;align-items:stretch;}",
      ".tsi-dashboard-search .input-group{width:100%;display:flex;align-items:stretch;min-height:46px;flex-wrap:nowrap!important;}",
      ".tsi-dashboard-search input,.tsi-dashboard-search .form-control{flex:1 1 auto!important;width:1%!important;min-width:0!important;min-height:46px;height:46px;line-height:1.2;padding-top:0;padding-bottom:0;}",
      ".tsi-dashboard-search .input-group-text,.tsi-dashboard-search .btn,.tsi-dashboard-search .btn-outline-secondary{min-height:46px;height:46px;display:inline-flex;align-items:center;justify-content:center;padding-top:0;padding-bottom:0;}",
      ".tsi-dashboard-sort{display:flex;justify-content:center;align-items:stretch;flex:0 0 auto;white-space:nowrap;}",
      ".tsi-dashboard-sort button,.tsi-dashboard-sort .btn,.tsi-dashboard-sort [role='button']{white-space:nowrap;min-height:46px;height:46px;display:inline-flex;align-items:center;}",
      ".tsi-dashboard-filters{display:flex!important;justify-content:center!important;align-items:center!important;flex-wrap:wrap;gap:.75rem;width:min(100%,1040px);margin:0 auto;}",
      ".tsi-dashboard-taskcard-wrap{display:flex!important;justify-content:center!important;align-items:stretch!important;width:100%!important;max-width:100%!important;flex:0 0 100%!important;margin:0 auto;clear:both;}",
      ".tsi-dashboard-taskcard{width:100%!important;max-width:1120px!important;margin:0 auto!important;}",
      ".tsi-impact-shell{display:flex;flex-direction:column;gap:1rem;}",
      ".tsi-impact-summary{padding:1rem 1.05rem;border-radius:16px;background:#f8fbff;border:1px solid #e4ebff;}",
      ".tsi-impact-summary p{margin:.35rem 0 0;color:#5f6f86;line-height:1.5;}",
      ".tsi-impact-list{display:flex;flex-direction:column;gap:.85rem;}",
      ".tsi-impact-item{padding:.9rem 1rem;border-radius:16px;background:#fff;border:1px solid #ebeff7;box-shadow:0 8px 20px rgba(20,59,138,.05);}",
      ".tsi-impact-item-head{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;}",
      ".tsi-impact-item-label{font-weight:700;color:#213754;line-height:1.45;}",
      ".tsi-impact-item-probability{font-size:.85rem;font-weight:700;white-space:nowrap;}",
      ".tsi-impact-bar{margin-top:.65rem;height:8px;border-radius:999px;background:#edf2ff;overflow:hidden;}",
      ".tsi-impact-bar>span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#ffb200 0%,#ef4444 100%);}",
      ".tsi-recovery-panel{margin-top:1rem;padding:1rem 1.05rem;border-radius:18px;background:linear-gradient(180deg,#fbfdff 0%,#f3f8ff 100%);border:1px solid #d9e5ff;}",
      ".tsi-recovery-panel h6{margin:0 0 .35rem;color:#173765;font-weight:800;}",
      ".tsi-recovery-panel p{margin:0 0 .85rem;color:#60708a;line-height:1.5;}",
      ".tsi-recovery-panel ul{margin:0;padding-left:1.15rem;color:#324860;}",
      ".tsi-recovery-panel li{margin-bottom:.45rem;line-height:1.5;}",
      ".tsi-impact-button{border:none;border-radius:12px;padding:.72rem 1rem;font-weight:700;cursor:pointer;}",
      ".tsi-impact-button-primary{background:#1763ff;color:#fff;}",
      ".tsi-impact-button-primary:hover{background:#0f58ed;}",
      ".tsi-impact-button-secondary{background:#eef2f7;color:#415066;}",
      ".tsi-dashboard-taskcard.card,.tsi-dashboard-taskcard .card{margin-left:auto!important;margin-right:auto!important;}",
      ".tsi-header-dashboard-link{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:12px;border:1px solid #cfe0ff;background:#fff;color:#1763ff;text-decoration:none;box-shadow:0 8px 18px rgba(23,99,255,.08);transition:transform .15s ease,box-shadow .15s ease;}",
      ".tsi-header-dashboard-link:hover{transform:translateY(-1px);box-shadow:0 12px 22px rgba(23,99,255,.14);color:#1763ff;}",
      ".tsi-header-dashboard-link svg{width:18px;height:18px;stroke:currentColor;stroke-width:2;fill:none;}",
      ".tsi-header-actionbar{display:flex!important;align-items:center!important;gap:.5rem!important;flex-wrap:nowrap;}",
      ".tsi-header-dashboard-link.tsi-topbar-link{position:relative;z-index:auto;flex:0 0 auto;}",
      ".tsi-accountability-page{max-width:1320px;margin:0 auto;padding:1rem 1rem 2rem;}",
      ".tsi-acc-header{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;}",
      ".tsi-acc-title{margin:0;font-size:1.6rem;font-weight:800;color:#173765;}",
      ".tsi-acc-subtitle{margin:.3rem 0 0;color:#60708a;max-width:760px;line-height:1.55;font-size:.95rem;}",
      ".tsi-acc-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem;margin-bottom:1rem;}",
      ".tsi-acc-stat{padding:1rem 1.1rem;border-radius:20px;color:#fff;box-shadow:0 18px 40px rgba(20,59,138,.1);}",
      ".tsi-acc-stat h6{margin:0 0 .45rem;font-size:.84rem;letter-spacing:.04em;text-transform:uppercase;opacity:.9;}",
      ".tsi-acc-stat strong{display:block;font-size:2rem;line-height:1;font-weight:800;}",
      ".tsi-acc-stat span{display:block;margin-top:.5rem;font-size:.9rem;opacity:.92;}",
      ".tsi-acc-stat-blue{background:linear-gradient(135deg,#1763ff 0%,#3486ff 100%);}",
      ".tsi-acc-stat-green{background:linear-gradient(135deg,#159957 0%,#1bb56a 100%);}",
      ".tsi-acc-stat-amber{background:linear-gradient(135deg,#f59f00 0%,#ffbf2f 100%);}",
      ".tsi-acc-stat-cyan{background:linear-gradient(135deg,#0ea5e9 0%,#22c7f3 100%);}",
      ".tsi-acc-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.8fr);gap:1rem;margin-bottom:1rem;}",
      ".tsi-acc-card{background:#fff;border:1px solid #e4ebff;border-radius:22px;box-shadow:0 16px 38px rgba(20,59,138,.08);padding:1.1rem 1.2rem;}",
      ".tsi-acc-card h5{margin:0;font-size:1.06rem;font-weight:800;color:#183b72;}",
      ".tsi-acc-card p{margin:.3rem 0 0;color:#667791;font-size:.9rem;line-height:1.5;}",
      ".tsi-acc-chart{display:flex;align-items:flex-end;gap:.75rem;min-height:240px;margin-top:1rem;}",
      ".tsi-acc-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:.55rem;min-width:0;}",
      ".tsi-acc-bar-track{display:flex;align-items:flex-end;justify-content:center;width:100%;max-width:58px;height:180px;border-radius:999px;background:linear-gradient(180deg,#eef4ff 0%,#dfe9ff 100%);overflow:hidden;}",
      ".tsi-acc-bar-fill{width:100%;border-radius:999px;background:linear-gradient(180deg,#1f83ff 0%,#1763ff 100%);}",
      ".tsi-acc-bar-day{font-size:.82rem;font-weight:700;color:#60708a;}",
      ".tsi-acc-bar-value{font-size:.78rem;color:#173765;font-weight:700;}",
      ".tsi-acc-summary{display:flex;flex-direction:column;gap:.9rem;margin-top:.95rem;}",
      ".tsi-acc-kpi-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem;}",
      ".tsi-acc-kpi{padding:.85rem .9rem;border-radius:16px;background:#f7faff;border:1px solid #e7efff;}",
      ".tsi-acc-kpi strong{display:block;font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;color:#72819a;margin-bottom:.25rem;}",
      ".tsi-acc-kpi span{display:block;font-size:1rem;font-weight:800;color:#173765;}",
      ".tsi-acc-list{display:flex;flex-direction:column;gap:.75rem;margin-top:.2rem;}",
      ".tsi-acc-item{padding:.85rem .95rem;border-radius:16px;background:#f8fbff;border:1px solid #ecf2ff;}",
      ".tsi-acc-item-title{font-size:.93rem;font-weight:700;color:#173765;}",
      ".tsi-acc-item-meta{margin-top:.3rem;font-size:.84rem;color:#63728a;}",
      ".tsi-acc-badge{display:inline-flex;align-items:center;padding:.28rem .55rem;border-radius:999px;font-size:.75rem;font-weight:700;}",
      ".tsi-acc-badge-danger{background:#ffe7ec;color:#b4213a;}",
      ".tsi-acc-badge-warning{background:#fff3d6;color:#9a6200;}",
      ".tsi-acc-badge-success{background:#e9f8ef;color:#177a45;}",
      ".tsi-acc-table{width:100%;border-collapse:collapse;margin-top:1rem;}",
      ".tsi-acc-table th,.tsi-acc-table td{padding:.82rem .72rem;border-bottom:1px solid #edf2ff;vertical-align:middle;}",
      ".tsi-acc-table th{font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;color:#6e7d95;font-weight:800;}",
      ".tsi-acc-table td{font-size:.92rem;color:#33455f;}",
      ".tsi-acc-progress{height:12px;border-radius:999px;background:#edf2ff;overflow:hidden;min-width:170px;}",
      ".tsi-acc-progress>span{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#1763ff 0%,#30a6ff 100%);}",
      ".tsi-acc-category-stack{display:flex;flex-direction:column;gap:.8rem;margin-top:1rem;}",
      ".tsi-acc-category-row{display:grid;grid-template-columns:minmax(110px,1fr) minmax(0,2fr) auto;gap:.8rem;align-items:center;}",
      ".tsi-acc-category-name{font-size:.9rem;font-weight:700;color:#173765;}",
      ".tsi-acc-category-meta{font-size:.82rem;color:#6b7a91;font-weight:700;}",
      ".tsi-acc-alert{margin-top:1rem;padding:.95rem 1rem;border-radius:16px;border:1px dashed #d9e5ff;background:#f8fbff;color:#4e6078;}",
      ".tsi-acc-empty{padding:1.15rem;border-radius:18px;border:1px dashed #d7e4ff;background:#f8fbff;color:#60708a;text-align:center;margin-top:1rem;}",
      ".tsi-acc-loading{padding:1rem;border-radius:18px;border:1px dashed #d7e4ff;background:#f8fbff;color:#60708a;text-align:center;}",
      ".tsi-acc-chip{display:inline-flex;align-items:center;padding:.28rem .55rem;border-radius:999px;background:#edf3ff;color:#2554b8;font-size:.76rem;font-weight:700;}",
      "body.tsi-auth-page{background:linear-gradient(90deg,#6478e8 0%,#7d5cc9 100%);overflow-x:hidden;min-height:100vh;}",
      "body.tsi-auth-page #root{opacity:0;pointer-events:none;user-select:none;}",
      ".tsi-auth-shell{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:2rem 1rem;background:transparent;}",
      ".tsi-auth-card{width:min(100%,510px);background:#fff;border:1px solid rgba(223,232,251,.92);border-radius:18px;box-shadow:0 28px 70px rgba(24,59,114,.16);padding:1.9rem 1.45rem 1.5rem;display:flex;flex-direction:column;gap:1rem;}",
      ".tsi-auth-brand{display:inline-flex;align-items:center;gap:.55rem;font-size:1rem;font-weight:700;color:#5a6575;letter-spacing:.01em;align-self:flex-start;}",
      ".tsi-auth-brand-dot{width:34px;height:34px;border-radius:12px;background:linear-gradient(135deg,#0d6efd 0%,#25b6e8 100%);box-shadow:0 10px 22px rgba(13,110,253,.18);position:relative;flex:0 0 auto;}",
      ".tsi-auth-brand-dot::before,.tsi-auth-brand-dot::after{content:'';position:absolute;border:2px solid rgba(255,255,255,.95);border-radius:999px;}",
      ".tsi-auth-brand-dot::before{width:12px;height:12px;left:7px;top:7px;}",
      ".tsi-auth-brand-dot::after{width:7px;height:7px;right:7px;bottom:7px;}",
      ".tsi-auth-icon{width:58px;height:58px;border-radius:999px;display:flex;align-items:center;justify-content:center;margin:0 auto 0.2rem;background:linear-gradient(135deg,#1f74ff 0%,#1d5de6 100%);color:#fff;box-shadow:0 16px 32px rgba(31,116,255,.22);}",
      ".tsi-auth-icon svg{width:28px;height:28px;stroke:currentColor;stroke-width:2.2;fill:none;stroke-linecap:round;stroke-linejoin:round;}",
      ".tsi-auth-heading{text-align:center;display:flex;flex-direction:column;gap:.35rem;}",
      ".tsi-auth-title{margin:0;font-size:1.05rem;line-height:1.2;font-weight:800;color:#1e2736;}",
      ".tsi-auth-title-main{display:block;font-size:1.92rem;line-height:1.1;}",
      ".tsi-auth-subtitle{margin:0;color:#6d7787;font-size:.98rem;line-height:1.5;}",
      ".tsi-auth-form{display:flex;flex-direction:column;gap:.85rem;}",
      ".tsi-auth-field{display:flex;flex-direction:column;gap:.38rem;}",
      ".tsi-auth-label{font-size:.95rem;font-weight:500;color:#354255;}",
      ".tsi-auth-input-wrap{position:relative;}",
      ".tsi-auth-input-icon{position:absolute;left:.95rem;top:50%;transform:translateY(-50%);width:18px;height:18px;color:#757f8f;pointer-events:none;display:flex;align-items:center;justify-content:center;}",
      ".tsi-auth-input-icon svg{width:18px;height:18px;stroke:currentColor;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round;}",
      ".tsi-auth-input{width:100%;height:40px;border:1px solid #dfe6f1;border-radius:8px;padding:0 .95rem 0 2.6rem;font-size:.96rem;color:#203653;background:#fff;outline:none;transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease;}",
      ".tsi-auth-input-password{padding-right:2.9rem;}",
      ".tsi-auth-toggle{position:absolute;right:.8rem;top:50%;transform:translateY(-50%);width:28px;height:28px;border:none;background:transparent;color:#6f7a8b;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;}",
      ".tsi-auth-toggle:hover{color:#2563eb;}",
      ".tsi-auth-toggle svg{width:18px;height:18px;stroke:currentColor;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round;}",
      ".tsi-auth-input:focus{border-color:#91aefb;box-shadow:0 0 0 3px rgba(91,132,255,.12);transform:translateY(-1px);}",
      ".tsi-auth-input::placeholder{color:#8b98ab;}",
      ".tsi-auth-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;font-size:.92rem;}",
      ".tsi-auth-check{display:inline-flex;align-items:center;gap:.55rem;color:#4d607b;font-weight:600;cursor:pointer;}",
      ".tsi-auth-check input{width:16px;height:16px;accent-color:#1763ff;}",
      ".tsi-auth-link{border:none;background:none;padding:0;color:#2563eb;font-weight:700;cursor:pointer;text-decoration:none;}",
      ".tsi-auth-link:hover{text-decoration:underline;}",
      ".tsi-auth-submit{width:100%;height:46px;border:none;border-radius:6px;background:#1f9254;color:#fff;font-size:1rem;font-weight:700;cursor:pointer;box-shadow:none;transition:transform .15s ease,box-shadow .15s ease,opacity .15s ease;}",
      ".tsi-auth-submit:hover{transform:translateY(-1px);box-shadow:0 12px 24px rgba(31,146,84,.18);}",
      ".tsi-auth-submit:disabled{opacity:.72;cursor:not-allowed;transform:none;box-shadow:none;}",
      ".tsi-auth-divider{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:.8rem;align-items:center;color:#7a889b;font-size:.88rem;font-weight:700;}",
      ".tsi-auth-divider::before,.tsi-auth-divider::after{content:'';height:1px;background:#e4ebf7;display:block;}",
      ".tsi-auth-secondary{width:100%;height:46px;border:1px solid #dfe6f1;border-radius:8px;background:#fff;color:#29456f;font-size:.96rem;font-weight:700;display:inline-flex;align-items:center;justify-content:center;gap:.75rem;cursor:pointer;transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease;}",
      ".tsi-auth-secondary:hover{border-color:#b9cef8;box-shadow:0 12px 24px rgba(24,59,114,.08);transform:translateY(-1px);}",
      ".tsi-auth-google-icon{width:20px;height:20px;border-radius:999px;background:conic-gradient(from 220deg,#34a853 0 25%,#4285f4 25% 50%,#ea4335 50% 75%,#fbbc05 75% 100%);}",
      ".tsi-auth-footer{font-size:.93rem;color:#5f7188;text-align:center;padding-top:.2rem;}",
      ".tsi-auth-footer a{color:#178b74;font-weight:800;text-decoration:none;}",
      ".tsi-auth-footer a:hover{text-decoration:underline;}",
      ".tsi-auth-message{margin:0;padding:.85rem .95rem;border-radius:14px;font-size:.9rem;line-height:1.45;}",
      ".tsi-auth-message-info{background:#edf4ff;color:#1c56b5;}",
      ".tsi-auth-message-success{background:#ebf9f0;color:#177a45;}",
      ".tsi-auth-message-error{background:#ffe9ec;color:#b4213a;}",
      ".tsi-auth-submessage{font-size:.86rem;color:#6c7b91;line-height:1.45;margin-top:-.35rem;}",
      ".tsi-auth-backlink{display:inline-flex;align-items:center;gap:.45rem;width:max-content;color:#1763ff;font-size:.92rem;font-weight:800;text-decoration:none;}",
      ".tsi-auth-backlink:hover{text-decoration:underline;}",
      ".tsi-auth-helper{margin:-.1rem 0 .05rem;color:#6c7b91;font-size:.84rem;line-height:1.45;}",
      ".tsi-native-google-button{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:.7rem!important;}",
      ".tsi-google-mark{width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;}",
      ".tsi-google-mark svg{display:block;width:18px;height:18px;}",
      ".tsi-native-auth-link{color:#1763ff!important;font-weight:700!important;text-decoration:none!important;}",
      ".tsi-native-auth-link:hover{text-decoration:underline!important;}",
      ".tsi-native-auth-extras{display:flex;flex-direction:column;gap:.9rem;margin-top:1rem;}",
      ".tsi-native-auth-divider{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:.8rem;align-items:center;color:#7a889b;font-size:.88rem;font-weight:700;}",
      ".tsi-native-auth-divider::before,.tsi-native-auth-divider::after{content:'';height:1px;background:#e4ebf7;display:block;}",
      ".tsi-native-auth-note{font-size:.86rem;color:#6c7b91;line-height:1.45;text-align:center;}",
      "@media (max-width: 640px){.tsi-auth-card{padding:1.4rem 1rem 1.2rem;border-radius:16px;}.tsi-auth-title-main{font-size:1.7rem;}.tsi-auth-shell{padding:1rem;}.tsi-auth-row{align-items:flex-start;flex-direction:column;}}",
      "@media (max-width: 1100px){.tsi-acc-stats{grid-template-columns:repeat(2,minmax(0,1fr));}.tsi-acc-grid{grid-template-columns:1fr;}}",
      "@media (max-width: 991px){.tsi-workspace{grid-template-columns:1fr;}.tsi-side-column{order:-1;}.tsi-create-page{padding:1rem .85rem 1.5rem;}.tsi-dashboard-toolbar{flex-wrap:wrap;}}"
    ].join("");
    document.head.appendChild(style);
  }


  function getToken() {
    return localStorage.getItem("token");
  }

  function setFieldValue(name, value) {
    if (value === undefined || value === null) {
      return;
    }

    var element = document.querySelector('[name="' + name + '"]');
    if (!element) {
      return;
    }

    var prototype = window.HTMLInputElement && element instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : window.HTMLTextAreaElement && element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : window.HTMLSelectElement && element instanceof HTMLSelectElement
          ? HTMLSelectElement.prototype
          : null;

    if (!prototype) {
      element.value = value;
    } else {
      var descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
      if (descriptor && descriptor.set) {
        descriptor.set.call(element, value);
      } else {
        element.value = value;
      }
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function fieldHasValue(name) {
    var element = document.querySelector('[name="' + name + '"]');
    return !!(element && String(element.value || "").trim());
  }

  function getText(node) {
    return String(node && node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function getApiErrorMessage(payload, fallback) {
    if (payload && typeof payload === "object") {
      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message.trim();
      }
      if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error.trim();
      }
    }
    return fallback || "Something went wrong. Please try again.";
  }

  function cleanupAuthPageShell() {
    document.body.classList.remove("tsi-auth-page");
    var shell = document.getElementById("tsi-login-shell");
    if (shell) {
      shell.remove();
    }
  }

  function createAuthMessage(type, message) {
    if (!message) {
      return "";
    }
    var normalizedType = type === "success" ? "success" : type === "info" ? "info" : "error";
    return '<div class="tsi-auth-message tsi-auth-message-' + normalizedType + '">' + escapeHtml(message) + "</div>";
  }

  function createAuthInputIcon(type) {
    var icons = {
      user: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"></path><path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path></svg>',
      email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4z"></path><path d="m5 7 7 6 7-6"></path></svg>',
      lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"></rect><path d="M8 11V8a4 4 0 1 1 8 0v3"></path></svg>',
      code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 9-4 3 4 3"></path><path d="m16 9 4 3-4 3"></path><path d="m14 5-4 14"></path></svg>'
    };
    return '<span class="tsi-auth-input-icon">' + (icons[type] || icons.email) + "</span>";
  }

  function createAuthHeroIcon(type) {
    var icons = {
      login: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2"></path><path d="M10 17l5-5-5-5"></path><path d="M15 12H3"></path></svg>',
      signup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a7 7 0 1 1-7 7"></path><path d="M12 1v4"></path><path d="m4.9 4.9 2.8 2.8"></path><path d="M12 8v4l3 3"></path></svg>',
      verify: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>',
      reset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6V3L8 7l4 4V8a4 4 0 1 1-4 4H6a6 6 0 1 0 6-6Z"></path></svg>'
    };
    return '<div class="tsi-auth-icon">' + (icons[type] || icons.login) + "</div>";
  }

  function createPasswordToggle() {
    return [
      '<button class="tsi-auth-toggle" type="button" data-tsi-role="toggle-password" aria-label="Show password">',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
      "</button>"
    ].join("");
  }

  function bindPasswordToggles(scope) {
    if (!scope) {
      return;
    }

    Array.prototype.forEach.call(scope.querySelectorAll('[data-tsi-role="toggle-password"]'), function (button) {
      if (button.dataset.tsiBound === "true") {
        return;
      }

      button.dataset.tsiBound = "true";
      button.addEventListener("click", function () {
        var wrap = button.parentElement;
        var input = wrap ? wrap.querySelector('input[type="password"], input[type="text"]') : null;
        if (!input) {
          return;
        }

        var showing = input.type === "text";
        input.type = showing ? "password" : "text";
        button.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      });
    });
  }

  function createGoogleMark() {
    var mark = document.createElement("span");
    mark.className = "tsi-google-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = [
      '<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">',
      '<path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.207 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.851 1.154 7.971 3.029l5.657-5.657C34.053 6.053 29.27 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>',
      '<path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 13 24 13c3.059 0 5.851 1.154 7.971 3.029l5.657-5.657C34.053 6.053 29.27 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>',
      '<path fill="#4CAF50" d="M24 44c5.17 0 9.86-1.977 13.409-5.196l-6.19-5.238C29.141 35.091 26.715 36 24 36c-5.186 0-9.625-3.332-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>',
      '<path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.05 12.05 0 0 1-4.084 5.566h.001l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/>',
      "</svg>"
    ].join("");
    return mark;
  }

  function decorateGoogleButtons() {
    var path = window.location.pathname;
    if (path !== "/login" && path !== "/signup") {
      return;
    }

    Array.prototype.forEach.call(document.querySelectorAll("button, a"), function (element) {
      if (!/continue with google/i.test(getText(element))) {
        return;
      }

      element.classList.add("tsi-native-google-button");
      if (element.dataset.tsiGoogleDecorated === "true") {
        return;
      }

      element.dataset.tsiGoogleDecorated = "true";
      element.textContent = "";
      element.appendChild(createGoogleMark());
      var label = document.createElement("span");
      label.textContent = "Continue with Google";
      element.appendChild(label);
    });
  }

  function findNativeAuthForm() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("form"));
    return forms.find(function (form) {
      return form.querySelector('input[type="email"], input[name="email"]')
        && form.querySelector('input[type="password"], input[name="password"]');
    }) || null;
  }

  function ensureNativeAuthExtras() {
    var path = window.location.pathname;
    if (path !== "/login" && path !== "/signup") {
      return;
    }

    var form = findNativeAuthForm();
    if (!form) {
      return;
    }

    var extras = form.querySelector("#tsi-native-auth-extras");
    if (!extras) {
      extras = document.createElement("div");
      extras.id = "tsi-native-auth-extras";
      extras.className = "tsi-native-auth-extras";
      form.appendChild(extras);
    }

    var pageText = getText(form.parentElement || document.body).toLowerCase();
    var hasExistingSwitchText = path === "/signup"
      ? pageText.indexOf("already have an account") >= 0
      : pageText.indexOf("don't have an account") >= 0 || pageText.indexOf("dont have an account") >= 0;

    var footerMarkup = "";
    if (!hasExistingSwitchText) {
      footerMarkup = path === "/signup"
        ? '<div class="tsi-auth-footer">Already have an account? <a class="tsi-native-auth-link" href="/login">Sign in</a></div>'
        : '<div class="tsi-auth-footer">Don&apos;t have an account? <a class="tsi-native-auth-link" href="/signup">Sign up</a></div>';
    }

    extras.innerHTML = footerMarkup;
  }

  function patchForgotPasswordLink() {
    if (window.location.pathname !== "/login") {
      return;
    }

    var emailInput = document.querySelector('input[type="email"], input[name="email"]');
    var forgotTarget = Array.prototype.find.call(document.querySelectorAll("a, button"), function (element) {
      return /forgot/i.test(getText(element)) && /password/i.test(getText(element));
    });

    var navigateToForgot = function (event) {
      if (event) {
        event.preventDefault();
      }
      var email = String(emailInput && emailInput.value || "").trim();
      window.location.href = "/login?forgot=1&email=" + encodeURIComponent(email);
    };

    if (forgotTarget) {
      forgotTarget.classList.add("tsi-native-auth-link");
      if (forgotTarget.tagName === "A") {
        forgotTarget.setAttribute("href", "/login?forgot=1");
      }
      if (!forgotTarget.dataset.tsiForgotBound) {
        forgotTarget.dataset.tsiForgotBound = "true";
        forgotTarget.addEventListener("click", navigateToForgot);
      }
      return;
    }

    var passwordInput = document.querySelector('input[type="password"], input[name="password"]');
    var form = findNativeAuthForm();
    if (!passwordInput) {
      return;
    }

    var anchor = document.getElementById("tsi-native-forgot-link");
    if (!anchor) {
      anchor = document.createElement("a");
      anchor.id = "tsi-native-forgot-link";
      anchor.href = "/login?forgot=1";
      anchor.className = "tsi-native-auth-link";
      anchor.textContent = "Forgot your password?";
      anchor.style.display = "inline-flex";
      anchor.style.marginTop = "0.55rem";
      anchor.style.alignSelf = "flex-end";
      (passwordInput.parentElement || form || document.body).appendChild(anchor);
    }

    if (!anchor.dataset.tsiForgotBound) {
      anchor.dataset.tsiForgotBound = "true";
      anchor.addEventListener("click", navigateToForgot);
    }
  }

  function enhanceNativeAuthPages() {
    if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
      return;
    }

    installStyles();
    fixAuthLabelFors();
    ensureNativeAuthExtras();
    patchForgotPasswordLink();
  }

  function fixAuthLabelFors() {
    var path = window.location.pathname;
    if (path !== "/login" && path !== "/signup") {
      return;
    }

    var labels = Array.prototype.slice.call(document.querySelectorAll("label[for]"));
    labels.forEach(function (label, index) {
      var key = String(label.getAttribute("for") || "").trim();
      if (!key) {
        return;
      }

      var input = document.querySelector('input[name="' + key + '"]');
      if (!input) {
        return;
      }

      if (!input.id) {
        input.id = "tsi-auth-" + key + "-" + index;
      }

      if (label.getAttribute("for") !== input.id) {
        label.setAttribute("for", input.id);
      }
    });
  }

  function renderLoginShell() {
    var shell = document.getElementById("tsi-login-shell");
    if (!shell) {
      return;
    }

    var savedEmail = AUTH_UI_STATE.email || localStorage.getItem(REMEMBERED_EMAIL_KEY) || "";

    shell.innerHTML = [
      '<div class="tsi-auth-card">',
      '  <div class="tsi-auth-brand"><span class="tsi-auth-brand-dot"></span><span>TimelySync</span></div>',
      createAuthHeroIcon("login"),
      '  <div class="tsi-auth-heading">',
      '    <h1 class="tsi-auth-title"><span class="tsi-auth-title-main">Sign In</span></h1>',
      '    <p class="tsi-auth-subtitle">Welcome back to TimelySync</p>',
      "  </div>",
      '  <form class="tsi-auth-form" data-tsi-role="login-form">',
      '    <div class="tsi-auth-field">',
      '      <label class="tsi-auth-label" for="tsi-login-email">Email Address *</label>',
      '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("email") + '<input class="tsi-auth-input" id="tsi-login-email" name="email" type="email" placeholder="Enter your email" autocomplete="email" value="' + escapeHtml(savedEmail) + '" required /></div>',
      "    </div>",
      '    <div class="tsi-auth-field">',
      '      <div class="tsi-auth-row"><label class="tsi-auth-label" for="tsi-login-password">Password *</label><button class="tsi-auth-link" type="button" data-tsi-role="forgot">Forgot password?</button></div>',
      '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("lock") + '<input class="tsi-auth-input tsi-auth-input-password" id="tsi-login-password" name="password" type="password" placeholder="Enter your password" autocomplete="current-password" value="' + escapeHtml(AUTH_UI_STATE.password || "") + '" required />' + createPasswordToggle() + '</div>',
      "    </div>",
      createAuthMessage(AUTH_UI_STATE.messageType, AUTH_UI_STATE.message),
      AUTH_UI_STATE.forgotMessage ? '<div class="tsi-auth-submessage">' + escapeHtml(AUTH_UI_STATE.forgotMessage) + "</div>" : "",
      '    <button class="tsi-auth-submit" type="submit"' + (AUTH_UI_STATE.submitting ? " disabled" : "") + ">" + (AUTH_UI_STATE.submitting ? "Signing In..." : "Sign In") + "</button>",
      '    <div class="tsi-auth-footer">Don&apos;t have an account? <a href="/signup">Create Account</a></div>',
      "  </form>",
      "</div>"
    ].join("");

    var form = shell.querySelector('[data-tsi-role="login-form"]');
    var forgotButton = shell.querySelector('[data-tsi-role="forgot"]');
    var emailInput = shell.querySelector('input[name="email"]');

    if (form) {
      Array.prototype.forEach.call(form.querySelectorAll("input"), function (input) {
        input.addEventListener("input", function () {
          if (input.name === "email") {
            AUTH_UI_STATE.email = input.value;
          }
          if (input.name === "password") {
            AUTH_UI_STATE.password = input.value;
          }
        });
      });
      form.addEventListener("submit", handleLoginSubmit);
      bindPasswordToggles(form);
    }

    if (forgotButton) {
      forgotButton.addEventListener("click", function () {
        var currentEmail = String(emailInput && emailInput.value || localStorage.getItem(REMEMBERED_EMAIL_KEY) || "").trim();
        window.location.href = "/login?forgot=1&email=" + encodeURIComponent(currentEmail);
      });
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    var form = event.currentTarget;
    if (!form) {
      return;
    }

    var emailInput = form.querySelector('input[name="email"]');
    var passwordInput = form.querySelector('input[name="password"]');
    var email = String(emailInput && emailInput.value || "").trim();
    var password = String(passwordInput && passwordInput.value || "");

    AUTH_UI_STATE.forgotMessage = "";
    AUTH_UI_STATE.googleMessage = "";
    AUTH_UI_STATE.email = email;
    AUTH_UI_STATE.password = password;

    if (!email || !password) {
      AUTH_UI_STATE.message = "Email and password are required.";
      AUTH_UI_STATE.messageType = "error";
      renderLoginShell();
      return;
    }

    AUTH_UI_STATE.submitting = true;
    AUTH_UI_STATE.message = "";
    AUTH_UI_STATE.messageType = "";
    renderLoginShell();

    try {
      var response = await fetch(API_BASE + "/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      var payload = null;
      try {
        payload = await response.json();
      } catch (parseError) {
        payload = null;
      }

      if (!response.ok) {
        AUTH_UI_STATE.message = getApiErrorMessage(payload, "Unable to sign in right now.");
        AUTH_UI_STATE.messageType = "error";
        AUTH_UI_STATE.submitting = false;
        renderLoginShell();
        return;
      }

      if (payload && payload.token) {
        localStorage.setItem("token", payload.token);
      }

      if (payload && payload.user) {
        localStorage.setItem("user", JSON.stringify(payload.user));
      }

      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      AUTH_UI_STATE.password = "";

      AUTH_UI_STATE.message = "Signed in successfully. Redirecting to your dashboard...";
      AUTH_UI_STATE.messageType = "success";
      AUTH_UI_STATE.submitting = false;
      renderLoginShell();

      window.setTimeout(function () {
        window.location.href = "/dashboard";
      }, 350);
    } catch (error) {
      AUTH_UI_STATE.message = "Could not connect to the backend. Please make sure the server is running.";
      AUTH_UI_STATE.messageType = "error";
      AUTH_UI_STATE.submitting = false;
      renderLoginShell();
    }
  }

  function enhanceLoginPage() {
    installStyles();
    document.body.classList.add("tsi-auth-page");
    SIGNUP_UI_STATE.message = "";
    SIGNUP_UI_STATE.messageType = "";
    SIGNUP_UI_STATE.submitting = false;

    var shell = document.getElementById("tsi-login-shell");
    if (!shell) {
      shell = document.createElement("div");
      shell.id = "tsi-login-shell";
      shell.className = "tsi-auth-shell";
      document.body.appendChild(shell);
    }

    shell.innerHTML = "";
    renderLoginShell();
  }

  function renderSignupShell() {
    var shell = document.getElementById("tsi-login-shell");
    if (!shell) {
      return;
    }

    var isVerifyMode = SIGNUP_UI_STATE.mode === "verify";
    shell.innerHTML = isVerifyMode ? [
      '<div class="tsi-auth-card">',
      '  <a class="tsi-auth-backlink" href="/login">&#8592; Back to sign in</a>',
      '  <div class="tsi-auth-brand"><span class="tsi-auth-brand-dot"></span><span>TimelySync</span></div>',
      createAuthHeroIcon("verify"),
      '  <div class="tsi-auth-heading">',
      '    <h1 class="tsi-auth-title"><span class="tsi-auth-title-main">Verify Email</span></h1>',
      '    <p class="tsi-auth-subtitle">Enter the verification code sent to ' + escapeHtml(SIGNUP_UI_STATE.email) + '.</p>',
      "  </div>",
      '  <form class="tsi-auth-form" data-tsi-role="verify-form">',
      createAuthMessage(SIGNUP_UI_STATE.messageType, SIGNUP_UI_STATE.message),
      SIGNUP_UI_STATE.deliveryNote ? '<div class="tsi-auth-submessage">' + escapeHtml(SIGNUP_UI_STATE.deliveryNote) + "</div>" : "",
      '    <div class="tsi-auth-field">',
      '      <label class="tsi-auth-label" for="tsi-verify-code">Verification Code *</label>',
      '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("code") + '<input class="tsi-auth-input" id="tsi-verify-code" name="verificationCode" type="text" inputmode="numeric" maxlength="6" placeholder="Enter the 6-digit code" value="' + escapeHtml(SIGNUP_UI_STATE.verificationCode) + '" required /></div>',
      "    </div>",
      '    <button class="tsi-auth-submit" type="submit"' + (SIGNUP_UI_STATE.submitting ? " disabled" : "") + ">" + (SIGNUP_UI_STATE.submitting ? "Verifying..." : "Verify Email") + "</button>",
      '    <button class="tsi-auth-secondary" type="button" data-tsi-role="resend-verification"' + (SIGNUP_UI_STATE.submitting ? " disabled" : "") + '>Resend code</button>',
      '    <div class="tsi-auth-footer">Wrong email? <a href="/signup" data-tsi-role="change-email">Create account again</a> | <a href="/login">Go to sign in</a></div>',
      "  </form>",
      "</div>"
    ].join("") : [
      '<div class="tsi-auth-card">',
      '  <div class="tsi-auth-brand"><span class="tsi-auth-brand-dot"></span><span>TimelySync</span></div>',
      createAuthHeroIcon("signup"),
      '  <div class="tsi-auth-heading">',
      '    <h1 class="tsi-auth-title"><span class="tsi-auth-title-main">Create Account</span></h1>',
      '    <p class="tsi-auth-subtitle">Join TimelySync and verify your email to continue.</p>',
      "  </div>",
      '  <form class="tsi-auth-form" data-tsi-role="signup-form">',
      createAuthMessage(SIGNUP_UI_STATE.messageType, SIGNUP_UI_STATE.message),
      '    <div class="tsi-auth-field">',
      '      <label class="tsi-auth-label" for="tsi-signup-name">Full Name *</label>',
      '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("user") + '<input class="tsi-auth-input" id="tsi-signup-name" name="name" type="text" placeholder="Enter your full name" value="' + escapeHtml(SIGNUP_UI_STATE.name) + '" required /></div>',
      "    </div>",
      '    <div class="tsi-auth-field">',
      '      <label class="tsi-auth-label" for="tsi-signup-email">Email Address *</label>',
      '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("email") + '<input class="tsi-auth-input" id="tsi-signup-email" name="email" type="email" placeholder="Enter your .com email" autocomplete="email" value="' + escapeHtml(SIGNUP_UI_STATE.email) + '" required /></div>',
      "    </div>",
      '    <div class="tsi-auth-field">',
      '      <label class="tsi-auth-label" for="tsi-signup-password">Password *</label>',
      '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("lock") + '<input class="tsi-auth-input tsi-auth-input-password" id="tsi-signup-password" name="password" type="password" placeholder="Create a secure password" autocomplete="new-password" value="' + escapeHtml(SIGNUP_UI_STATE.password || "") + '" required />' + createPasswordToggle() + '</div>',
      "    </div>",
      '    <p class="tsi-auth-helper">Use 8+ characters with one uppercase letter, one number, and one special character.</p>',
      '    <div class="tsi-auth-field">',
      '      <label class="tsi-auth-label" for="tsi-signup-confirm">Confirm Password *</label>',
      '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("lock") + '<input class="tsi-auth-input tsi-auth-input-password" id="tsi-signup-confirm" name="confirmPassword" type="password" placeholder="Confirm your password" autocomplete="new-password" value="' + escapeHtml(SIGNUP_UI_STATE.confirmPassword || "") + '" required />' + createPasswordToggle() + '</div>',
      "    </div>",
      '    <button class="tsi-auth-submit" type="submit"' + (SIGNUP_UI_STATE.submitting ? " disabled" : "") + ">" + (SIGNUP_UI_STATE.submitting ? "Creating Account..." : "Create Secure Account") + "</button>",
      '    <div class="tsi-auth-footer">Already have an account? <a href="/login">Sign in</a></div>',
      "  </form>",
      "</div>"
    ].join("");

    var signupForm = shell.querySelector('[data-tsi-role="signup-form"]');
    var verifyForm = shell.querySelector('[data-tsi-role="verify-form"]');
    var resendButton = shell.querySelector('[data-tsi-role="resend-verification"]');
    var changeEmail = shell.querySelector('[data-tsi-role="change-email"]');

    if (signupForm) {
      Array.prototype.forEach.call(signupForm.querySelectorAll("input"), function (input) {
        input.addEventListener("input", function () {
          if (input.name === "name") {
            SIGNUP_UI_STATE.name = input.value;
          }
          if (input.name === "email") {
            SIGNUP_UI_STATE.email = input.value;
          }
          if (input.name === "password") {
            SIGNUP_UI_STATE.password = input.value;
          }
          if (input.name === "confirmPassword") {
            SIGNUP_UI_STATE.confirmPassword = input.value;
          }
        });
      });
      signupForm.addEventListener("submit", handleSignupSubmit);
      bindPasswordToggles(signupForm);
    }
    if (verifyForm) {
      Array.prototype.forEach.call(verifyForm.querySelectorAll("input"), function (input) {
        input.addEventListener("input", function () {
          if (input.name === "verificationCode") {
            SIGNUP_UI_STATE.verificationCode = input.value;
          }
        });
      });
      verifyForm.addEventListener("submit", handleVerifyEmailSubmit);
    }
    if (resendButton) {
      resendButton.addEventListener("click", handleResendVerificationSubmit);
    }
    if (changeEmail) {
      changeEmail.addEventListener("click", function () {
        SIGNUP_UI_STATE.mode = "signup";
        SIGNUP_UI_STATE.verificationCode = "";
        SIGNUP_UI_STATE.message = "";
        SIGNUP_UI_STATE.messageType = "";
      });
    }
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();

    var form = event.currentTarget;
    var name = String(form.querySelector('input[name="name"]').value || "").trim();
    var email = String(form.querySelector('input[name="email"]').value || "").trim();
    var password = String(form.querySelector('input[name="password"]').value || "");
    var confirmPassword = String(form.querySelector('input[name="confirmPassword"]').value || "");
    var passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    SIGNUP_UI_STATE.name = name;
    SIGNUP_UI_STATE.email = email;
    SIGNUP_UI_STATE.password = password;
    SIGNUP_UI_STATE.confirmPassword = confirmPassword;
    SIGNUP_UI_STATE.message = "";
    SIGNUP_UI_STATE.messageType = "";
    SIGNUP_UI_STATE.deliveryNote = "";

    if (!name || !email || !password || !confirmPassword) {
      SIGNUP_UI_STATE.message = "All fields are required.";
      SIGNUP_UI_STATE.messageType = "error";
      renderSignupShell();
      return;
    }

    if (password !== confirmPassword) {
      SIGNUP_UI_STATE.message = "Passwords do not match.";
      SIGNUP_UI_STATE.messageType = "error";
      renderSignupShell();
      return;
    }

    if (!passwordPattern.test(password)) {
      SIGNUP_UI_STATE.message = "Password must be 8+ characters and include one uppercase letter, one number, and one special character.";
      SIGNUP_UI_STATE.messageType = "error";
      renderSignupShell();
      return;
    }

    SIGNUP_UI_STATE.submitting = true;
    renderSignupShell();

    try {
      var response = await fetch(API_BASE + "/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password
        })
      });

      var payload = null;
      try {
        payload = await response.json();
      } catch (parseError) {
        payload = null;
      }

      if (!response.ok) {
        SIGNUP_UI_STATE.message = getApiErrorMessage(payload, "Unable to create account right now.");
        SIGNUP_UI_STATE.messageType = "error";
        SIGNUP_UI_STATE.submitting = false;
        renderSignupShell();
        return;
      }

      SIGNUP_UI_STATE.mode = "verify";
      SIGNUP_UI_STATE.message = "Verification code sent. Enter it below to activate your account.";
      SIGNUP_UI_STATE.messageType = "success";
      SIGNUP_UI_STATE.submitting = false;
      SIGNUP_UI_STATE.verificationCode = "";
      if (payload && payload.verificationCode) {
        SIGNUP_UI_STATE.deliveryNote = "Verification code: " + String(payload.verificationCode || "") + ". You can use it directly here.";
      }
      renderSignupShell();
    } catch (error) {
      SIGNUP_UI_STATE.message = "Could not connect to the backend. Please make sure the server is running.";
      SIGNUP_UI_STATE.messageType = "error";
      SIGNUP_UI_STATE.submitting = false;
      renderSignupShell();
    }
  }

  async function handleVerifyEmailSubmit(event) {
    event.preventDefault();

    var form = event.currentTarget;
    var code = String(form.querySelector('input[name="verificationCode"]').value || "").trim();
    SIGNUP_UI_STATE.verificationCode = code;
    SIGNUP_UI_STATE.message = "";
    SIGNUP_UI_STATE.messageType = "";

    if (!SIGNUP_UI_STATE.email || !code) {
      SIGNUP_UI_STATE.message = "Email and verification code are required.";
      SIGNUP_UI_STATE.messageType = "error";
      renderSignupShell();
      return;
    }

    SIGNUP_UI_STATE.submitting = true;
    renderSignupShell();

    try {
      var response = await fetch(API_BASE + "/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: SIGNUP_UI_STATE.email,
          code: code
        })
      });

      var payload = null;
      try {
        payload = await response.json();
      } catch (parseError) {
        payload = null;
      }

      if (!response.ok) {
        SIGNUP_UI_STATE.message = getApiErrorMessage(payload, "Unable to verify email right now.");
        SIGNUP_UI_STATE.messageType = "error";
        SIGNUP_UI_STATE.submitting = false;
        renderSignupShell();
        return;
      }

      localStorage.setItem(REMEMBERED_EMAIL_KEY, SIGNUP_UI_STATE.email);
      SIGNUP_UI_STATE.message = "Email verified successfully. Redirecting to sign in...";
      SIGNUP_UI_STATE.messageType = "success";
      SIGNUP_UI_STATE.submitting = false;
      renderSignupShell();
      window.setTimeout(function () {
        window.location.href = "/login";
      }, 700);
    } catch (error) {
      SIGNUP_UI_STATE.message = "Could not connect to the backend. Please make sure the server is running.";
      SIGNUP_UI_STATE.messageType = "error";
      SIGNUP_UI_STATE.submitting = false;
      renderSignupShell();
    }
  }

  async function handleResendVerificationSubmit() {
    if (!SIGNUP_UI_STATE.email) {
      SIGNUP_UI_STATE.message = "Enter your email again to resend the verification code.";
      SIGNUP_UI_STATE.messageType = "error";
      renderSignupShell();
      return;
    }

    SIGNUP_UI_STATE.submitting = true;
    renderSignupShell();

    try {
      var response = await fetch(API_BASE + "/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: SIGNUP_UI_STATE.email
        })
      });

      var payload = null;
      try {
        payload = await response.json();
      } catch (parseError) {
        payload = null;
      }

      SIGNUP_UI_STATE.message = response.ok
        ? getApiErrorMessage(payload, "Verification code sent again.")
        : getApiErrorMessage(payload, "Unable to resend verification code.");
      SIGNUP_UI_STATE.messageType = response.ok ? "success" : "error";
      SIGNUP_UI_STATE.deliveryNote = payload && payload.verificationCode
        ? "Verification code: " + String(payload.verificationCode || "") + ". You can use it directly here."
        : "";
    } catch (error) {
      SIGNUP_UI_STATE.message = "Could not connect to the backend. Please make sure the server is running.";
      SIGNUP_UI_STATE.messageType = "error";
    }

    SIGNUP_UI_STATE.submitting = false;
    renderSignupShell();
  }

  function enhanceSignupPage() {
    installStyles();
    document.body.classList.add("tsi-auth-page");
    AUTH_UI_STATE.message = "";
    AUTH_UI_STATE.messageType = "";
    AUTH_UI_STATE.submitting = false;

    var shell = document.getElementById("tsi-login-shell");
    if (!shell) {
      shell = document.createElement("div");
      shell.id = "tsi-login-shell";
      shell.className = "tsi-auth-shell";
      document.body.appendChild(shell);
    }

    shell.innerHTML = "";
    renderSignupShell();
  }

  function getResetPrefillEmail() {
    var params = new URLSearchParams(window.location.search);
    var email = String(params.get("email") || RESET_UI_STATE.email || localStorage.getItem(REMEMBERED_EMAIL_KEY) || "").trim();
    return email;
  }

  function renderForgotPasswordShell() {
    var shell = document.getElementById("tsi-login-shell");
    if (!shell) {
      return;
    }

    var prefillEmail = getResetPrefillEmail();
    if (!RESET_UI_STATE.email) {
      RESET_UI_STATE.email = prefillEmail;
    }

    shell.innerHTML = [
      '<div class="tsi-auth-card">',
      '  <a class="tsi-auth-backlink" href="/login">&#8592; Back to sign in</a>',
      '  <div class="tsi-auth-brand"><span class="tsi-auth-brand-dot"></span><span>TimelySync</span></div>',
      createAuthHeroIcon("reset"),
      '  <div class="tsi-auth-heading">',
      '    <h1 class="tsi-auth-title"><span class="tsi-auth-title-main">Forgot Password</span></h1>',
      '    <p class="tsi-auth-subtitle">' + escapeHtml(RESET_UI_STATE.codeSent ? "Enter the OTP and set a new password, then sign in with it." : "Enter your email first. If it is correct, an OTP will be sent for password reset.") + '</p>',
      "  </div>",
      '  <form class="tsi-auth-form" data-tsi-role="forgot-form">',
      '    <div class="tsi-auth-field">',
      '      <label class="tsi-auth-label" for="tsi-reset-email">Email Address *</label>',
      '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("email") + '<input class="tsi-auth-input" id="tsi-reset-email" name="email" type="email" placeholder="Enter your email" autocomplete="email" value="' + escapeHtml(RESET_UI_STATE.email || prefillEmail) + '" required /></div>',
      "    </div>",
      '    <button class="tsi-auth-secondary" type="button" data-tsi-role="send-code"' + (RESET_UI_STATE.submitting ? " disabled" : "") + ">" + (RESET_UI_STATE.submitting && !RESET_UI_STATE.codeSent ? "Verifying email..." : RESET_UI_STATE.codeSent ? "Resend OTP" : "Verify Email & Send OTP") + "</button>",
      '    <p class="tsi-auth-helper">' + escapeHtml(RESET_UI_STATE.codeSent ? "If the email is correct, the OTP above is valid for 10 minutes." : "We will verify the email and send a 6-digit OTP valid for 10 minutes.") + '</p>',
      createAuthMessage(RESET_UI_STATE.messageType, RESET_UI_STATE.message),
      RESET_UI_STATE.deliveryNote ? '<div class="tsi-auth-submessage">' + escapeHtml(RESET_UI_STATE.deliveryNote) + "</div>" : "",
      (RESET_UI_STATE.codeSent ? '    <div class="tsi-auth-field">' : ''),
      (RESET_UI_STATE.codeSent ? '      <label class="tsi-auth-label" for="tsi-reset-code">OTP *</label>' : ''),
      (RESET_UI_STATE.codeSent ? '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("code") + '<input class="tsi-auth-input" id="tsi-reset-code" name="code" type="text" inputmode="numeric" maxlength="6" placeholder="Enter the 6-digit OTP" value="' + escapeHtml(RESET_UI_STATE.code) + '" required /></div>' : ''),
      (RESET_UI_STATE.codeSent ? "    </div>" : ''),
      (RESET_UI_STATE.codeSent ? '    <div class="tsi-auth-field">' : ''),
      (RESET_UI_STATE.codeSent ? '      <label class="tsi-auth-label" for="tsi-reset-password">New Password *</label>' : ''),
      (RESET_UI_STATE.codeSent ? '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("lock") + '<input class="tsi-auth-input tsi-auth-input-password" id="tsi-reset-password" name="password" type="password" placeholder="Enter your new password" autocomplete="new-password" value="' + escapeHtml(RESET_UI_STATE.password || "") + '" required />' + createPasswordToggle() + '</div>' : ''),
      (RESET_UI_STATE.codeSent ? "    </div>" : ''),
      (RESET_UI_STATE.codeSent ? '    <div class="tsi-auth-field">' : ''),
      (RESET_UI_STATE.codeSent ? '      <label class="tsi-auth-label" for="tsi-reset-confirm">Confirm New Password *</label>' : ''),
      (RESET_UI_STATE.codeSent ? '      <div class="tsi-auth-input-wrap">' + createAuthInputIcon("lock") + '<input class="tsi-auth-input tsi-auth-input-password" id="tsi-reset-confirm" name="confirmPassword" type="password" placeholder="Confirm your new password" autocomplete="new-password" value="' + escapeHtml(RESET_UI_STATE.confirmPassword || "") + '" required />' + createPasswordToggle() + '</div>' : ''),
      (RESET_UI_STATE.codeSent ? "    </div>" : ''),
      (RESET_UI_STATE.codeSent ? '    <button class="tsi-auth-submit" type="submit"' + (RESET_UI_STATE.submitting ? " disabled" : "") + ">" + (RESET_UI_STATE.submitting ? "Verifying OTP..." : "Verify OTP & Reset Password") + "</button>" : ""),
      '    <div class="tsi-auth-footer">Remembered your password? <a href="/login">Sign in</a></div>',
      "  </form>",
      "</div>"
    ].join("");

    var form = shell.querySelector('[data-tsi-role="forgot-form"]');
    var sendCodeButton = shell.querySelector('[data-tsi-role="send-code"]');

    if (form) {
      Array.prototype.forEach.call(form.querySelectorAll("input"), function (input) {
        input.addEventListener("input", function () {
          if (input.name === "email") {
            RESET_UI_STATE.email = input.value;
          }
          if (input.name === "code") {
            RESET_UI_STATE.code = input.value;
          }
          if (input.name === "password") {
            RESET_UI_STATE.password = input.value;
          }
          if (input.name === "confirmPassword") {
            RESET_UI_STATE.confirmPassword = input.value;
          }
        });
      });
      form.addEventListener("submit", handleResetPasswordSubmit);
      bindPasswordToggles(form);
    }

    if (sendCodeButton) {
      sendCodeButton.addEventListener("click", handleForgotPasswordRequest);
    }
  }

  async function handleForgotPasswordRequest() {
    var shell = document.getElementById("tsi-login-shell");
    var emailInput = shell ? shell.querySelector('input[name="email"]') : null;
    var email = String(emailInput && emailInput.value || "").trim();

    RESET_UI_STATE.email = email;
    RESET_UI_STATE.message = "";
    RESET_UI_STATE.messageType = "";
    RESET_UI_STATE.deliveryNote = "";
    RESET_UI_STATE.code = "";
    RESET_UI_STATE.password = "";
    RESET_UI_STATE.confirmPassword = "";

    if (!email) {
      RESET_UI_STATE.message = "Email is required.";
      RESET_UI_STATE.messageType = "error";
      renderForgotPasswordShell();
      return;
    }

    RESET_UI_STATE.submitting = true;
    renderForgotPasswordShell();

    try {
      var response = await fetch(API_BASE + "/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      });

      var payload = null;
      try {
        payload = await response.json();
      } catch (parseError) {
        payload = null;
      }

      if (!response.ok) {
        RESET_UI_STATE.message = getApiErrorMessage(payload, "Unable to send reset code right now.");
        RESET_UI_STATE.messageType = "error";
      } else {
        RESET_UI_STATE.codeSent = true;
        RESET_UI_STATE.message = getApiErrorMessage(payload, "Email verified. OTP sent successfully.");
        RESET_UI_STATE.messageType = "success";
        if (payload && payload.resetCode) {
          RESET_UI_STATE.code = String(payload.resetCode || "");
          RESET_UI_STATE.deliveryNote = "OTP: " + String(payload.resetCode || "") + ". Enter it below to reset the password.";
        }
      }
    } catch (error) {
      RESET_UI_STATE.message = "Could not connect to the backend. Please make sure the server is running.";
      RESET_UI_STATE.messageType = "error";
    }

    RESET_UI_STATE.submitting = false;
    renderForgotPasswordShell();
  }

  async function handleResetPasswordSubmit(event) {
    event.preventDefault();

    var form = event.currentTarget;
    if (!form) {
      return;
    }

    var email = String(form.querySelector('input[name="email"]') && form.querySelector('input[name="email"]').value || "").trim();
    var code = String(form.querySelector('input[name="code"]') && form.querySelector('input[name="code"]').value || "").trim();
    var password = String(form.querySelector('input[name="password"]') && form.querySelector('input[name="password"]').value || "");
    var confirmPassword = String(form.querySelector('input[name="confirmPassword"]') && form.querySelector('input[name="confirmPassword"]').value || "");

    RESET_UI_STATE.email = email;
    RESET_UI_STATE.code = code;
    RESET_UI_STATE.password = password;
    RESET_UI_STATE.confirmPassword = confirmPassword;
    RESET_UI_STATE.message = "";
    RESET_UI_STATE.messageType = "";
    RESET_UI_STATE.deliveryNote = "";

    if (!email || !code || !password || !confirmPassword) {
      RESET_UI_STATE.message = "Email, reset code, and both password fields are required.";
      RESET_UI_STATE.messageType = "error";
      renderForgotPasswordShell();
      return;
    }

    if (password !== confirmPassword) {
      RESET_UI_STATE.message = "Passwords do not match.";
      RESET_UI_STATE.messageType = "error";
      renderForgotPasswordShell();
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)) {
      RESET_UI_STATE.message = "Password must be 8+ characters and include one uppercase letter, one number, and one special character.";
      RESET_UI_STATE.messageType = "error";
      renderForgotPasswordShell();
      return;
    }

    RESET_UI_STATE.submitting = true;
    RESET_UI_STATE.codeSent = true;
    renderForgotPasswordShell();

    try {
      var response = await fetch(API_BASE + "/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          code: code,
          password: password
        })
      });

      var payload = null;
      try {
        payload = await response.json();
      } catch (parseError) {
        payload = null;
      }

      if (!response.ok) {
        RESET_UI_STATE.message = getApiErrorMessage(payload, "Unable to reset password right now.");
        RESET_UI_STATE.messageType = "error";
        RESET_UI_STATE.submitting = false;
        renderForgotPasswordShell();
        return;
      }

      localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
      RESET_UI_STATE.message = "Password reset successfully. Redirecting to sign in...";
      RESET_UI_STATE.messageType = "success";
      RESET_UI_STATE.submitting = false;
      RESET_UI_STATE.password = "";
      RESET_UI_STATE.confirmPassword = "";
      renderForgotPasswordShell();

      window.setTimeout(function () {
        window.location.href = "/login";
      }, 700);
    } catch (error) {
      RESET_UI_STATE.message = "Could not connect to the backend. Please make sure the server is running.";
      RESET_UI_STATE.messageType = "error";
      RESET_UI_STATE.submitting = false;
      renderForgotPasswordShell();
    }
  }

  function enhanceForgotPasswordPage() {
    installStyles();
    document.body.classList.add("tsi-auth-page");
    AUTH_UI_STATE.message = "";
    AUTH_UI_STATE.messageType = "";
    AUTH_UI_STATE.submitting = false;

    var shell = document.getElementById("tsi-login-shell");
    if (!shell) {
      shell = document.createElement("div");
      shell.id = "tsi-login-shell";
      shell.className = "tsi-auth-shell";
      document.body.appendChild(shell);
    }

    shell.innerHTML = "";
    renderForgotPasswordShell();
  }

﻿
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

﻿
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


﻿  function renderPreview(container) {
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


﻿  function enhanceDashboardPage() {
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


﻿  function ensurePanel(card, fileInput) {
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


  function enhanceCurrentPage() {
    var params = new URLSearchParams(window.location.search || "");

    if (window.location.pathname === "/login" && params.get("forgot") === "1") {
      cleanupAuthPageShell();
      enhanceForgotPasswordPage();
      return;
    }

    if (window.location.pathname === "/login") {
      cleanupAuthPageShell();
      enhanceLoginPage();
      return;
    }

    if (window.location.pathname === "/signup") {
      cleanupAuthPageShell();
      enhanceSignupPage();
      return;
    }

    if (window.location.pathname === "/forgot-password") {
      var email = params.get("email");
      var target = "/login?forgot=1" + (email ? "&email=" + encodeURIComponent(email) : "");
      window.history.replaceState({}, "", target);
      enhanceForgotPasswordPage();
      return;
    }

    cleanupAuthPageShell();
    enhanceSharedNavigation();
    enhanceCreateTaskPage();
    enhanceDashboardPage();
    enhanceAccountabilityPage();
  }

  function handleRouteChange() {
    var currentRoute = window.location.pathname + window.location.search;
    if (SMART_STATE.lastRoute !== currentRoute) {
      SMART_STATE.lastRoute = currentRoute;
      if (window.location.pathname !== "/create-task") {
        SMART_STATE.highlighted = false;
      }
    }
  }

  function scheduleEnhance(delay) {
    if (SMART_STATE.scheduled) {
      return;
    }

    SMART_STATE.scheduled = true;
    window.setTimeout(function () {
      SMART_STATE.scheduled = false;
      handleRouteChange();
      enhanceCurrentPage();
    }, typeof delay === "number" ? delay : 0);
  }

  function installRouteHooks() {
    if (window.__tsiRouteHooksInstalled) {
      return;
    }

    window.__tsiRouteHooksInstalled = true;

    var originalPushState = history.pushState;
    var originalReplaceState = history.replaceState;

    history.pushState = function () {
      var result = originalPushState.apply(this, arguments);
      scheduleEnhance(60);
      return result;
    };

    history.replaceState = function () {
      var result = originalReplaceState.apply(this, arguments);
      scheduleEnhance(60);
      return result;
    };

    window.addEventListener("popstate", function () {
      scheduleEnhance(60);
    });

    window.addEventListener("load", function () {
      scheduleEnhance(120);
    });
  }

  function observeRouteChanges() {
    installRouteHooks();
    handleRouteChange();

    scheduleEnhance(0);
    scheduleEnhance(250);
    scheduleEnhance(800);
    scheduleEnhance(1600);
    scheduleEnhance(2600);
    scheduleEnhance(4200);

    window.setInterval(function () {
      handleRouteChange();
      if (
        window.location.pathname === "/create-task"
        || window.location.pathname === "/dashboard"
        || window.location.pathname === "/accountability"
      ) {
        scheduleEnhance(0);
      }
    }, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeRouteChanges);
  } else {
    observeRouteChanges();
  }
})();

