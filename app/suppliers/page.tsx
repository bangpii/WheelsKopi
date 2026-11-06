"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X, History, Upload, Building2, User } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";

interface SupplierData {
  id: string;
  tipe: "Perorangan" | "Badan Usaha";
  name: string;
  contactPerson: string;
  email: string;
  primaryPhone: string;
  phone: string;
  fileDokumen: string; // Menyimpan nama file KTP/NPWP
  createdAt: string;
  history: string[];
}

interface SupplierFormData {
  tipe: "Perorangan" | "Badan Usaha";
  name: string;
  contactPerson: string;
  email: string;
  primaryPhone: string;
  phone: string;
  fileDokumen: string;
}

export default function SuppliersPage() {
  const { suppliers, setSuppliers } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierData | null>(null);

  const [formData, setFormData] = useState<SupplierFormData>({
    tipe: "Perorangan",
    name: "",
    contactPerson: "",
    email: "",
    primaryPhone: "",
    phone: "",
    fileDokumen: ""
  });

  const [viewSupplier, setViewSupplier] = useState<SupplierData | null>(null);
  const [search, setSearch] = useState("");

  const handleAddClick = () => {
    setEditingSupplier(null);
    setFormData({ tipe: "Perorangan", name: "", contactPerson: "", email: "", primaryPhone: "", phone: "", fileDokumen: "" });
    setIsModalOpen(true);
  };

  const handleEditClick = (supplier: SupplierData) => {
    setEditingSupplier(supplier);
    setFormData({
      tipe: supplier.tipe,
      name: supplier.name, 
      contactPerson: supplier.contactPerson, 
      email: supplier.email, 
      primaryPhone: supplier.primaryPhone, 
      phone: supplier.phone,
      fileDokumen: supplier.fileDokumen || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus supplier ini?")) {
      setSuppliers(suppliers.filter((s: SupplierData) => s.id !== id)); 
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fileDokumen) {
      alert(`Mohon upload dokumen ${formData.tipe === "Perorangan" ? "KTP" : "NPWP"} terlebih dahulu.`);

      return;
    }

    const supplierData: SupplierData = {
      id: editingSupplier ? editingSupplier.id : Date.now().toString(),
      tipe: formData.tipe,
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      primaryPhone: formData.primaryPhone,
      phone: formData.phone,
      fileDokumen: formData.fileDokumen,
      createdAt: editingSupplier ? editingSupplier.createdAt : new Date().toLocaleString(),
      history: editingSupplier ? editingSupplier.history : ["Dibuat pada " + new Date().toLocaleString()],
    };

    if (editingSupplier) {
      const changes: string[] = [];

      if (editingSupplier.name !== formData.name) changes.push(`Nama: "${editingSupplier.name}" -> "${formData.name}"`);

      if (editingSupplier.tipe !== formData.tipe) changes.push(`Tipe: "${editingSupplier.tipe}" -> "${formData.tipe}"`);

      if (editingSupplier.contactPerson !== formData.contactPerson) changes.push(`Contact Person: "${editingSupplier.contactPerson}" -> "${formData.contactPerson}"`);

      if (editingSupplier.email !== formData.email) changes.push(`Email: "${editingSupplier.email}" -> "${formData.email}"`);

      if (editingSupplier.primaryPhone !== formData.primaryPhone) changes.push(`Primary Phone: "${editingSupplier.primaryPhone}" -> "${formData.primaryPhone}"`);

      if (editingSupplier.phone !== formData.phone) changes.push(`Phone: "${editingSupplier.phone}" -> "${formData.phone}"`);

      if (editingSupplier.fileDokumen !== formData.fileDokumen) changes.push(`Dokumen: Diperbarui`);

      if (changes.length > 0) {
        supplierData.history = [`[${new Date().toLocaleString()}] Diubah: ${changes.join(", ")}`, ...supplierData.history];
      }

      setSuppliers(suppliers.map((s: SupplierData) => s.id === editingSupplier.id ? supplierData : s));
    } else {
      setSuppliers([...suppliers, supplierData]);
    }

    setIsModalOpen(false);
  };

  const filteredSuppliers = suppliers.filter(
    (s: SupplierData) => s.name.toLowerCase().includes(search.toLowerCase()) || s.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="w-full space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold text-foreground">Management Supplier</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola data kontak, legalitas, dan informasi supplier Anda.</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
          <button onClick={handleAddClick} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Plus className="size-4" /> Create Supplier
          </button>
          
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Cari:</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Cari nama atau kontak..." />
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-4 font-semibold">Tipe</th>
                  <th className="px-5 py-4 font-semibold">Nama</th>
                  <th className="px-5 py-4 font-semibold">Contact Person</th>
                  <th className="px-5 py-4 font-semibold">Email</th>
                  <th className="px-5 py-4 font-semibold">Phone</th>
                  <th className="px-5 py-4 font-semibold text-center">Dokumen</th>
                  <th className="px-5 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSuppliers.map((s: SupplierData) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.tipe === "Badan Usaha" ? "bg-primary-soft text-primary" : "bg-green-100 text-green-700"}`}>
                         {s.tipe === "Badan Usaha" ? <Building2 className="size-3" /> : <User className="size-3" />}
                         {s.tipe}
                       </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{s.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{s.contactPerson}</td>
                    <td className="px-5 py-4 text-muted-foreground">{s.email}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div>{s.primaryPhone}</div>
                      <div className="text-xs text-muted-foreground">{s.phone}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => setViewSupplier(s)} className="text-xs text-primary underline hover:text-primary/80">Lihat File</button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEditClick(s)} className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20 transition-colors" title="Edit"><Edit className="size-4" /></button>
                        <button onClick={() => handleDelete(s.id)} className="rounded-lg bg-red-500/10 p-2 text-red-600 hover:bg-red-500/20 transition-colors" title="Hapus"><Trash2 className="size-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">Belum ada data supplier. Silakan klik &ldquo;Create Supplier&rdquo;.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= MODAL CREATE / EDIT ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-lg rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] max-h-[90vh] overflow-y-auto liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">{editingSupplier ? "Edit Supplier" : "Tambah Supplier Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* PILIH TIPE SUPPLIER */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Tipe Supplier</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipe" value="Perorangan" checked={formData.tipe === "Perorangan"} onChange={() => setFormData({...formData, tipe: "Perorangan"})} className="text-primary focus:ring-primary" />
                    <span className="text-sm text-foreground">Perorangan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipe" value="Badan Usaha" checked={formData.tipe === "Badan Usaha"} onChange={() => setFormData({...formData, tipe: "Badan Usaha"})} className="text-primary focus:ring-primary" />
                    <span className="text-sm text-foreground">Badan / Organisasi</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Nama {formData.tipe === "Perorangan" ? "Lengkap" : "Perusahaan"}</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none" placeholder={formData.tipe === "Perorangan" ? "Nama sesuai KTP" : "PT. Maju Jaya"} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Contact Person</label>
                <input required type="text" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none" placeholder="Nama PIC..." />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
                <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none" placeholder="supplier@email.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">No. Telepon Utama</label>
                  <input required type="text" value={formData.primaryPhone} onChange={(e) => setFormData({...formData, primaryPhone: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none" placeholder="0812..." />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">No. Telepon Alternatif</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary outline-none" placeholder="021..." />
                </div>
              </div>

              {/* UPLOAD DOKUMEN (KTP / NPWP) */}
              <div className="border-t border-border pt-4">
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Upload {formData.tipe === "Perorangan" ? "No. KTP" : "NPWP Perusahaan"} (Wajib)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                    <Upload className="size-4" /> Pilih File
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          // Simulasi: Ambil nama file sebagai bukti upload
                          setFormData({...formData, fileDokumen: file.name});
                        }
                      }} 
                    />
                  </label>
                  {formData.fileDokumen && (
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      File terpilih: {formData.fileDokumen}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 border-t border-border pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">Batal</button>
                <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VIEW SUPPLIER (Lihat Detail Dokumen & History) */}
      {viewSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-md rounded-2xl p-6 animate-[rise-in_0.3s_ease-out] liquid-glass">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><History className="size-6"/> Detail Supplier</h2>
              <button onClick={() => setViewSupplier(null)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="size-6" /></button>
            </div>
            
            <div className="mb-6 text-sm bg-muted/30 p-4 rounded-xl border border-border text-foreground space-y-2">
              <p><strong className="text-muted-foreground">Tipe:</strong> {viewSupplier.tipe}</p>
              <p><strong className="text-muted-foreground">Nama:</strong> {viewSupplier.name}</p>
              <p><strong className="text-muted-foreground">Kontak:</strong> {viewSupplier.contactPerson} ({viewSupplier.primaryPhone})</p>
              <p><strong className="text-muted-foreground">Dokumen:</strong> <span className="text-primary underline cursor-pointer">{viewSupplier.fileDokumen || "Tidak ada"}</span></p>
            </div>

            <div className="rounded-xl bg-primary-soft p-4 border border-primary/20 max-h-48 overflow-y-auto">
              <h3 className="font-semibold mb-2 text-sm text-accent-foreground flex items-center gap-2"><History className="size-4"/> Riwayat Perubahan</h3>
              <ul className="list-disc list-inside text-xs space-y-1 text-accent-foreground/80">
                {viewSupplier.history?.map((hist, index) => (
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
