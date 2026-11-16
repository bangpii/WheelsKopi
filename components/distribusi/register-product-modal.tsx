"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Box, Check, Disc3, ImagePlus, PackagePlus, X, Layers
} from "lucide-react";
import type { DistribusiCategory, DistribusiFormValues } from "@/lib/distribusi-data";
import { othersCategories } from "@/lib/distribusi-data";
import type { Product } from "@/lib/context/data-context";

interface RegisterProductModalProps {
  suppliers: { name: string }[];
  categories?: string[];
  sortedCategories?: string[];
  initialSubKategori?: string;
  initialData?: Product | null;
  banData?: Record<string, string[]>;
  ringData?: string[];
  onClose: () => void;
  onSubmit: (values: DistribusiFormValues) => void;
}

const fieldClass = "w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-ring/40";
const labelClass = "mb-1.5 block text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

function createInitialForm(initialData: Product | null | undefined, suppliers: { name: string }[], initialSubKategori?: string): DistribusiFormValues {
  if (initialData) {
    return {
      kategori: initialData.kategoriUtama, 
      supplier: initialData.supplier ?? suppliers[0]?.name ?? "",
      stok: String(initialData.stok ?? ""), 
      gambar: initialData.gambar ?? "",
      merekBan: initialData.merekBan ?? "", 
      typeBan: initialData.typeBan ?? "",
      ring: initialData.ring ?? "", 
      ukuranTapak: initialData.ukuranTapak ?? "", 
      ukuranTinggi: initialData.ukuranTinggi ?? "",
      // PERBAIKAN: Menggunakan .includes() agar TypeScript tidak protes
      subKategori: (["Others", "Sorted"] as string[]).includes(initialData.kategoriUtama) ? initialData.subKategori : undefined,
      merekProduk: initialData.merekProduk ?? "", 
      typeVelg: initialData.typeVelg ?? "",
      wide: initialData.wide ?? "", 
      hole: initialData.hole ?? "", 
      et: initialData.et ?? "",
      colour: initialData.colour ?? "", 
      nobes: initialData.nobes ?? "",
      keterangan: initialData.keterangan ?? "", 
      notes: initialData.notes ?? "",
      namaBarang: initialData.namaBarang, 
      ukuran: initialData.ukuran, 
      tanggal: initialData.tanggal,
      hargaModalAsli: String(initialData.hargaModalAsli ?? ""), 
      hargaModalToko: String(initialData.hargaModalToko ?? ""),
      hargaTagihanToko: String(initialData.hargaTagihanToko ?? ""), 
      standarPrice: String(initialData.standarPrice ?? ""),
    };
  }
  return {
    kategori: initialSubKategori ? "Others" : "Ban", 
    supplier: "", stok: "", gambar: "",
    merekBan: "", typeBan: "", ring: "", ukuranTapak: "", ukuranTinggi: "", 
    subKategori: initialSubKategori ?? "",
    merekProduk: "", typeVelg: "", wide: "", hole: "", et: "", colour: "", nobes: "",
    keterangan: "", notes: "", standarPrice: "",
  };
}

export function RegisterProductModal({
  suppliers, categories = [...othersCategories], sortedCategories = [], initialSubKategori, initialData,
  banData = {}, ringData = [], onClose, onSubmit,
}: RegisterProductModalProps) {
  const [formData, setFormData] = useState<DistribusiFormValues>(() => createInitialForm(initialData, suppliers, initialSubKategori));
  const [error, setError] = useState("");

  const isBan = formData.kategori === "Ban";
  const isSorted = formData.kategori === "Sorted";
  const isOthers = formData.kategori === "Others";
  
  // Spesifikasi Velg HANYA muncul jika kategori Others DAN subKategori = Velg
  const isVelg = isOthers && formData.subKategori === "Velg";

  const update = (patch: Partial<DistribusiFormValues>) => { setFormData((prev) => ({ ...prev, ...patch })); setError(""); };

  const switchCategory = (kategori: DistribusiCategory) => {
    const patch: Partial<DistribusiFormValues> = { kategori };
    if (kategori === "Others" && !formData.subKategori) patch.subKategori = categories[0] || "Velg";
    if (kategori === "Sorted" && !formData.subKategori) patch.subKategori = sortedCategories[0] || "";
    update(patch);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("File harus berupa gambar."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("Ukuran maksimal 2MB."); return; }
    const reader = new FileReader();
    reader.onload = () => update({ gambar: String(reader.result ?? "") });
    reader.readAsDataURL(file);
  };

  const validate = (): string => {
    if (!formData.supplier.trim()) return "Supplier wajib dipilih.";
    if (!formData.stok.trim() || Number(formData.stok) < 0) return "Stok wajib diisi angka 0+.";
    if (!formData.gambar && !initialData?.gambar) return "Upload gambar produk.";

    if (isBan) {
      if (!formData.merekBan?.trim()) return "Merek ban wajib dipilih.";
      if (!formData.typeBan?.trim()) return "Type ban wajib dipilih.";
      if (!formData.ring?.trim()) return "Ring wajib dipilih.";
      if (!formData.ukuranTapak?.trim()) return "Tapak/lebar wajib diisi.";
      if (!formData.ukuranTinggi?.trim()) return "Tinggi wajib diisi.";
      return "";
    }

    if (!formData.subKategori) return "Jenis produk wajib dipilih.";
    if (!formData.merekProduk?.trim()) return "Merek produk wajib diisi.";
    
    if (isVelg) {
      if (!formData.typeVelg?.trim()) return "Type velg wajib diisi.";
      if (!formData.ring?.trim()) return "Ring wajib dipilih.";
      if (!formData.wide?.trim()) return "Wide wajib diisi.";
      if (!formData.hole?.trim()) return "Hole wajib diisi.";
      if (!formData.et?.trim()) return "ET wajib diisi.";
      if (!formData.colour?.trim()) return "Colour wajib diisi.";
      return "";
    }
    
    // Validasi untuk Others (Non-Velg) & Sorted
    if (!formData.keterangan?.trim()) return "Keterangan wajib diisi.";
    return "";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = validate();
    if (message) { setError(message); return; }

    onSubmit({
      kategori: formData.kategori, supplier: formData.supplier.trim(), stok: formData.stok, gambar: formData.gambar,
      merekBan: isBan ? formData.merekBan : undefined,
      typeBan: isBan ? formData.typeBan : undefined,
      ring: formData.ring, ukuranTapak: isBan ? formData.ukuranTapak : undefined, ukuranTinggi: isBan ? formData.ukuranTinggi : undefined,
      subKategori: isBan ? undefined : formData.subKategori, merekProduk: isBan ? undefined : formData.merekProduk,
      typeVelg: isVelg ? formData.typeVelg : undefined, wide: isVelg ? formData.wide : undefined, hole: isVelg ? formData.hole : undefined,
      et: isVelg ? formData.et : undefined, colour: isVelg ? formData.colour : undefined, nobes: isVelg ? formData.nobes : undefined,
      keterangan: isBan || isVelg ? undefined : formData.keterangan, notes: isBan || isVelg ? undefined : formData.notes,
      standarPrice: formData.standarPrice,
      hargaModalAsli: initialData ? String(initialData.hargaModalAsli ?? "") : undefined,
      hargaModalToko: initialData ? String(initialData.hargaModalToko ?? "") : undefined,
      hargaTagihanToko: initialData ? String(initialData.hargaTagihanToko ?? "") : undefined,
    });
  };

  const availableTypes = formData.merekBan ? banData[formData.merekBan] || [] : [];
  if (formData.typeBan && !availableTypes.includes(formData.typeBan)) {
    availableTypes.unshift(formData.typeBan); 
  }

  const availableRings = [...ringData];
  if (formData.ring && !availableRings.includes(formData.ring)) {
    availableRings.unshift(formData.ring);
  }

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6">
      <button type="button" aria-label="Tutup modal" onClick={onClose} className="absolute inset-0 bg-black/45 backdrop-blur-md" />
      <div role="dialog" aria-modal="true" aria-labelledby="register-product-title" className="surface relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary"><PackagePlus className="size-5" /></span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.28em] text-primary uppercase">{initialData ? "Edit Produk" : "Registrasi Produk"}</p>
              <h2 id="register-product-title" className="font-display mt-1 text-lg font-semibold tracking-tight">{initialData ? "Perbarui Data Produk" : "Daftarkan Produk Baru"}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted"><X className="size-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            
            {/* TAB KATEGORI (Ban, Others, Sorted) */}
            <div className="inline-flex w-full rounded-xl border border-border bg-muted/50 p-1 sm:w-auto">
              {(["Ban", "Others", "Sorted"] as const).map((tab) => {
                const TabIcon = tab === "Ban" ? Disc3 : tab === "Others" ? Box : Layers;
                const active = formData.kategori === tab;
                return (
                  <button key={tab} type="button" onClick={() => switchCategory(tab)} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:flex-none ${active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    <TabIcon className="size-4" /> {tab}
                  </button>
                );
              })}
            </div>

            {isBan ? (
              /* ==================== FORM BAN ==================== */
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Merek Ban</span>
                  <select value={formData.merekBan ?? ""} onChange={(e) => update({ merekBan: e.target.value, typeBan: "" })} className={fieldClass}>
                    <option value="" disabled>Pilih Merek Ban</option>
                    {Object.keys(banData).map((brand) => <option key={brand} value={brand}>{brand}</option>)}
                  </select>
                </label>
                <label>
                  <span className={labelClass}>Type Ban</span>
                  <select value={formData.typeBan ?? ""} onChange={(e) => update({ typeBan: e.target.value })} className={fieldClass} disabled={!formData.merekBan}>
                    <option value="" disabled>Pilih Tipe Ban</option>
                    {availableTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <label>
                  <span className={labelClass}>Ring</span>
                  <select value={formData.ring ?? ""} onChange={(e) => update({ ring: e.target.value })} className={fieldClass}>
                    <option value="" disabled>Pilih Ring</option>
                    {availableRings.map((ring) => <option key={ring} value={ring}>{ring}</option>)}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label><span className={labelClass}>Tapak / Lebar</span><input value={formData.ukuranTapak ?? ""} onChange={(e) => update({ ukuranTapak: e.target.value })} placeholder="195" className={fieldClass} /></label>
                  <label><span className={labelClass}>Tinggi</span><input value={formData.ukuranTinggi ?? ""} onChange={(e) => update({ ukuranTinggi: e.target.value })} placeholder="65" className={fieldClass} /></label>
                </div>
                <label className="sm:col-span-2"><span className={labelClass}>Supplier</span><select value={formData.supplier} onChange={(e) => update({ supplier: e.target.value })} className={fieldClass}><option value="">Pilih supplier</option>{suppliers.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}</select></label>
                <label><span className={labelClass}>Stok</span><input value={formData.stok} onChange={(e) => update({ stok: e.target.value })} placeholder="0" type="number" min={0} className={fieldClass} /></label>
                <label><span className={labelClass}>Standar Price</span><input value={formData.standarPrice ?? ""} onChange={(e) => update({ standarPrice: e.target.value })} placeholder="0" type="number" min={0} className={fieldClass} /></label>
                <div className="sm:col-span-2"><ImageField value={formData.gambar} onChange={handleImageUpload} onRemove={() => update({ gambar: "" })} /></div>
              </div>
            ) : (
              /* ==================== FORM OTHERS & SORTED ==================== */
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                 <label><span className={labelClass}>Supplier</span><select value={formData.supplier} onChange={(e) => update({ supplier: e.target.value })} className={fieldClass}><option value="">Pilih supplier</option>{suppliers.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}</select></label>
                 
                 {/* DROPDOWN JENIS (MURNI SELECT) */}
                 <label>
                   <span className={labelClass}>{isSorted ? "Pilih Jenis (Sorted)" : "Pilih Jenis (Others)"}</span>
                   <select value={formData.subKategori ?? ""} onChange={(e) => update({ subKategori: e.target.value })} className={fieldClass}>
                     <option value="" disabled>Pilih Jenis</option>
                     {(isSorted ? sortedCategories : categories).map((c) => <option key={c} value={c}>{c}</option>)}
                   </select>
                   {(isSorted ? sortedCategories : categories).length === 0 && (
                     <p className="text-[10px] text-danger mt-1">Belum ada jenis. Tambah di menu Kelola Master.</p>
                   )}
                 </label>

                 {/* JIKA OTHERS & VELG */}
                 {isVelg ? (
                  <>
                    <label><span className={labelClass}>Merek Produk</span><input value={formData.merekProduk ?? ""} onChange={(e) => update({ merekProduk: e.target.value })} className={fieldClass} /></label>
                    <label><span className={labelClass}>Type Velg</span><input value={formData.typeVelg ?? ""} onChange={(e) => update({ typeVelg: e.target.value })} className={fieldClass} /></label>
                    <label>
                      <span className={labelClass}>Ring</span>
                      <select value={formData.ring ?? ""} onChange={(e) => update({ ring: e.target.value })} className={fieldClass}>
                        <option value="" disabled>Pilih Ring</option>
                        {availableRings.map((ring) => <option key={ring} value={ring}>{ring}</option>)}
                      </select>
                    </label>
                    <label><span className={labelClass}>Wide</span><input value={formData.wide ?? ""} onChange={(e) => update({ wide: e.target.value })} className={fieldClass} /></label>
                    <label><span className={labelClass}>Hole</span><input value={formData.hole ?? ""} onChange={(e) => update({ hole: e.target.value })} className={fieldClass} /></label>
                    <label><span className={labelClass}>ET</span><input value={formData.et ?? ""} onChange={(e) => update({ et: e.target.value })} className={fieldClass} /></label>
                    <label><span className={labelClass}>Colour</span><input value={formData.colour ?? ""} onChange={(e) => update({ colour: e.target.value })} className={fieldClass} /></label>
                    <label><span className={labelClass}>Nobes</span><input value={formData.nobes ?? ""} onChange={(e) => update({ nobes: e.target.value })} className={fieldClass} /></label>
                    <label><span className={labelClass}>Stok</span><input value={formData.stok} onChange={(e) => update({ stok: e.target.value })} type="number" min={0} className={fieldClass} /></label>
                    <label><span className={labelClass}>Standar Price</span><input value={formData.standarPrice ?? ""} onChange={(e) => update({ standarPrice: e.target.value })} type="number" min={0} className={fieldClass} /></label>
                  </>
                 ) : (
                  /* JIKA OTHERS (NON-VELG) ATAU SORTED */
                  <>
                    <label><span className={labelClass}>Merek Produk</span><input value={formData.merekProduk ?? ""} onChange={(e) => update({ merekProduk: e.target.value })} className={fieldClass} /></label>
                    <label><span className={labelClass}>Stok</span><input value={formData.stok} onChange={(e) => update({ stok: e.target.value })} type="number" min={0} className={fieldClass} /></label>
                    <label><span className={labelClass}>Standar Price</span><input value={formData.standarPrice ?? ""} onChange={(e) => update({ standarPrice: e.target.value })} type="number" min={0} className={fieldClass} /></label>
                    <label className="sm:col-span-2"><span className={labelClass}>Keterangan / Ukuran</span><input value={formData.keterangan ?? ""} onChange={(e) => update({ keterangan: e.target.value })} placeholder="cth: 100ml / M12" className={fieldClass} /></label>
                    <label className="sm:col-span-2"><span className={labelClass}>Notes</span><textarea value={formData.notes ?? ""} onChange={(e) => update({ notes: e.target.value })} rows={2} className={`${fieldClass} resize-none`} /></label>
                  </>
                 )}
                 <div className="sm:col-span-2"><ImageField value={formData.gambar} onChange={handleImageUpload} onRemove={() => update({ gambar: "" })} /></div>
              </div>
            )}

            {error && <p className="mt-4 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-xs font-medium text-danger">{error}</p>}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[11px] text-muted-foreground">Field bertanda wajib harus lengkap sebelum disimpan.</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted">Batal</button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_var(--primary)] transition-transform hover:-translate-y-0.5"><Check className="size-4" />{initialData ? "Simpan Perubahan" : "Daftarkan Produk"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImageField({ value, onChange, onRemove }: { value: string; onChange: (event: ChangeEvent<HTMLInputElement>) => void; onRemove: () => void; }) {
  return (
    <div>
      <span className={labelClass}>Upload Gambar</span>
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <div className="relative size-20 overflow-hidden rounded-xl border border-border bg-muted">
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
            <button type="button" onClick={onRemove} className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-lg bg-black/60 text-white"><X className="size-3.5" /></button>
          </div>
        ) : null}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background/60 px-4 py-3 text-xs font-semibold transition-colors hover:border-primary/50 hover:bg-primary-soft/40">
          <ImagePlus className="size-4 text-primary" />
          {value ? "Ganti Gambar" : "Pilih Gambar"}
          <input type="file" accept="image/*" onChange={onChange} className="hidden" />
        </label>
        <p className="text-[11px] text-muted-foreground">JPG/PNG, maks 2MB.</p>
      </div>
    </div>
  );
}