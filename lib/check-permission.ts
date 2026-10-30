import type { RolePermission } from "./context/data-context";

interface Session {
  role?: string;
}

export function checkPermission(moduleId: string, action: string): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const rawUser = localStorage.getItem("wheelskopi_logged_in_user");

  if (!rawUser) {
    return true;
  }

  // SAFETY: the session value is written by the login flow using this shape.
  const currentUser = JSON.parse(rawUser) as Session;
  const rawPermissions = localStorage.getItem("wheelskopi_v2_permissions");

  if (!rawPermissions) {
    return true;
  }

  // SAFETY: role permissions are written by DataProvider as RolePermission[].
  const permissions = JSON.parse(rawPermissions) as RolePermission[];
  const rolePermission = permissions.find((entry) => entry.roleName === currentUser.role);

  if (!rolePermission) {
    return true;
  }

  return rolePermission.permissions.includes(`${moduleId}_${action}`);
}
