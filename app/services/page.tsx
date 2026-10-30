"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, History, Wrench } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { services as demoServices } from "@/lib/master-data";

interface Service {
  id: string;
  name: string;
  serviceValue: number;
  createdAt: string;
  history: string[];
}

export default function ServicesPage() {
  // PERBAIKAN: Gunakan array kosong jika initialServices tidak ada
  const [services, setServices] = useState<Service[]>(demoServices);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({ name: "", serviceValue: "" });
  
  const [viewService, setViewService] = useState<Service | null>(null);

  const handleAddClick = () => {
    setEditingService(null);
    setFormData({ name: "", serviceValue: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setFormData({ name: service.name, serviceValue: service.serviceValue.toString() });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus service ini?")) {
      setServices(services.filter((s) => s.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingService) {
      // --- LOGIKA HISTORY EDIT ---
      const changes: string[] = [];

      if (editingService.name !== formData.name) changes.push(`Nama: "${editingService.name}" -> "${formData.name}"`);

      if (editingService.serviceValue !== Number(formData.serviceValue)) changes.push(`Harga: Rp ${editingService.serviceValue.toLocaleString()} -> Rp ${Number(formData.serviceValue).toLocaleString()}`);

      const newHistory = changes.length > 0 
        ? [`[${new Date().toLocaleString()}] Diubah: ${changes.join(", ")}`, ...editingService.history]
        : editingService.history;

      setServices(services.map((s) => s.id === editingService.id ? { ...s, name: formData.name, serviceValue: Number(formData.serviceValue), history: newHistory } : s));
    } else {
      // --- TAMBAH BARU ---
      const newService: Service = {
        id: Date.now().toString(),
        name: formData.name,
        serviceValue: Number(formData.serviceValue),
        createdAt: new Date().toLocaleString(),
        history: ["Dibuat pada " + new Date().toLocaleString()]
      };

      setServices([...services, newService]);
    }

    setIsModalOpen(false);
  };

  const filteredServices = services.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="w-full space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Management Service</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola jenis layanan servis dan harga yang ditawarkan toko.</p>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
          <button onClick={handleAddClick} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="size-4" /> Create
          </button>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Search:</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Cari service..." />
          </div>
        </div>

        {/* TABEL SERVICE */}
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-5 py-4 font-semibold">Name</th>
                  <th className="px-5 py-4 font-semibold">Service Value</th>
                  <th className="px-5 py-4 font-semibold">Created At</th>
                  <th className="px-5 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground flex items-center gap-2">
                      <Wrench className="size-4 text-primary" /> {s.name}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground tabular-nums">
                      Rp {s.serviceValue.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{s.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(s)} className="rounded-lg bg-green-500 p-1.5 text-white hover:bg-green-600 transition-colors" title="Edit">
                          <Edit className="size-4" />
                        </button>
                        <button onClick={() => setViewService(s)} className="rounded-lg bg-yellow-500 p-1.5 text-white hover:bg-yellow-600 transition-colors" title="History">
                          <History className="size-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="rounded-lg bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors" title="Hapus">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">Belum ada data service. Silakan klik &ldquo;Create&rdquo;.</td></tr>
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
              <h2 className="text-xl font-bold text-foreground">{editingService ? "Edit Service" : "Tambah Service Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Nama Service</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Cth: Spooring, Balancing..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Service Value (Harga)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">Rp</span>
                  <input required type="number" value={formData.serviceValue} onChange={(e) => setFormData({...formData, serviceValue: e.target.value})} className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="0" />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORY */}
      {viewService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-md rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><History className="size-6"/> History Service</h2>
              <button onClick={() => setViewService(null)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>
            
            <div className="mb-6 text-sm bg-muted/30 p-4 rounded-xl border border-border text-foreground space-y-2">
              <p><strong className="text-muted-foreground">Nama:</strong> {viewService.name}</p>
              <p><strong className="text-muted-foreground">Harga:</strong> Rp {viewService.serviceValue.toLocaleString()}</p>
              <p><strong className="text-muted-foreground">Dibuat:</strong> {viewService.createdAt}</p>
            </div>

            <div className="rounded-xl bg-primary-soft p-4 border border-primary/20 max-h-60 overflow-y-auto">
              <h3 className="font-semibold mb-2 text-sm text-accent-foreground flex items-center gap-2"><History className="size-4"/> Riwayat Perubahan</h3>
              <ul className="list-disc list-inside text-xs space-y-1 text-accent-foreground/80">
                {viewService.history.map((hist, index) => (
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
