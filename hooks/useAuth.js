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
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบสถานะ login เมื่อ component mount (client-side only)
  useEffect(() => {
    const checkAuth = async () => {
      const status = checkLoginStatus();
      setIsLoggedIn(status);

      if (status) {
        try {
          // ตรวจสอบ token กับ server และดึงข้อมูลผู้ใช้
          const userData = getLoggedInUser();
          if (userData && userData.email) {
            setUser(userData);
          } else {
            // ถ้าไม่มีข้อมูลใน localStorage ให้ logout
            clearLoginStatus();
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error("Auth check error:", error);
          clearLoginStatus();
          setIsLoggedIn(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);

      const response = await fetch(`${api.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // บันทึก token
        localStorage.setItem("authToken", data.token);

        // บันทึกข้อมูลการ login
        saveLoginStatus(data.user.email, data.user.role, data.user);

        setIsLoggedIn(true);
        setUser(data.user);

        // ส่ง event เพื่อให้ data hooks รู้ว่ามีการ login
        window.dispatchEvent(new CustomEvent("auth-changed"));

        return {
          success: true,
          message: `ยินดีต้อนรับ, ${data.user.fName}`,
        };
      } else {
        return {
          success: false,
          message: data.message || "เข้าสู่ระบบไม่สำเร็จ",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // เรียก logout API (optional)
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          await fetch(`${api.baseURL}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Logout API error:", error);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // ล้างข้อมูลในทุกกรณี
      localStorage.removeItem("authToken");
      clearLoginStatus();
      setIsLoggedIn(false);
      setUser(null);

      // ส่ง event เพื่อให้ data hooks รู้ว่ามีการ logout
      window.dispatchEvent(new CustomEvent("auth-changed"));
    }
  }, []);

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
