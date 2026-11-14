"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Edit3,
  LockKeyhole,
  Save,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { useClientMounted } from "@/lib/use-client-mounted";
import {
  ADMIN_ROLE,
} from "@/lib/auth";
import {
  MODULE_GROUPS,
  useIsAdministrator,
  type PermissionAction,
} from "@/lib/permissions";
import {
  rolePermissions as defaultRolePermissions,
  roles as defaultRoleNames,
  type RolePermission,
} from "@/lib/master-data";

function actionLabel(action: PermissionAction) {
  const labels: Record<PermissionAction, string> = {
    view: "View",
    input: "Input",
    edit: "Edit",
    delete: "Delete",
  };

  return labels[action];
}

export default function UtilityPage() {
  const { roles, rolePermissions, setRolePermissions } = useData();
  const storedIsAdministrator = useIsAdministrator();
  const clientMounted = useClientMounted();
  const isAdministrator = clientMounted ? storedIsAdministrator : true;
  const activeRoles = clientMounted ? roles : defaultRoleNames;

  const activeRolePermissions = clientMounted
    ? rolePermissions
    : defaultRolePermissions;

  const [editingRole, setEditingRole] = useState<RolePermission | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const allRoles = useMemo(
    () => Array.from(new Set([...defaultRoleNames, ...activeRoles])),
    [activeRoles],
  );

  const getRolePermissions = (roleName: string) =>
    activeRolePermissions.find((entry) => entry.roleName === roleName) ??
    defaultRolePermissions.find((entry) => entry.roleName === roleName) ?? {
      roleName,
      permissions: [],
    };

  const openEditor = (roleName: string) => {
    if (!isAdministrator || roleName === ADMIN_ROLE) return;

    setEditingRole({
      roleName,
      permissions: [...getRolePermissions(roleName).permissions],
    });
    setSelectedTab(0);
  };

  const toggleAction = (moduleId: string, action: PermissionAction) => {
    if (!editingRole) return;

    const permission = `${moduleId}_${action}`;

    const permissions = editingRole.permissions.includes(permission)
      ? editingRole.permissions.filter((entry) => entry !== permission)
      : [...editingRole.permissions, permission];

    setEditingRole({ ...editingRole, permissions });
  };

  const toggleModule = (moduleId: string, actions: PermissionAction[]) => {
    if (!editingRole) return;

    const modulePermissions = actions.map((action) => `${moduleId}_${action}`);

    const allChecked = modulePermissions.every((permission) =>
      editingRole.permissions.includes(permission),
    );

    const permissions = allChecked
      ? editingRole.permissions.filter(
          (entry) => !entry.startsWith(`${moduleId}_`),
        )
      : [...new Set([...editingRole.permissions, ...modulePermissions])];

    setEditingRole({ ...editingRole, permissions });
  };

  const toggleTab = () => {
    if (!editingRole) return;

    const modules = MODULE_GROUPS[selectedTab].modules;

    const tabPermissions = modules.flatMap((module) =>
      module.actions.map((action) => `${module.id}_${action}`),
    );

    const allChecked = tabPermissions.every((permission) =>
      editingRole.permissions.includes(permission),
    );

    const permissions = allChecked
      ? editingRole.permissions.filter(
          (entry) =>
            !modules.some((module) => entry.startsWith(`${module.id}_`)),
        )
      : [...new Set([...editingRole.permissions, ...tabPermissions])];

    setEditingRole({ ...editingRole, permissions });
  };

  const savePermissions = () => {
    if (!editingRole || !isAdministrator || editingRole.roleName === ADMIN_ROLE) {
      return;
    }

    const exists = rolePermissions.some(
      (entry) => entry.roleName === editingRole.roleName,
    );

    if (exists) {
      setRolePermissions(
        rolePermissions.map((entry) =>
          entry.roleName === editingRole.roleName ? editingRole : entry,
        ),
      );
    } else {
      setRolePermissions([...rolePermissions, editingRole]);
    }

    setEditingRole(null);
  };

  const selectedGroup = MODULE_GROUPS[selectedTab];

  const selectedTabPermissions = selectedGroup.modules.flatMap((module) =>
    module.actions.map((action) => `${module.id}_${action}`),
  );

  const selectedTabAllChecked =
    selectedTabPermissions.length > 0 &&
    selectedTabPermissions.every((permission) =>
      editingRole?.permissions.includes(permission),
    );

  return (
    <AppShell>
      <div className="w-full space-y-4">
        <section className="liquid-glass w-full rounded-2xl p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wrench className="size-5" />
              </span>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                  Utility
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Atur izin setiap role. Semua pengguna dengan role yang sama
                  otomatis mengikuti izin ini. Hanya Administrator yang dapat
                  mengubah pengaturan.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
                <LockKeyhole className="size-3.5" />
                Administrator only
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-muted-foreground">
                <Users className="size-3.5" />
                {allRoles.length} role
              </span>
            </div>
          </div>
        </section>

        <section className="surface w-full overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="w-16 px-5 py-4 text-center font-semibold">No</th>
                  <th className="px-5 py-4 font-semibold">Level / Role</th>
                  <th className="px-5 py-4 font-semibold">Total Izin</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="w-28 px-5 py-4 text-center font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allRoles.map((roleName, index) => {
                  const permissions = getRolePermissions(roleName);
                  const isAdminRole = roleName === ADMIN_ROLE;

                  return (
                    <tr
                      key={roleName}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-5 py-4 text-center text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 font-display text-xs font-semibold text-primary">
                            {roleName.slice(0, 2).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-semibold text-foreground">
                              {roleName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isAdminRole
                                ? "Akses penuh ke seluruh aplikasi"
                                : "Izin mengikuti pengaturan Utility"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {isAdminRole
                          ? "Semua akses"
                          : `${permissions.permissions.length} akses`}
                      </td>
                      <td className="px-5 py-4">
                        {isAdminRole ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                            <ShieldCheck className="size-3.5" />
                            Full access
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                            <Check className="size-3.5" />
                            Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => openEditor(roleName)}
                          disabled={!isAdministrator || isAdminRole}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Edit3 className="size-3.5" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {editingRole && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="liquid-glass flex max-h-[96vh] w-full max-w-[1400px] flex-col rounded-2xl p-4 animate-[rise-in_0.3s_ease-out] sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Level
                  </p>
                  <h2 className="font-display text-xl font-semibold tracking-tight">
                    {editingRole.roleName}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Tutup"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="no-scrollbar flex flex-1 gap-1 overflow-x-auto border-b border-border">
                {MODULE_GROUPS.map((group, index) => (
                  <button
                    key={group.groupName}
                    type="button"
                    onClick={() => setSelectedTab(index)}
                    className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                      selectedTab === index
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {group.groupName}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={toggleTab}
                className="hidden shrink-0 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              >
                {selectedTabAllChecked ? "Kosongkan tab" : "Pilih semua tab"}
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {selectedGroup.modules.map((module) => {
                  const modulePermissions = module.actions.map(
                    (action) => `${module.id}_${action}`,
                  );

                  const allChecked = modulePermissions.every((permission) =>
                    editingRole.permissions.includes(permission),
                  );

                  return (
                    <div
                      key={module.id}
                      className="rounded-xl border border-border bg-muted/10 p-4"
                    >
                      <label className="flex cursor-pointer items-center gap-2 font-semibold text-foreground">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={() => toggleModule(module.id, module.actions)}
                          className="size-4 rounded border-border text-primary focus:ring-primary"
                        />
                        {module.label}
                      </label>

                      <div className="mt-3 space-y-2 border-l-2 border-border/60 pl-4">
                        {module.actions.map((action) => (
                          <label
                            key={action}
                            className="group flex cursor-pointer items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={editingRole.permissions.includes(
                                `${module.id}_${action}`,
                              )}
                              onChange={() => toggleAction(module.id, action)}
                              className="size-3.5 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-xs text-muted-foreground capitalize transition-colors group-hover:text-foreground">
                              {actionLabel(action)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={savePermissions}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                <Save className="size-4" />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
