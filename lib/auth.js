// Authentication utilities for managing login state
"use client";

// ฟังก์ชันสำหรับตรวจสอบสถานะการ login จาก localStorage
export const checkLoginStatus = () => {
  try {
    // ตรวจสอบว่าเรากำลังรันบน client-side หรือไม่
    if (typeof window === "undefined") {
      return false;
    }

    const loginStatus = localStorage.getItem("isLoggedIn");
    const loginTime = localStorage.getItem("loginTime");

    if (loginStatus === "true" && loginTime) {
      // ตรวจสอบว่า login ยังไม่หมดอายุ (24 ชั่วโมง)
      const currentTime = new Date().getTime();
      const storedTime = parseInt(loginTime);
      const hoursPassed = (currentTime - storedTime) / (1000 * 60 * 60);

      if (hoursPassed < 24) {
        return true;
      } else {
        // หมดอายุแล้ว ลบข้อมูลออกจาก localStorage
        clearLoginStatus();
      }
    }
    return false;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
};

// ฟังก์ชันสำหรับบันทึกสถานะการ login
export const saveLoginStatus = (email) => {
  try {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("loginTime", new Date().getTime().toString());
    localStorage.setItem("userEmail", email);
    console.log("✅ Login status saved for:", email);
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

    const isLoggedIn = checkLoginStatus();
    if (isLoggedIn) {
      return localStorage.getItem("userEmail");
    }
    return null;
  } catch (error) {
    console.error("Error getting logged in user:", error);
    return null;
  }
};
