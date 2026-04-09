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
