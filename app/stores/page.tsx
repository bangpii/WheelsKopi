"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, X, History, Building2, Copy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { stores as demoStores } from "@/lib/master-data";

interface Store {
  id: string;
  warehouse: string;
  storeName: string;
  code: string;
  province: string;
  locationType: string;
  status: string;
  primaryPhone: string;
  secondaryPhone: string;
  letterFile: string;
  createdAt: string;
  history: string[];
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>(demoStores);
  const [search] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const [formData, setFormData] = useState({
    warehouse: "", storeName: "", code: "", province: "", 
    locationType: "Dalam kota", status: "NEW", primaryPhone: "", secondaryPhone: "", letterFile: ""
  });

  const [viewStore, setViewStore] = useState<Store | null>(null);

  const handleAddClick = () => {
    setEditingStore(null);
    setFormData({ 
      warehouse: "", storeName: "", code: "", province: "", 
      locationType: "Dalam kota", status: "NEW", primaryPhone: "", secondaryPhone: "", letterFile: "" 
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (store: Store) => {
    setEditingStore(store);
    setFormData({
      warehouse: store.warehouse, storeName: store.storeName, code: store.code,
      province: store.province, locationType: store.locationType, status: store.status,
      primaryPhone: store.primaryPhone, secondaryPhone: store.secondaryPhone,
      letterFile: store.letterFile
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus toko ini?")) {
      setStores(stores.filter((s) => s.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStore) {
      const changes: string[] = [];

      if (editingStore.warehouse !== formData.warehouse) changes.push(`Warehouse: "${editingStore.warehouse}" -> "${formData.warehouse}"`);

      if (editingStore.storeName !== formData.storeName) changes.push(`Store Name: "${editingStore.storeName}" -> "${formData.storeName}"`);

      if (editingStore.code !== formData.code) changes.push(`Code: "${editingStore.code}" -> "${formData.code}"`);

      if (editingStore.province !== formData.province) changes.push(`Province: "${editingStore.province}" -> "${formData.province}"`);

      if (editingStore.locationType !== formData.locationType) changes.push(`Location: "${editingStore.locationType}" -> "${formData.locationType}"`);

      if (editingStore.status !== formData.status) changes.push(`Status: "${editingStore.status}" -> "${formData.status}"`);

      if (editingStore.primaryPhone !== formData.primaryPhone) changes.push(`Primary Phone: "${editingStore.primaryPhone}" -> "${formData.primaryPhone}"`);

      if (editingStore.secondaryPhone !== formData.secondaryPhone) changes.push(`Secondary Phone: "${editingStore.secondaryPhone}" -> "${formData.secondaryPhone}"`);

      if (editingStore.letterFile !== formData.letterFile) changes.push(`Surat Toko: "${editingStore.letterFile}" -> "${formData.letterFile}"`);

      const newHistory = changes.length > 0 
        ? [`[${new Date().toLocaleString()}] Diubah: ${changes.join(", ")}`, ...editingStore.history]
        : editingStore.history;

      setStores(stores.map((s) => s.id === editingStore.id ? { ...s, ...formData, history: newHistory } : s));
    } else {
      const newStore: Store = {
        id: Date.now().toString(), ...formData,
        createdAt: new Date().toLocaleString(),
        history: ["Dibuat pada " + new Date().toLocaleString()]
      };

      setStores([...stores, newStore]);
    }

    setIsModalOpen(false);
  };

  const filteredStores = stores.filter(
    (s) => s.storeName.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    // 2. BUNGKUS DENGAN APPSHELL
    <AppShell>
      <div className="w-full space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Management Store</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data toko, gudang, dan surat izin operasional.</p>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-wrap gap-2 bg-card p-4 rounded-xl border border-border shadow-sm">
          <button onClick={handleAddClick} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="size-4" /> Create
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <Building2 className="size-4" /> Item Store
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            <Copy className="size-4" /> Product Duplicated
          </button>
        </div>

        {/* TABEL (Gunakan class surface) */}
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Warehouse</th>
                  <th className="px-5 py-4 font-semibold">Store Name</th>
                  <th className="px-5 py-4 font-semibold">Code</th>
                  <th className="px-5 py-4 font-semibold">Province</th>
                  <th className="px-5 py-4 font-semibold">Location</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Surat Toko</th>
                  <th className="px-5 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStores.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 text-xs text-muted-foreground">{s.warehouse}</td>
                    <td className="px-5 py-4 font-medium text-foreground">{s.storeName}</td>
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{s.code}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{s.province}</td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{s.locationType}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${s.status === 'NEW' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      <div>{s.primaryPhone}</div>
                      <div className="text-gray-400">{s.secondaryPhone}</div>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {s.letterFile ? (
                        <a href="#" className="text-primary hover:underline">{s.letterFile}</a>
                      ) : (
                        <span className="text-gray-400 italic">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(s)} className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors" title="Edit"><Edit className="size-4" /></button>
                        <button onClick={() => setViewStore(s)} className="rounded-lg bg-yellow-500/10 p-2 text-yellow-600 hover:bg-yellow-500/20 dark:text-yellow-400 transition-colors" title="Lihat Detail"><Eye className="size-4" /></button>
                        <button onClick={() => handleDelete(s.id)} className="rounded-lg bg-red-500/10 p-2 text-red-600 hover:bg-red-500/20 dark:text-red-400 transition-colors" title="Hapus"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStores.length === 0 && (
                  <tr><td colSpan={9} className="px-5 py-12 text-center text-muted-foreground">Belum ada data toko. Silakan klik &ldquo;Create&rdquo;.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL CREATE / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-2xl rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{editingStore ? "Edit Store" : "Tambah Store Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Warehouse</label>
                  <input required type="text" value={formData.warehouse} onChange={(e) => setFormData({...formData, warehouse: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Cth: Warehouse Medan" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Store Name</label>
                  <input required type="text" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Cth: Koko Wheels" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Code</label>
                  <input required type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="KKW" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Province</label>
                  <input required type="text" value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Sumatra Utara" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Location Type</label>
                  <select value={formData.locationType} onChange={(e) => setFormData({...formData, locationType: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option value="Dalam kota">Dalam kota</option>
                    <option value="Luar kota">Luar kota</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                    <option value="NEW">NEW</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Primary Phone</label>
                  <input required type="text" value={formData.primaryPhone} onChange={(e) => setFormData({...formData, primaryPhone: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="+62..." />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Secondary Phone</label>
                  <input type="text" value={formData.secondaryPhone} onChange={(e) => setFormData({...formData, secondaryPhone: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="+62..." />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Surat Toko (File PDF/Gambar)</label>
                <input type="file" onChange={(e) => {
                  const fileName = e.target.files?.[0]?.name || "";
                  setFormData({...formData, letterFile: fileName});
                }} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 transition-all" />
                <p className="text-xs text-muted-foreground mt-2">*Upload dokumen resmi toko (opsional).</p>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">Simpan Store</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VIEW & HISTORY */}
      {viewStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-lg rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Eye className="size-6"/> Detail Store</h2>
              <button onClick={() => setViewStore(null)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm text-foreground mb-6 bg-muted/30 p-4 rounded-xl border border-border">
              <p><strong className="text-muted-foreground">Warehouse:</strong> {viewStore.warehouse}</p>
              <p><strong className="text-muted-foreground">Store Name:</strong> {viewStore.storeName}</p>
              <p><strong className="text-muted-foreground">Code:</strong> {viewStore.code}</p>
              <p><strong className="text-muted-foreground">Province:</strong> {viewStore.province}</p>
              <p><strong className="text-muted-foreground">Location:</strong> {viewStore.locationType}</p>
              <p><strong className="text-muted-foreground">Status:</strong> {viewStore.status}</p>
              <p><strong className="text-muted-foreground">Primary Phone:</strong> {viewStore.primaryPhone}</p>
              <p><strong className="text-muted-foreground">Secondary Phone:</strong> {viewStore.secondaryPhone}</p>
              <p className="col-span-2"><strong className="text-muted-foreground">Surat Toko:</strong> {viewStore.letterFile || "Tidak ada"}</p>
              <p className="col-span-2"><strong className="text-muted-foreground">Terdaftar Pada:</strong> {viewStore.createdAt}</p>
            </div>

            <div className="rounded-xl bg-primary-soft p-4 border border-primary/20 max-h-48 overflow-y-auto">
              <h3 className="font-semibold mb-2 text-sm flex items-center gap-2 text-accent-foreground"><History className="size-4"/> Riwayat Perubahan</h3>
              <ul className="list-disc list-inside text-xs space-y-1 text-accent-foreground/80">
                {viewStore.history.map((hist, index) => (
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
