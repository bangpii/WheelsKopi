"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  ShieldAlert,
  Settings,
  Upload,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { stores, users as demoUsers } from "@/lib/master-data";

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: string;
  phone: string;
  store: string;
  fotoKtp: string;
  status: "Aktif" | "Nonaktif";
}

const subscribeToMount = () => () => {};

function readStoredUsers(): User[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedUsers = localStorage.getItem("wheelskopi_v2_users");

  if (!savedUsers) {
    return demoUsers;
  }

  try {
    return JSON.parse(savedUsers);
  } catch (error) {
    console.error("Gagal parse data user", error);

    return [];
  }
}

interface UserFormData {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  phone: string;
  store: string;
  fotoKtp: string;
  status: "Aktif" | "Nonaktif";
}

export default function UsersPage() {
  const { roles, setRoles } = useData();

  const isMounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const [users, setUsers] = useState<User[]>(readStoredUsers);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "",
    phone: "",
    store: stores[0].storeName,
    fotoKtp: "",
    status: "Aktif",
  });

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  // SIMPAN KE LOCALSTORAGE SETIAP KALI USERS BERUBAH (HANYA JIKA SUDAH MOUNTED)
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("wheelskopi_v2_users", JSON.stringify(users));
    }
  }, [users, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("wheelskopi_v2_roles", JSON.stringify(roles));
    }
  }, [roles, isMounted]);

  const handleAddClick = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      role: roles[0] || "",
      phone: "",
      store: stores[0].storeName,
      fotoKtp: "",
      status: "Aktif",
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      password: "",
      role: user.role,
      phone: user.phone,
      store: user.store ?? stores[0].storeName,
      fotoKtp: user.fotoKtp,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus user ini?")) setUsers(users.filter((u) => u.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setUsers(
      users.map((u) => {
        if (u.id === id) {
          return { ...u, status: u.status === "Aktif" ? "Nonaktif" : "Aktif" };
        }

        return u;
      }),
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const updatedUser = { ...editingUser, ...formData };

      if (!formData.password) updatedUser.password = editingUser.password || "";
      setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)));
    } else {
      const newUser: User = { id: Date.now().toString(), ...formData };
      setUsers([...users, newUser]);
    }

    setIsModalOpen(false);
  };

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();

    if (newRoleName.trim() !== "" && !roles.includes(newRoleName.trim())) {
      setRoles([...roles, newRoleName.trim()]);
      setNewRoleName("");
    }
  };

  const handleDeleteRole = (roleToDelete: string) => {
    const isUsed = users.some((u) => u.role === roleToDelete);

    if (isUsed) {
      alert("Role ini tidak bisa dihapus karena masih digunakan oleh user!");

      return;
    }

    if (confirm(`Hapus role "${roleToDelete}"?`)) {
      setRoles(roles.filter((r: string) => r !== roleToDelete));
    }
  };

  const visibleUsers = isMounted ? users : [];

  const filteredUsers = visibleUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Finance":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800";
      case "Admin Kantor":
        return "bg-primary-soft text-primary border border-primary/20";
      case "Kasir Toko":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300 border border-gray-200 dark:border-neutral-700";
    }
  };

  // 4. CEGAH RENDER TABEL SEBELUM DATA SIAP (MENCEGAH HYDRATION ERROR)
  if (!isMounted) {
    return (
      <AppShell>
        <div className="w-full space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Management User
            </h1>
          </div>
          <div className="surface p-12 text-center text-muted-foreground">
            Memuat data...
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Management User
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola pengguna, hak akses, dan status aktivasi akun.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="flex gap-2">
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="size-4" /> Create User
            </button>
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Settings className="size-4" /> Kelola Role
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Cari:</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Cari nama atau email..."
            />
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Nama / Username</th>
                  <th className="px-5 py-4 font-semibold">Role Permission</th>
                  <th className="px-5 py-4 font-semibold">Kontak</th>
                  <th className="px-5 py-4 font-semibold">Store</th>
                  <th className="px-5 py-4 font-semibold text-center">
                    Foto KTP
                  </th>
                  <th className="px-5 py-4 font-semibold text-center">
                    Status
                  </th>
                  <th className="px-5 py-4 font-semibold text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">
                        {user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        @{user.username}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      <div>{user.email}</div>
                      <div>{user.phone}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      {user.store}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {user.fotoKtp ? (
                        <div className="h-10 w-16 rounded bg-muted overflow-hidden border border-border mx-auto">
                          <img
                            src={user.fotoKtp}
                            alt="KTP"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${user.status === "Aktif" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                      >
                        {user.status === "Aktif" ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <XCircle className="size-3" />
                        )}
                        {user.status}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Edit className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="rounded-lg bg-red-500/10 p-2 text-red-600 hover:bg-red-500/20 transition-colors dark:text-red-400"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-muted-foreground"
                    >
                      Belum ada data user. Silakan klik &ldquo;Create
                      User&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: FORM USER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-xl rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] max-h-[90vh] overflow-y-auto liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {editingUser ? "Edit Data User" : "Daftarkan User Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Nama Lengkap
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none"
                    placeholder="Nama..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    E-mail
                  </label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none"
                    placeholder="Email..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    No. Telepon
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none"
                    placeholder="0812..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Role Permission
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none"
                  >
                    {roles.map((r: string) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Store Penempatan
                </label>
                <select
                  value={formData.store}
                  onChange={(e) =>
                    setFormData({ ...formData, store: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.storeName}>
                      {store.storeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Username (Untuk Login)
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none"
                    placeholder="Username..."
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <input
                    required={!editingUser}
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none"
                    placeholder={
                      editingUser
                        ? "Kosongkan jika tidak diubah"
                        : "Password..."
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-border pt-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Upload Foto KTP (Opsional)
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                      <Upload className="size-4" /> Pilih Foto
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];

                          if (file)
                            setFormData({
                              ...formData,
                              fotoKtp: URL.createObjectURL(file),
                            });
                        }}
                      />
                    </label>
                    {formData.fotoKtp && (
                      <div className="h-10 w-16 rounded border border-border overflow-hidden">
                        <img
                          src={formData.fotoKtp}
                          alt="Preview KTP"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Status Akses
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status:
                          e.target.value === "Aktif" ? "Aktif" : "Nonaktif",
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none"
                  >
                    <option value="Aktif">Aktif (Bisa Login)</option>
                    <option value="Nonaktif">Nonaktif (Diblokir)</option>
                  </select>
                </div>
              </div>

              <div className="rounded-xl bg-primary-soft p-4 text-sm text-accent-foreground border border-primary/20">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <ShieldAlert className="size-4" /> Catatan
                </div>
                <p className="text-xs opacity-80">
                  Pastikan KTP diunggah dengan jelas dan password dicatat. Jika
                  status Nonaktif, user tidak akan bisa login ke sistem.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: KELOLA ROLE */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-md rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                Kelola Pilihan Role
              </h2>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {roles.map((role: string) => (
                  <div
                    key={role}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {role}
                    </span>
                    <button
                      onClick={() => handleDeleteRole(role)}
                      className="text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleAddRole}
                className="mt-6 flex gap-2 border-t border-border pt-6"
              >
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Nama role baru..."
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Tambah
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
