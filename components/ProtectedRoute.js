// Protected Route Component
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkLoginStatus } from "../lib/auth";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = checkLoginStatus();

    if (!isLoggedIn) {
      // ถ้าไม่ได้ login ให้ redirect ไปหน้า login และคง path เดิมไว้
      console.log("🔒 User not authenticated, staying on current path");
      // ไม่ redirect แต่จะให้ layout แสดงหน้า login แทน
    }
  }, [router]);

  return <>{children}</>;
};

export default ProtectedRoute;
