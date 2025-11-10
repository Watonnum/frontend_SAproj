// Authentication utilities for managing login state
"use client";

import { hasPermission as checkPermission } from "./permissions";

// ฟังก์ชันสำหรับตรวจสอบสถานะการ login จาก localStorage
export const checkLoginStatus = () => {
  try {
    // ตรวจสอบว่าเรากำลังรันบน client-side หรือไม่
    if (typeof window === "undefined") {
      return false;
    }

    const loginStatus = localStorage.getItem("isLoggedIn");
    const token = localStorage.getItem("authToken");

    console.log(
      "🔍 checkLoginStatus - loginStatus:",
      loginStatus,
      "token exists:",
      !!token
    );

    // ตรวจสอบว่ามี loginStatus และ token
    if (loginStatus === "true" && token) {
      return true; // ปล่อยให้ useAuth.js จัดการ token expiry
    } else {
      console.log("❌ No valid login status or token");
      clearLoginStatus();
      return false;
    }
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
};

// ฟังก์ชันสำหรับบันทึกสถานะการ login
export const saveLoginStatus = (email, role = "operator", userData = {}) => {
  try {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loginTime", new Date().getTime().toString());
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userData", JSON.stringify(userData));
    console.log("✅ Login status saved for:", email, "Role:", role);
  } catch (error) {
    console.error("Error saving login status:", error);
  }
};

// ฟังก์ชันสำหรับลบสถานะการ login
export const clearLoginStatus = () => {
  try {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("loginTime");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    console.log("🗑️ Login status cleared");
  } catch (error) {
    console.error("Error clearing login status:", error);
  }
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ที่ login อยู่
export const getLoggedInUser = () => {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const loginStatus = localStorage.getItem("isLoggedIn");
    const token = localStorage.getItem("authToken");

    // ตรวจสอบเฉพาะ localStorage ไม่เรียก checkLoginStatus
    if (loginStatus === "true" && token) {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      console.log("👤 getLoggedInUser - userData:", userData);

      return {
        email: localStorage.getItem("userEmail"),
        role: localStorage.getItem("userRole") || "operator",
        ...userData, // spread userData properties
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting logged in user:", error);
    return null;
  }
};

// ฟังก์ชันสำหรับดึง role ของผู้ใช้
export const getUserRole = () => {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    const isLoggedIn = checkLoginStatus();
    if (isLoggedIn) {
      return localStorage.getItem("userRole") || "operator";
    }
    return null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

// ฟังก์ชันสำหรับตรวจสอบ permission ในฝั่ง frontend
export const hasPermission = (resource, action) => {
  const role = getUserRole();
  if (!role) return false;

  return checkPermission(role, resource, action);
};
