"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { libraryCars as demoCars } from "@/lib/master-data";

interface CarData {
  id: string;
  merk: string;
  type: string;
  pcd: string;
  cb: string;
  et: string;
  sizeBan: string; 
  sizeVelg: string; 
  createdAt: string;
  history: string[];
}

export default function LibraryCarsPage() {
  // PERBAIKAN: Gunakan array kosong jika initialCars tidak ada
  const [cars, setCars] = useState<CarData[]>(demoCars);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<CarData | null>(null);
  
  const [formData, setFormData] = useState({
    merk: "", type: "", pcd: "", cb: "", et: "", sizeBan: "", sizeVelg: ""
  });
  
  const handleAddClick = () => {
    setEditingCar(null);
    setFormData({ merk: "", type: "", pcd: "", cb: "", et: "", sizeBan: "", sizeVelg: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (car: CarData) => {
    setEditingCar(car);
    setFormData({
      merk: car.merk, type: car.type, pcd: car.pcd, cb: car.cb, et: car.et,
      sizeBan: car.sizeBan, sizeVelg: car.sizeVelg
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data mobil ini?")) {
      setCars(cars.filter((c) => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCar) {
      // --- LOGIKA HISTORY EDIT ---
      const changes: string[] = [];

      if (editingCar.merk !== formData.merk) changes.push(`Merk: "${editingCar.merk}" -> "${formData.merk}"`);

      if (editingCar.type !== formData.type) changes.push(`Type: "${editingCar.type}" -> "${formData.type}"`);

      if (editingCar.pcd !== formData.pcd) changes.push(`Pcd: "${editingCar.pcd}" -> "${formData.pcd}"`);

      if (editingCar.cb !== formData.cb) changes.push(`Cb: "${editingCar.cb}" -> "${formData.cb}"`);

      if (editingCar.et !== formData.et) changes.push(`Et: "${editingCar.et}" -> "${formData.et}"`);

      if (editingCar.sizeBan !== formData.sizeBan) changes.push(`Size Ban: Diperbarui`);

      if (editingCar.sizeVelg !== formData.sizeVelg) changes.push(`Size Velg: Diperbarui`);

      const newHistory = changes.length > 0 
        ? [`[${new Date().toLocaleString()}] Diubah: ${changes.join(", ")}`, ...editingCar.history]
        : editingCar.history;

      setCars(cars.map((c) => c.id === editingCar.id ? { ...c, ...formData, history: newHistory } : c));
    } else {
      // --- TAMBAH BARU ---
      const newCar: CarData = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toLocaleString(),
        history: ["Dibuat pada " + new Date().toLocaleString()]
      };

      setCars([...cars, newCar]);
    }

    setIsModalOpen(false);
  };

  const filteredCars = cars.filter(
    (c) => c.merk.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase())
  );

  // Fungsi untuk merender teks multi-baris menjadi list
  const renderMultiline = (text: string) => {
    if (!text) return <span className="text-muted-foreground italic">-</span>;

    return (
      <ul className="space-y-1 text-xs text-muted-foreground">
        {text.split("\n").map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    );
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Management Library Cars</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data mobil dan ukuran ban/velg yang kompatibel.</p>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="flex gap-2">
            <button onClick={handleAddClick} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="size-4" /> Create
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-primary bg-background px-4 py-2 text-sm font-medium text-primary hover:bg-primary-soft transition-colors">
              <Search className="size-4" /> Search Detail
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Cari:</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Merk atau tipe mobil..." />
          </div>
        </div>

        {/* TABEL CAR */}
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-4 font-semibold">Merk</th>
                  <th className="px-4 py-4 font-semibold">Type</th>
                  <th className="px-4 py-4 font-semibold">Pcd</th>
                  <th className="px-4 py-4 font-semibold">Cb</th>
                  <th className="px-4 py-4 font-semibold">Et</th>
                  <th className="px-4 py-4 font-semibold w-48">Size Ban</th>
                  <th className="px-4 py-4 font-semibold w-48">Size Velg</th>
                  <th className="px-4 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCars.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-foreground align-top">{c.merk}</td>
                    <td className="px-4 py-4 text-muted-foreground align-top">{c.type}</td>
                    <td className="px-4 py-4 text-muted-foreground align-top">{c.pcd}</td>
                    <td className="px-4 py-4 text-muted-foreground align-top">{c.cb}</td>
                    <td className="px-4 py-4 text-muted-foreground align-top">{c.et}</td>
                    <td className="px-4 py-4 align-top border-l border-border/50">{renderMultiline(c.sizeBan)}</td>
                    <td className="px-4 py-4 align-top border-l border-border/50">{renderMultiline(c.sizeVelg)}</td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(c)} className="rounded bg-green-500 p-1.5 text-white hover:bg-green-600 transition-colors" title="Edit">
                          <Edit className="size-4" />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="rounded bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors" title="Hapus">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCars.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">Belum ada data mobil. Silakan klik &ldquo;Create&rdquo;.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL CREATE / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-3xl rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] max-h-[90vh] overflow-y-auto liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{editingCar ? "Edit Library Car" : "Tambah Data Mobil"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Baris 1: Detail Mobil */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Merk</label>
                  <input required type="text" value={formData.merk} onChange={(e) => setFormData({...formData, merk: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Honda" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Type</label>
                  <input required type="text" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Brio" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Pcd</label>
                  <input type="text" value={formData.pcd} onChange={(e) => setFormData({...formData, pcd: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="4x100" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Cb</label>
                  <input type="text" value={formData.cb} onChange={(e) => setFormData({...formData, cb: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="-" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Et</label>
                  <input type="text" value={formData.et} onChange={(e) => setFormData({...formData, et: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="-" />
                </div>
              </div>

              {/* Baris 2: Size Ban & Velg (Textarea Multi-line) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Size Ban (Pisahkan dengan Enter)</label>
                  <textarea required value={formData.sizeBan} onChange={(e) => setFormData({...formData, sizeBan: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm leading-relaxed" rows={6} placeholder="1. 175/65 r14&#10;2. 195/55 r15" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">Size Velg (Pisahkan dengan Enter)</label>
                  <textarea required value={formData.sizeVelg} onChange={(e) => setFormData({...formData, sizeVelg: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono text-sm leading-relaxed" rows={6} placeholder="1. 175/65 r14&#10;2. 195/55 r15" />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
