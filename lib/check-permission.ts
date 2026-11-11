import type { RolePermission } from "./master-data";
import { rolePermissions as defaultRolePermissions } from "./master-data";
import { ADMIN_ROLE, parseSessionRole, SESSION_KEY } from "./auth";

export function checkPermission(moduleId: string, action: string): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const role = parseSessionRole(localStorage.getItem(SESSION_KEY));

  if (!role) {
    return false;
  }

  if (role === ADMIN_ROLE) {
    return true;
  }

  const rawPermissions = localStorage.getItem("wheelskopi_v5_permissions");
  let permissions = defaultRolePermissions;

  if (rawPermissions) {
    try {
      permissions = JSON.parse(rawPermissions) as RolePermission[];
    } catch {
      permissions = defaultRolePermissions;
    }
  }

  const rolePermission =
    permissions.find((entry) => entry.roleName === role) ??
    defaultRolePermissions.find((entry) => entry.roleName === role);

  if (!rolePermission) {
    return false;
  }

  return rolePermission.permissions.includes(`${moduleId}_${action}`);
}
