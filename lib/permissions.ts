"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useData } from "@/lib/context/data-context";
import { rolePermissions as defaultRolePermissions } from "@/lib/master-data";
import type { RolePermission } from "@/lib/master-data";
import {
  ADMIN_ROLE,
  parseSessionRole,
  readSessionRaw,
  subscribeSession,
} from "@/lib/auth";

export type PermissionAction = "view" | "input" | "edit" | "delete";

export interface PermissionModule {
  id: string;
  label: string;
  actions: PermissionAction[];
}

export interface PermissionGroup {
  groupName: string;
  modules: PermissionModule[];
}

export const MODULE_GROUPS: PermissionGroup[] = [
  {
    groupName: "Dashboard",
    modules: [{ id: "dashboard", label: "Dashboard", actions: ["view"] }],
  },
  {
    groupName: "Master Management",
    modules: [
      { id: "product", label: "Product & Stok", actions: ["view", "input", "edit", "delete"] },
      { id: "supplier", label: "Supplier", actions: ["view", "input", "edit", "delete"] },
      { id: "user", label: "User", actions: ["view", "input", "edit", "delete"] },
      { id: "store", label: "Store", actions: ["view", "input", "edit", "delete"] },
      { id: "payment", label: "Payment", actions: ["view", "input", "edit", "delete"] },
      { id: "service", label: "Service", actions: ["view", "input", "edit", "delete"] },
      { id: "library", label: "Library Cars", actions: ["view", "input", "edit", "delete"] },
      { id: "community", label: "Community", actions: ["view", "input", "edit", "delete"] },
      { id: "customer", label: "Customer", actions: ["view", "input", "edit", "delete"] },
      { id: "discount", label: "Voucher & Discount", actions: ["view", "input", "edit", "delete"] },
    ],
  },
  {
    groupName: "Distribusi & Stok",
    modules: [
      { id: "distribusi", label: "Data Distribusi", actions: ["view", "input", "edit", "delete"] },
    ],
  },
  {
    groupName: "Transaksi",
    modules: [
      { id: "purchase-order", label: "Purchase Orders", actions: ["view", "input", "edit", "delete"] },
      { id: "receipt", label: "Receipt PO", actions: ["view", "input"] },
      { id: "sellout", label: "Sellout", actions: ["view", "input", "edit", "delete"] },
      { id: "invoice", label: "Invoice", actions: ["view", "input"] },
      { id: "movement", label: "Movement", actions: ["view", "input", "delete"] },
      { id: "daily-spend", label: "Daily Spend", actions: ["view", "input", "edit", "delete"] },
      { id: "finance-store", label: "Finance Store", actions: ["view", "input", "edit", "delete"] },
      { id: "sales-order", label: "Sales Orders", actions: ["view"] },
      { id: "sellout-global", label: "Sellout Global", actions: ["view", "input", "edit", "delete"] },
      { id: "daily-spend-global", label: "Daily Spend Global", actions: ["view", "edit", "delete"] },
      { id: "trade-sellout", label: "Trade Sellout", actions: ["view", "input", "edit", "delete"] },
    ],
  },
  {
    groupName: "Operasional",
    modules: [
      { id: "mekanik", label: "Halaman Mekanik", actions: ["view", "edit"] },
    ],
  },
  {
    groupName: "Laporan & Analitik",
    modules: [
      { id: "report", label: "Report", actions: ["view"] },
      { id: "profit", label: "Analytics & Profit", actions: ["view"] },
    ],
  },
];

const ROUTE_MODULES: Array<[string, string]> = [
  ["/settings/utility", "utility"],
  ["/settings/permissions", "utility"],
  ["/report/trade-sellout", "trade-sellout"],
  ["/report/sellout", "report"],
  ["/report/profit", "report"],
  ["/transaction/receipt", "receipt"],
  ["/transaction/sellout", "sellout"],
  ["/transaction/invoice", "invoice"],
  ["/transaction/movement", "movement"],
  ["/transaction/daily-spend", "daily-spend"],
  ["/transaction/sales-orders", "sales-order"],
  ["/transaction/sellout-global", "sellout-global"],
  ["/transaction/daily-spend-global", "daily-spend-global"],
  ["/transaction/work", "sellout"],
  ["/mekanik", "mekanik"],
  ["/purchase-orders", "purchase-order"],
  ["/finance-store", "finance-store"],
  ["/distribusi", "distribusi"],
  ["/products", "product"],
  ["/master-data", "product"],
  ["/others", "product"],
  ["/stock-list", "product"],
  ["/suppliers", "supplier"],
  ["/stores", "store"],
  ["/users", "user"],
  ["/payments", "payment"],
  ["/services", "service"],
  ["/library-cars", "library"],
  ["/communities", "community"],
  ["/customers", "customer"],
  ["/discounts", "discount"],
  ["/profit", "profit"],
  ["/", "dashboard"],
];

const ADMIN_ONLY_PATHS = ["/settings/utility", "/settings/permissions"];

export function moduleForPath(pathname: string): string | undefined {
  const match = ROUTE_MODULES.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return match?.[1];
}

export function isAdminOnlyPath(pathname: string): boolean {
  return ADMIN_ONLY_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function resolvePermissions(
  permissions: RolePermission[],
  role: string | undefined,
): string[] {
  if (!role) return [];

  const entry =
    permissions.find((item) => item.roleName === role) ??
    defaultRolePermissions.find((item) => item.roleName === role);

  return entry?.permissions ?? [];
}

export function hasPermission(
  permissions: RolePermission[],
  role: string | undefined,
  moduleId: string,
  action: PermissionAction,
): boolean {
  if (!role) return false;
  if (role === ADMIN_ROLE) return true;

  return resolvePermissions(permissions, role).includes(`${moduleId}_${action}`);
}

export function useCan() {
  const { rolePermissions } = useData();
  const rawSession = useSyncExternalStore(
    subscribeSession,
    readSessionRaw,
    () => null,
  );

  return useCallback(
    (moduleId: string, action: PermissionAction) => {
      if (rawSession === null) return true;

      return hasPermission(
        rolePermissions,
        parseSessionRole(rawSession),
        moduleId,
        action,
      );
    },
    [rawSession, rolePermissions],
  );
}

export function usePermission(moduleId: string, action: PermissionAction) {
  const can = useCan();

  return can(moduleId, action);
}

export function useIsAdministrator() {
  const rawSession = useSyncExternalStore(
    subscribeSession,
    readSessionRaw,
    () => null,
  );

  if (rawSession === null) return true;

  return parseSessionRole(rawSession) === ADMIN_ROLE;
}
