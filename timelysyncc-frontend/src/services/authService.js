import api from "./api";

const authService = {
  login(email, password) {
    return api.post("/auth/login", { email, password });
  },

  register(name, email, password, phoneNumber = "") {
    return api.post("/auth/register", {
      name,
      email,
      password,
      phoneNumber,
    });
  },

  verifyEmail(email, code) {
    return api.post("/auth/verify-email", { email, code });
  },

  resendVerification(email) {
    return api.post("/auth/resend-verification", { email });
  },

  forgotPassword(email) {
    return api.post("/auth/forgot-password", { email });
  },

  resetPassword(email, code, password) {
    return api.post("/auth/reset-password", { email, code, password });
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem("token");
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authService;
