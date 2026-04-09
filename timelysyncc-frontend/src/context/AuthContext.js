import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import authService from "../services/authService";

export const AuthContext = createContext();

function getApiMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password, remember = false) => {
    try {
      const response = await authService.login(email, password);
      const { token, user: userData } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));

      if (remember) {
        localStorage.setItem("timelysync.rememberedEmail", email);
      } else {
        localStorage.removeItem("timelysync.rememberedEmail");
      }

      setUser(userData);
      toast.success(`Welcome back, ${userData.name || "User"}!`);
      navigate("/dashboard");

      return { success: true, data: response.data };
    } catch (error) {
      const message = getApiMessage(error, "Login failed. Please try again.");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (name, email, password, phoneNumber = "") => {
    try {
      const response = await authService.register(name, email, password, phoneNumber);
      const verificationRequired = Boolean(response.data?.verificationRequired);

      if (verificationRequired) {
        toast.success("Account created. Please verify your email.");
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        toast.success("Registration successful! Please sign in.");
        navigate("/login");
      }

      return { success: true, data: response.data };
    } catch (error) {
      const message = getApiMessage(error, "Registration failed. Please try again.");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await authService.verifyEmail(email, code);
      toast.success(response.data?.message || "Email verified successfully.");
      navigate("/login");
      return { success: true, data: response.data };
    } catch (error) {
      const message = getApiMessage(error, "Verification failed. Please try again.");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await authService.resendVerification(email);
      toast.success(response.data?.message || "Verification code sent again.");
      return { success: true, data: response.data };
    } catch (error) {
      const message = getApiMessage(error, "Unable to resend verification code.");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      toast.success(response.data?.message || "Reset code sent.");
      return { success: true, data: response.data };
    } catch (error) {
      const message = getApiMessage(error, "Unable to send reset code.");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email, code, password) => {
    try {
      const response = await authService.resetPassword(email, code, password);
      toast.success(response.data?.message || "Password reset successfully.");
      navigate("/login");
      return { success: true, data: response.data };
    } catch (error) {
      const message = getApiMessage(error, "Unable to reset password.");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
