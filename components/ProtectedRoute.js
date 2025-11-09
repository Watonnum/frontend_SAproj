// Protected Route Component
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkLoginStatus } from "../lib/auth";
import { usePermissions } from "../hooks/usePermissions";

const ProtectedRoute = ({
  children,
  requiredPermission = null,
  fallbackPath = "/pos",
}) => {
  const router = useRouter();
  const { hasPermission, userRole } = usePermissions();

  useEffect(() => {
    const isLoggedIn = checkLoginStatus();

    if (!isLoggedIn) {
      // ถ้าไม่ได้ login ให้ redirect ไปหน้า login และคง path เดิมไว้
      console.log("🔒 User not authenticated, staying on current path");
      // ไม่ redirect แต่จะให้ layout แสดงหน้า login แทน
      return;
    }

    // ถ้า login แล้วและมีการกำหนด permission requirement
    if (requiredPermission && userRole) {
      const [resource, action] = requiredPermission.split(":");
      if (!hasPermission(resource, action)) {
        console.log(
          `🚫 Access denied. User role: ${userRole}, Required: ${requiredPermission}`
        );
        router.push(fallbackPath);
        return;
      }
    }
  }, [router, requiredPermission, fallbackPath, hasPermission, userRole]);

  return <>{children}</>;
};

export default ProtectedRoute;
