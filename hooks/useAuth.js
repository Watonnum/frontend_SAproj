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

  // ฟังก์ชันตรวจสอบว่า token หมดอายุหรือยัง
  const isTokenExpired = useCallback((token) => {
    if (!token) {
      console.log("🔒 No token provided");
      return true;
    }

    try {
      // ตรวจสอบว่า token มีรูปแบบ JWT หรือไม่
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.log("🔒 Invalid JWT format");
        return true;
      }

      // แยก payload จาก JWT token
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;

      console.log("🔒 Token payload:", payload);
      console.log("🔒 Current time:", currentTime);
      console.log("🔒 Token exp:", payload.exp);
      console.log("🔒 Token expired:", payload.exp < currentTime);

      // ตรวจสอบว่าหมดอายุหรือยัง (exp เป็น timestamp ใน seconds)
      return payload.exp < currentTime;
    } catch (error) {
      // ถ้า decode token ไม่ได้ ถือว่าหมดอายุ
      console.error("🔒 Token decode error:", error);
      return true;
    }
  }, []);

  // ตรวจสอบสถานะ login เมื่อ component mount (client-side only)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = checkLoginStatus();
        const token = localStorage.getItem("authToken");

        console.log(
          "🔍 Auth Check - Status:",
          status,
          "Token exists:",
          !!token
        );

        if (status && token) {
          console.log("🔍 Checking token expiry...");
          // ตรวจสอบว่า token หมดอายุหรือยัง
          if (isTokenExpired(token)) {
            console.log("❌ Token expired, clearing auth");
            // Token หมดอายุ - ล้างข้อมูล
            clearLoginStatus();
            localStorage.removeItem("authToken");
            setIsLoggedIn(false);
            setUser(null);
          } else {
            console.log("✅ Token valid, loading user data");
            // Token ยังใช้ได้ - โหลดข้อมูลจาก localStorage
            const userData = getLoggedInUser();
            console.log("👤 User data from localStorage:", userData);
            if (userData && userData.email) {
              setUser(userData);
              setIsLoggedIn(true);
              // ส่ง event เพื่อให้ cart รู้ว่า auth พร้อมแล้ว
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent("auth-changed"));
              }, 100);
              console.log("✅ User authenticated:", userData);
            } else {
              console.log("❌ No valid user data in localStorage");
              clearLoginStatus();
              setIsLoggedIn(false);
              setUser(null);
            }
          }
        } else {
          console.log("❌ No login status or token found");
          // ไม่มี token หรือสถานะ
          clearLoginStatus();
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("🔒 Auth check error:", error);
        clearLoginStatus();
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isTokenExpired]);

  // ตั้ง timer เพื่อตรวจสอบ token expiry อัตโนมัติ
  useEffect(() => {
    if (isLoggedIn) {
      const checkTokenExpiry = () => {
        const token = localStorage.getItem("authToken");
        if (token && isTokenExpired(token)) {
          // Token หมดอายุ - logout อัตโนมัติ
          clearLoginStatus();
          localStorage.removeItem("authToken");
          setIsLoggedIn(false);
          setUser(null);
          window.dispatchEvent(new CustomEvent("auth-changed"));

          // แสดงข้อความแจ้งเตือน (ใช้ alert ชั่วคราว หรือสามารถใช้ toast ได้)
          alert("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
        }
      };

      // ตรวจสอบทุก 30 วินาที
      const interval = setInterval(checkTokenExpiry, 30000);

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, isTokenExpired]);

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

  // ฟังก์ชันดึง token จาก localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem("authToken");
  }, []);

  const value = {
    isLoggedIn,
    user,
    login,
    logout,
    loading,
    getToken,
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
