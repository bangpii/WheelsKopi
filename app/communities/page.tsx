"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, History, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { communities as demoCommunities } from "@/lib/master-data";

interface Community {
  id: string;
  name: string;
  leader: string; // Nama ketua/penanggung jawab
  status: "Aktif" | "Tidak Aktif";
  createdAt: string;
  history: string[];
}

interface CommunityFormData {
  name: string;
  leader: string;
  status: "Aktif" | "Tidak Aktif";
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>(demoCommunities);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [formData, setFormData] = useState<CommunityFormData>({ name: "", leader: "", status: "Aktif" });
  
  const [viewCommunity, setViewCommunity] = useState<Community | null>(null);

  const handleAddClick = () => {
    setEditingCommunity(null);
    setFormData({ name: "", leader: "", status: "Aktif" });
    setIsModalOpen(true);
  };

  const handleEditClick = (community: Community) => {
    setEditingCommunity(community);
    setFormData({ name: community.name, leader: community.leader, status: community.status });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data komunitas ini?")) {
      setCommunities(communities.filter((c) => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCommunity) {
      // --- LOGIKA HISTORY EDIT ---
      const changes: string[] = [];

      if (editingCommunity.name !== formData.name) changes.push(`Nama: "${editingCommunity.name}" -> "${formData.name}"`);

      if (editingCommunity.leader !== formData.leader) changes.push(`Leader: "${editingCommunity.leader}" -> "${formData.leader}"`);

      if (editingCommunity.status !== formData.status) changes.push(`Status: "${editingCommunity.status}" -> "${formData.status}"`);

      const newHistory = changes.length > 0 
        ? [`[${new Date().toLocaleString()}] Diubah: ${changes.join(", ")}`, ...editingCommunity.history]
        : editingCommunity.history;

      setCommunities(communities.map((c) => c.id === editingCommunity.id ? { ...c, ...formData, history: newHistory } : c));
    } else {
      // --- TAMBAH BARU ---
      const newCommunity: Community = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toLocaleString(),
        history: ["Dibuat pada " + new Date().toLocaleString()]
      };

      setCommunities([...communities, newCommunity]);
    }

    setIsModalOpen(false);
  };

  const filteredCommunities = communities.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.leader.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="w-full space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Management Community</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data komunitas mobil yang bekerja sama dengan toko.</p>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
          <button onClick={handleAddClick} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="size-4" /> Create
          </button>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Cari:</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Cari komunitas..." />
          </div>
        </div>

        {/* TABEL COMMUNITY */}
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-4 font-semibold">Nama Komunitas</th>
                  <th className="px-5 py-4 font-semibold">Leader / PIC</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Created At</th>
                  <th className="px-5 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCommunities.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground flex items-center gap-2">
                      <Users className="size-4 text-primary" /> {c.name}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{c.leader}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.status === 'Aktif' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{c.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(c)} className="rounded bg-green-500 p-1.5 text-white hover:bg-green-600 transition-colors" title="Edit">
                          <Edit className="size-4" />
                        </button>
                        <button onClick={() => setViewCommunity(c)} className="rounded bg-yellow-500 p-1.5 text-white hover:bg-yellow-600 transition-colors" title="History">
                          <History className="size-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors" title="Hapus">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCommunities.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">Belum ada data komunitas. Silakan klik &ldquo;Create&rdquo;.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL CREATE / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-md rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{editingCommunity ? "Edit Community" : "Tambah Community Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Nama Komunitas</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Cth: Honda Brio Club Medan" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Leader / Penanggung Jawab</label>
                <input required type="text" value={formData.leader} onChange={(e) => setFormData({...formData, leader: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Nama Ketua..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value === "Aktif" ? "Aktif" : "Tidak Aktif"})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORY */}
      {viewCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-md rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><History className="size-6"/> History Community</h2>
              <button onClick={() => setViewCommunity(null)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>
            
            <div className="mb-6 text-sm bg-muted/30 p-4 rounded-xl border border-border text-foreground space-y-2">
              <p><strong className="text-muted-foreground">Nama:</strong> {viewCommunity.name}</p>
              <p><strong className="text-muted-foreground">Leader:</strong> {viewCommunity.leader}</p>
              <p><strong className="text-muted-foreground">Status:</strong> {viewCommunity.status}</p>
              <p><strong className="text-muted-foreground">Dibuat:</strong> {viewCommunity.createdAt}</p>
            </div>

            <div className="rounded-xl bg-primary-soft p-4 border border-primary/20 max-h-60 overflow-y-auto">
              <h3 className="font-semibold mb-2 text-sm text-accent-foreground flex items-center gap-2"><History className="size-4"/> Riwayat Perubahan</h3>
              <ul className="list-disc list-inside text-xs space-y-1 text-accent-foreground/80">
                {viewCommunity.history.map((hist, index) => (
                  <li key={index}>{hist}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
