"use client";

import { useState } from "react";
import { Shield, Save, X, Edit, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import type { RolePermission } from "@/lib/context/data-context";

// DEFINISI STRUKTUR MENU & AKSI (Sesuai Gambar Referensi)
const MODULE_GROUPS = [
  {
    groupName: "Dashboard",
    modules: [
      { id: "dashboard", label: "Dashboard", actions: ["view"] }
    ]
  },
  {
    groupName: "Master Management",
    modules: [
      { id: "product", label: "Product", actions: ["view", "input", "edit", "delete"] },
      { id: "supplier", label: "Supplier", actions: ["view", "input", "edit", "delete"] },
      { id: "user", label: "User", actions: ["view", "input", "edit", "delete"] },
      { id: "store", label: "Store", actions: ["view", "input", "edit", "delete"] },
      { id: "payment", label: "Payment", actions: ["view", "input", "edit", "delete"] },
      { id: "service", label: "Service", actions: ["view", "input", "edit", "delete"] },
      { id: "library", label: "Library Cars", actions: ["view", "input", "edit", "delete"] },
      { id: "community", label: "Community", actions: ["view", "input", "edit", "delete"] },
      { id: "customer", label: "Customer", actions: ["view", "input", "edit", "delete"] },
      { id: "discount", label: "Voucher & Discount", actions: ["view", "input", "edit", "delete"] },
    ]
  },
  {
    groupName: "Transaksi & Laporan",
    modules: [
      { id: "distribusi", label: "Data Distribusi", actions: ["view", "input", "edit", "delete"] },
      { id: "purchase-order", label: "Purchase Orders", actions: ["view", "input", "edit", "delete"] },
      { id: "receipt", label: "Receipt PO", actions: ["view", "input", "edit", "delete"] },
      { id: "daily-spend", label: "Daily Spend", actions: ["view", "input", "edit", "delete"] },
      { id: "finance-store", label: "Finance Store", actions: ["view", "input", "edit", "delete"] },
      { id: "report", label: "Report", actions: ["view"] },
    ]
  }
];

export default function PermissionsPage() {
  // AMBIL DATA DARI CONTEXT (Sudah termasuk localStorage)
  const { roles, rolePermissions, setRolePermissions } = useData();

  const [editingRole, setEditingRole] = useState<RolePermission | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Fungsi membuka modal
  const handleEditClick = (roleName: string) => {
    const existing = rolePermissions.find((rp: RolePermission) => rp.roleName === roleName);

    if (existing) {
      setEditingRole(JSON.parse(JSON.stringify(existing))); // Deep copy
    } else {
      setEditingRole({ roleName, permissions: [] });
    }

    setSelectedTab(0);
  };

  // Fungsi Toggle Aksi
  const handleToggleAction = (moduleId: string, action: string) => {
    if (!editingRole) return;
    
    const permString = `${moduleId}_${action}`;
    const isChecked = editingRole.permissions.includes(permString);
    
    const newPermissions = isChecked 
      ? editingRole.permissions.filter(p => p !== permString)
      : [...editingRole.permissions, permString];

    setEditingRole({ ...editingRole, permissions: newPermissions });
  };

  // Cek apakah role punya akses spesifik
  const hasPermission = (moduleId: string, action: string) => {
    return editingRole?.permissions.includes(`${moduleId}_${action}`) || false;
  };

  // Simpan Perubahan ke Context (Otomatis tersimpan ke localStorage)
  const handleSave = () => {
    if (editingRole) {
      const exists = rolePermissions.find((rp: RolePermission) => rp.roleName === editingRole.roleName);

      if (exists) {
        setRolePermissions(rolePermissions.map((rp: RolePermission) => 
          rp.roleName === editingRole.roleName ? editingRole : rp
        ));
      } else {
        setRolePermissions([...rolePermissions, editingRole]);
      }

      setEditingRole(null);
    }
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="size-6 text-primary" /> Role & Permission
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Atur hak akses detail (View, Input, Edit, Delete) untuk setiap Role.</p>
        </div>

        {/* TABEL ROLE */}
        <div className="surface overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-4 font-semibold w-16 text-center">No</th>
                <th className="px-5 py-4 font-semibold">Level / Role</th>
                <th className="px-5 py-4 font-semibold">Total Izin</th>
                <th className="px-5 py-4 font-semibold text-center">Edit</th>
                <th className="px-5 py-4 font-semibold text-center">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* KARENA KITA INGIN MENAMPILKAN SEMUA ROLE DARI USER, KITA LOOPING DARI roles */}
              {roles.map((roleName: string, index: number) => {
                const rp = rolePermissions.find((r: RolePermission) => r.roleName === roleName) || { roleName, permissions: [] };
                
                return (
                  <tr key={roleName} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 text-center text-muted-foreground">{index + 1}</td>
                    <td className="px-5 py-4 font-medium text-foreground uppercase">{roleName}</td>
                    <td className="px-5 py-4 text-muted-foreground">{rp.permissions.length} Akses</td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => handleEditClick(roleName)}
                        className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors"
                        title="Edit Akses"
                      >
                        <Edit className="size-4" />
                      </button>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button 
                        onClick={() => {
                          if(confirm(`Hapus semua akses untuk role ${roleName}?`)) {
                            setRolePermissions(rolePermissions.filter((r) => r.roleName !== roleName));
                          }
                        }}
                        className="rounded-lg bg-red-500/10 p-2 text-red-600 hover:bg-red-500/20 transition-colors"
                        title="Hapus Akses"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {roles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    Belum ada role. Tambahkan role di menu Management User.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT PERMISSION */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-6xl rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] max-h-[95vh] flex flex-col liquid-glass">
            
            {/* Header Modal */}
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-foreground">Level:</h2>
                <input 
                  type="text" 
                  value={editingRole.roleName} 
                  readOnly 
                  className="rounded-lg border border-border bg-muted px-4 py-1.5 text-sm font-semibold text-foreground cursor-not-allowed uppercase"
                />
              </div>
              <button onClick={() => setEditingRole(null)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>

            {/* TABS */}
            <div className="flex border-b border-border mb-4">
              {MODULE_GROUPS.map((group, idx) => (
                <button
                  key={group.groupName}
                  onClick={() => setSelectedTab(idx)}
                  className={`px-6 py-2 text-sm font-medium border-b-2 transition-colors ${
                    selectedTab === idx 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {group.groupName}
                </button>
              ))}
            </div>

            {/* KONTEN CHECKBOX */}
            <div className="flex-1 overflow-y-auto pr-2 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MODULE_GROUPS[selectedTab].modules.map((modul) => (
                  <div key={modul.id} className="border border-border rounded-xl p-4 bg-muted/10">
                    <label className="flex items-center gap-2 font-semibold text-foreground mb-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={modul.actions.every(action => hasPermission(modul.id, action))}
                        onChange={(e) => {
                          const allActions = modul.actions;

                          if (e.target.checked) {
                            const newPerms = allActions.map(a => `${modul.id}_${a}`);
                            setEditingRole({ ...editingRole, permissions: [...new Set([...editingRole.permissions, ...newPerms])] });
                          } else {
                            setEditingRole({ ...editingRole, permissions: editingRole.permissions.filter(p => !p.startsWith(`${modul.id}_`)) });
                          }
                        }}
                        className="size-4 rounded border-border text-primary focus:ring-primary"
                      />
                      {modul.label}
                    </label>
                    
                    <div className="space-y-2 pl-6 border-l-2 border-border/50">
                      {modul.actions.map((action) => (
                        <label key={action} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={hasPermission(modul.id, action)}
                            onChange={() => handleToggleAction(modul.id, action)}
                            className="size-3.5 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-muted-foreground capitalize group-hover:text-foreground transition-colors">
                            {action}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="mt-4 flex justify-end gap-3 border-t border-border pt-4">
              <button onClick={() => setEditingRole(null)} className="rounded-lg px-6 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Batal</button>
              <button onClick={handleSave} className="flex items-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
                <Save className="size-4" /> Simpan Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
