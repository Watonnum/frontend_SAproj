// Middleware สำหรับตรวจสอบ authentication
"use client";

import { useEffect } from "react";
import { checkLoginStatus } from "../lib/auth";

const useAuthCheck = () => {
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = checkLoginStatus();

      // ถ้าไม่ได้ login แต่อยู่ในหน้าที่ต้อง authenticate
      if (!isLoggedIn && typeof window !== "undefined") {
        console.log("⚠️ User not authenticated, login required");
        // ไม่ต้อง redirect เพราะ layout จะจัดการเอง
      }
    };

    checkAuth();

    // ตรวจสอบทุก 30 วินาที
    const interval = setInterval(checkAuth, 30000);

    return () => clearInterval(interval);
  }, []);
};

export default useAuthCheck;
