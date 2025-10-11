// Hook สำหรับจัดการ authentication state
"use client";

import { useState, useEffect, createContext, useContext } from "react";
import {
  checkLoginStatus,
  saveLoginStatus,
  clearLoginStatus,
  getLoggedInUser,
} from "../lib/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ตรวจสอบสถานะ authentication เมื่อ app โหลด
    const checkAuth = () => {
      const isLoggedIn = checkLoginStatus();
      const currentUser = getLoggedInUser();

      setIsAuthenticated(isLoggedIn);
      setUser(currentUser);
      setIsLoading(false);

      console.log("🔐 Auth status checked:", { isLoggedIn, currentUser });
    };

    checkAuth();
  }, []);

  const login = (email) => {
    saveLoginStatus(email);
    setIsAuthenticated(true);
    setUser(email);
    console.log("✅ User logged in:", email);
  };

  const logout = () => {
    clearLoginStatus();
    setIsAuthenticated(false);
    setUser(null);
    console.log("🚪 User logged out");
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
