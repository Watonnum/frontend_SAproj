"use client";

import { usePermissions } from "../hooks/usePermissions";

// Component สำหรับซ่อน/แสดง element ตาม permission
export const PermissionGuard = ({
  children,
  permission,
  fallback = null,
  role = null,
}) => {
  const { hasPermission, userRole } = usePermissions();

  // ถ้ากำหนด role เฉพาะ
  if (role && userRole !== role) {
    return fallback;
  }

  // ถ้ากำหนด permission เฉพาะ
  if (permission) {
    const [resource, action] = permission.split(":");
    if (!hasPermission(resource, action)) {
      return fallback;
    }
  }

  return children;
};

// Component สำหรับตรวจสอบ role
export const RoleGuard = ({ children, roles, fallback = null }) => {
  const { userRole } = usePermissions();

  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(userRole)) {
    return fallback;
  }

  return children;
};

// Component สำหรับแสดง UI ที่แตกต่างกันตาม role
export const ConditionalRender = ({
  admin,
  manager,
  operator,
  fallback = null,
}) => {
  const { userRole } = usePermissions();

  switch (userRole) {
    case "admin":
      return admin || fallback;
    case "manager":
      return manager || fallback;
    case "operator":
      return operator || fallback;
    default:
      return fallback;
  }
};

export default PermissionGuard;
