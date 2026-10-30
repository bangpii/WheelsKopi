"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, History, CreditCard } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { payments as demoPayments } from "@/lib/master-data";

interface PaymentMethod {
  id: string;
  name: string;
  status: "Aktif" | "Tidak Aktif";
  createdAt: string;
  history: string[];
}

interface PaymentFormData {
  name: string;
  status: "Aktif" | "Tidak Aktif";
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentMethod[]>(demoPayments);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState<PaymentFormData>({ name: "", status: "Aktif" });
  
  const [viewPayment, setViewPayment] = useState<PaymentMethod | null>(null);

  const handleAddClick = () => {
    setEditingPayment(null);
    setFormData({ name: "", status: "Aktif" });
    setIsModalOpen(true);
  };

  const handleEditClick = (payment: PaymentMethod) => {
    setEditingPayment(payment);
    setFormData({ name: payment.name, status: payment.status });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus alat pembayaran ini?")) {
      setPayments(payments.filter((p) => p.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingPayment) {
      // --- LOGIKA HISTORY EDIT ---
      const changes: string[] = [];

      if (editingPayment.name !== formData.name) changes.push(`Nama: "${editingPayment.name}" -> "${formData.name}"`);

      if (editingPayment.status !== formData.status) changes.push(`Status: "${editingPayment.status}" -> "${formData.status}"`);

      const newHistory = changes.length > 0 
        ? [`[${new Date().toLocaleString()}] Diubah: ${changes.join(", ")}`, ...editingPayment.history]
        : editingPayment.history;

      setPayments(payments.map((p) => p.id === editingPayment.id ? { ...p, ...formData, history: newHistory } : p));
    } else {
      // --- TAMBAH BARU ---
      const newPayment: PaymentMethod = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toLocaleString(),
        history: ["Dibuat pada " + new Date().toLocaleString()]
      };

      setPayments([...payments, newPayment]);
    }

    setIsModalOpen(false);
  };

  const filteredPayments = payments.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="w-full space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Management Payment</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola metode pembayaran yang tersedia untuk customer.</p>
        </div>

        {/* ACTION BAR */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
          <button onClick={handleAddClick} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="size-4" /> Tambah Payment
          </button>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Cari:</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Cari metode..." />
          </div>
        </div>

        {/* TABEL PAYMENT */}
        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Nama Alat Pembayaran</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Dibuat Pada</th>
                  <th className="px-5 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground flex items-center gap-2">
                      <CreditCard className="size-4 text-primary" /> {p.name}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.status === 'Aktif' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">{p.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(p)} className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors" title="Edit"><Edit className="size-4" /></button>
                        <button onClick={() => setViewPayment(p)} className="rounded-lg bg-yellow-500/10 p-2 text-yellow-600 hover:bg-yellow-500/20 dark:text-yellow-400 transition-colors" title="Lihat History"><History className="size-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="rounded-lg bg-red-500/10 p-2 text-red-600 hover:bg-red-500/20 dark:text-red-400 transition-colors" title="Hapus"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">Belum ada metode pembayaran. Silakan tambah.</td></tr>
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
              <h2 className="text-xl font-bold text-foreground">{editingPayment ? "Edit Payment" : "Tambah Payment Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Nama Alat Pembayaran</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Cth: Cash, OVO, QRIS..." />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value === "Aktif" ? "Aktif" : "Tidak Aktif"})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
                  <option value="Aktif">Aktif</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HISTORY */}
      {viewPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-md rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><History className="size-6"/> History Payment</h2>
              <button onClick={() => setViewPayment(null)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>
            
            <div className="mb-6 text-sm bg-muted/30 p-4 rounded-xl border border-border text-foreground space-y-2">
              <p><strong className="text-muted-foreground">Nama:</strong> {viewPayment.name}</p>
              <p><strong className="text-muted-foreground">Status:</strong> {viewPayment.status}</p>
              <p><strong className="text-muted-foreground">Dibuat:</strong> {viewPayment.createdAt}</p>
            </div>

            <div className="rounded-xl bg-primary-soft p-4 border border-primary/20 max-h-60 overflow-y-auto">
              <h3 className="font-semibold mb-2 text-sm text-accent-foreground flex items-center gap-2"><History className="size-4"/> Riwayat Perubahan</h3>
              <ul className="list-disc list-inside text-xs space-y-1 text-accent-foreground/80">
                {viewPayment.history.map((hist, index) => (
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
