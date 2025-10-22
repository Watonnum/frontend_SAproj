// Hook สำหรับจัดการ authentication state
"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  checkLoginStatus,
  saveLoginStatus,
  clearLoginStatus,
  getLoggedInUser,
} from "../lib/auth";
import { useUsers } from "./useUsers"; // Import useUsers

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { users, updateUsers, loading: usersLoading } = useUsers(); // Get users and updateUsers

  useEffect(() => {
    const status = checkLoginStatus();
    setIsLoggedIn(status);
    if (status) {
      const loggedInUserEmail = getLoggedInUser();
      if (loggedInUserEmail && users.length > 0) {
        const currentUser = users.find(
          (u) => u.email === loggedInUserEmail && u.isActive
        );
        setUser(currentUser || null);
      }
    }
    setLoading(false);
  }, [users]); // Re-run when users array is updated

  const login = useCallback(
    (email, password) => {
      if (usersLoading) {
        console.log("Cannot log in while users are loading.");
        return { success: false, message: "กำลังโหลดข้อมูลผู้ใช้..." };
      }
      const userToLogin = users.find(
        (u) => u.email === email && u.passwordHash === password
      );

      if (userToLogin) {
        updateUsers(userToLogin._id, { isActive: true });
        saveLoginStatus(email);
        setIsLoggedIn(true);
        setUser(userToLogin);
        return {
          success: true,
          message: `ยินดีต้อนรับ, ${userToLogin.fName}`,
        };
      }
      return { success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    },
    [users, updateUsers, usersLoading]
  );

  const logout = useCallback(() => {
    if (user) {
      updateUsers(user._id, { isActive: false });
    }
    clearLoginStatus();
    setIsLoggedIn(false);
    setUser(null);
  }, [user, updateUsers]);

  const value = {
    isLoggedIn,
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
