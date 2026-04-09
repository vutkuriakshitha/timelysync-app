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
