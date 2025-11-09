"use client";

import { useState, useEffect } from "react";
import { getUserRole, hasPermission as checkPermission } from "../lib/auth";
import { ROLE_PERMISSIONS } from "../lib/permissions";

export const usePermissions = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    setLoading(false);
  }, []);

  // ฟังก์ชันสำหรับตรวจสอบ permission
  const hasPermission = (resource, action) => {
    if (!userRole) return false;
    return checkPermission(resource, action);
  };

  // ฟังก์ชันสำหรับตรวจสอบว่าเป็น admin หรือไม่
  const isAdmin = () => {
    return userRole === "admin";
  };

  // ฟังก์ชันสำหรับตรวจสอบว่าเป็น manager หรือไม่
  const isManager = () => {
    return userRole === "manager";
  };

  // ฟังก์ชันสำหรับตรวจสอบว่าเป็น operator หรือไม่
  const isOperator = () => {
    return userRole === "operator";
  };

  // ฟังก์ชันสำหรับตรวจสอบว่าเป็น admin หรือ manager
  const isAdminOrManager = () => {
    return ["admin", "manager"].includes(userRole);
  };

  // ฟังก์ชันสำหรับดูสิทธิ์ที่มี
  const getPermissions = () => {
    if (!userRole) return {};
    return ROLE_PERMISSIONS[userRole] || {};
  };

  // ฟังก์ชันสำหรับ refresh role
  const refreshRole = () => {
    const role = getUserRole();
    setUserRole(role);
  };

  return {
    userRole,
    loading,
    hasPermission,
    isAdmin,
    isManager,
    isOperator,
    isAdminOrManager,
    getPermissions,
    refreshRole,
  };
};

export default usePermissions;
