"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import type { ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box, Disc3, Eye, FileSpreadsheet, FileText, Plus, Search, Settings,
  Trash2, TriangleAlert, Upload, X, Pencil, ChevronDown, ChevronRight, Check, Layers,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RegisterProductModal } from "@/components/distribusi/register-product-modal";
import { ProductDetailModal } from "@/components/distribusi/product-detail-modal";
import { rupiah } from "@/lib/dashboard-data";
import { useData, toProduct, type Product } from "@/lib/context/data-context";
import type { DistribusiCategory, DistribusiFormValues } from "@/lib/distribusi-data";
import { formToItem, othersCategories } from "@/lib/distribusi-data";
import { useCan } from "@/lib/permissions";

const statusOptions = ["Semua Status Stok", "Tersedia", "Menipis", "Wajib Pesan"];

function statusOf(stok: number) {
  if (stok < 2) return "Wajib Pesan";
  if (stok <= 5) return "Menipis";
  return "Tersedia";
}

function specOf(item: Product) {
  if (item.kategori === "Ban") {
    return [item.ukuranTapak && item.ukuranTinggi ? `${item.ukuranTapak}/${item.ukuranTinggi}` : item.ukuranTapak || item.ukuranTinggi, item.ring].filter(Boolean).join(" ");
  }
  if (item.subKategori === "Velg") {
    return [item.typeVelg, item.ring, item.wide, item.hole, item.et ? `ET ${item.et}` : "", item.colour, item.nobes].filter(Boolean).join(" • ");
  }
  return item.keterangan || item.ukuran || "-";
}

function money(value?: number) { return value ? rupiah.format(value) : "-"; }

interface DetailColumn { label: string; value: (item: Product) => string; align?: "left" | "right" | "center"; }

const detailColumns: DetailColumn[] = [
  { label: "Kode", value: (item) => item.kodeBarang || item.id },
  { label: "Nama Barang", value: (item) => item.namaBarang },
  { label: "Supplier", value: (item) => item.supplier || "-" },
  { label: "Spesifikasi", value: specOf },
  { label: "Stok", value: (item) => String(item.stok), align: "right" },
  { label: "Status", value: (item) => statusOf(item.stok), align: "center" },
  { label: "Modal Asli", value: (item) => money(item.hargaModalAsli), align: "right" },
  { label: "Harga Toko", value: (item) => money(item.hargaModalToko), align: "right" },
  { label: "Standar Price", value: (item) => money(item.standarPrice), align: "right" },
  { label: "Arrival Date", value: (item) => item.arrivalDate || "-" },
  { label: "Stock Owner", value: (item) => item.stockOwner || "-" },
  { label: "Notes", value: (item) => item.notes || "-" },
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const DEFAULT_BAN_DATA: Record<string, string[]> = {
  "Swallow": ["Tubeless", "Tube Type"],
  "FDR": ["Sport", "Touring"],
  "IRC": ["NR88", "Fasti"],
  "Corsa": ["Platinum", "R26"],
  "Dunlop": ["SP Sport", "LM705"]
};

const DEFAULT_RING_DATA = ["14", "15", "16", "17", "18", "19", "20", "21", "22"];
const DEFAULT_SORTED_CATEGORIES = ["Parfum", "Centering Mur Roda"];

function DistribusiContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "others" ? "Others" : searchParams.get("tab") === "sorted" ? "Sorted" : "Ban";
  const { products, setProducts, suppliers } = useData();
  const can = useCan();

  const [category, setCategory] = useState<DistribusiCategory>(initialTab);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status Stok");
  const [subCategory, setSubCategory] = useState("Semua");
  
  // State Kategori Dinamis (Others & Sorted)
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [otherCategories, setOtherCategories] = useState<string[]>(() => {
    if (typeof window === "undefined") return [...othersCategories];
    try {
      const stored = window.localStorage.getItem("wheelskopi-other-categories");
      const parsed = stored ? (JSON.parse(stored) as string[]) : [];
      return Array.from(new Set([...othersCategories, ...(Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [])]));
    } catch { return [...othersCategories]; }
  });

  const [sortedCategories, setSortedCategories] = useState<string[]>(() => {
    if (typeof window === "undefined") return DEFAULT_SORTED_CATEGORIES;
    try {
      const stored = window.localStorage.getItem("wheelskopi-sorted-categories");
      return stored ? JSON.parse(stored) : DEFAULT_SORTED_CATEGORIES;
    } catch { return DEFAULT_SORTED_CATEGORIES; }
  });
  
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [detailItem, setDetailItem] = useState<Product | null>(null);
  
  const [notice, setNotice] = useState("");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [banData, setBanData] = useState<Record<string, string[]>>(() => {
    if (typeof window === "undefined") return DEFAULT_BAN_DATA;
    try {
      const stored = window.localStorage.getItem("wheelskopi-ban-data");
      return stored ? JSON.parse(stored) : DEFAULT_BAN_DATA;
    } catch { return DEFAULT_BAN_DATA; }
  });

  const [ringData, setRingData] = useState<string[]>(() => {
    if (typeof window === "undefined") return DEFAULT_RING_DATA;
    try {
      const stored = window.localStorage.getItem("wheelskopi-ring-data");
      return stored ? JSON.parse(stored) : DEFAULT_RING_DATA;
    } catch { return DEFAULT_RING_DATA; }
  });

  // State Panel Master Data
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
  
  // State Merek
  const [newBrand, setNewBrand] = useState("");
  const [newBrandType, setNewBrandType] = useState("");
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [newTypeInput, setNewTypeInput] = useState("");
  const [editBrandName, setEditBrandName] = useState<string | null>(null);
  const [editBrandValue, setEditBrandValue] = useState("");
  const [editTypeData, setEditTypeData] = useState<{ brand: string; index: number; value: string } | null>(null);

  // State Ring
  const [newRing, setNewRing] = useState("");
  const [editRingIndex, setEditRingIndex] = useState<number | null>(null);
  const [editRingValue, setEditRingValue] = useState("");

  // State Master Kategori (Others & Sorted)
  const [newMasterCategory, setNewMasterCategory] = useState("");
  const [editMasterCategoryData, setEditMasterCategoryData] = useState<{ type: "Others" | "Sorted"; index: number; value: string } | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const custom = otherCategories.filter((item) => !(othersCategories as readonly string[]).includes(item));
    window.localStorage.setItem("wheelskopi-other-categories", JSON.stringify(custom));
    window.localStorage.setItem("wheelskopi-sorted-categories", JSON.stringify(sortedCategories));
    window.localStorage.setItem("wheelskopi-ban-data", JSON.stringify(banData));
    window.localStorage.setItem("wheelskopi-ring-data", JSON.stringify(ringData));
  }, [mounted, otherCategories, sortedCategories, banData, ringData]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "others") setCategory("Others");
    if (tab === "sorted") setCategory("Sorted");
    if (tab === "ban") setCategory("Ban");
  }, [searchParams]);

  const supplierOptions = suppliers.map((s) => ({ name: s.name }));
  const categoryItems = products.filter((item) => item.kategoriUtama === category);

  const filteredItems = categoryItems.filter((item) => {
    const keyword = search.trim().toLowerCase();
    const searchTarget = [item.namaBarang, item.subKategori, item.supplier, item.merekBan, item.merekProduk, item.ukuran, item.ukuranTapak, item.ukuranTinggi, item.ring, item.item].filter(Boolean).join(" ").toLowerCase();
    const matchSearch = keyword.length === 0 || searchTarget.includes(keyword);
    const computedStatus = statusOf(item.stok);
    const matchStatus = status === "Semua Status Stok" || computedStatus === status;
    
    // Filter Sub-Kategori (berlaku untuk Others & Sorted)
    const matchSubCategory = (category !== "Others" && category !== "Sorted") || subCategory === "Semua" || item.subKategori === subCategory;
    
    return matchSearch && matchStatus && matchSubCategory;
  });

  const handleRegister = (values: DistribusiFormValues) => {
    if (editItem) {
      const updatedItem = formToItem(editItem.id, values);
      const updatedProduct: Product = { ...editItem, ...updatedItem, kategoriUtama: values.kategori, hargaModalAsli: editItem.hargaModalAsli, hargaModalToko: editItem.hargaModalToko, history: [...editItem.history, `[${new Date().toLocaleString("id-ID")}] Diperbarui`] };
      setProducts((prev) => prev.map((p) => (p.id === editItem.id ? updatedProduct : p)));
      setNotice(`Produk "${updatedProduct.namaBarang}" diperbarui.`);
      setEditItem(null);
    } else {
      const newItem = formToItem(`WK-${Date.now().toString().slice(-6)}`, values);
      const newProduct = toProduct(newItem, "Didaftarkan dari Distribusi");
      setProducts((prev) => [newProduct, ...prev]);
      setNotice(`Produk "${newProduct.namaBarang}" didaftarkan.`);
    }
    
    // Auto add sub-kategori jika baru diketik manual di form
    if (values.kategori === "Others" && values.subKategori) {
      setIsAddingCategory(false); setSubCategory(values.subKategori);
      setOtherCategories((prev) => prev.some((item) => item.toLowerCase() === values.subKategori?.toLowerCase()) ? prev : [...prev, values.subKategori as string]);
    }
    if (values.kategori === "Sorted" && values.subKategori) {
      setIsAddingCategory(false); setSubCategory(values.subKategori);
      setSortedCategories((prev) => prev.some((item) => item.toLowerCase() === values.subKategori?.toLowerCase()) ? prev : [...prev, values.subKategori as string]);
    }

    setCategory(values.kategori);
    setRegisterOpen(false);
  };

  // --- FUNGSI MASTER MEREK & TIPE ---
  const handleAddBrand = () => {
    const brand = newBrand.trim(); const type = newBrandType.trim();
    if (!brand || !type) return;
    setBanData(prev => { if (prev[brand]) return prev; return { ...prev, [brand]: [type] }; });
    setNewBrand(""); setNewBrandType("");
  };

  const handleAddTypeToBrand = (brand: string) => {
    const type = newTypeInput.trim(); if (!type) return;
    setBanData(prev => { const current = prev[brand] || []; if (current.includes(type)) return prev; return { ...prev, [brand]: [...current, type] }; });
    setNewTypeInput("");
  };

  const handleDeleteBrand = (brand: string) => {
    if (!window.confirm(`Hapus merek "${brand}" beserta semua tipenya?`)) return;
    setBanData(prev => { const copy = { ...prev }; delete copy[brand]; return copy; });
    if (expandedBrand === brand) setExpandedBrand(null);
  };

  const handleDeleteType = (brand: string, typeIndex: number) => {
    setBanData(prev => ({ ...prev, [brand]: prev[brand].filter((_, i) => i !== typeIndex) }));
  };

  const handleSaveEditBrand = () => {
    const newName = editBrandValue.trim();
    if (!newName || !editBrandName || newName === editBrandName) { setEditBrandName(null); return; }
    setBanData(prev => { const copy = { ...prev }; copy[newName] = copy[editBrandName]; delete copy[editBrandName]; return copy; });
    setEditBrandName(null);
  };

  const handleSaveEditType = () => {
    if (!editTypeData) return;
    const { brand, index, value } = editTypeData; if (!value.trim()) return;
    setBanData(prev => ({ ...prev, [brand]: prev[brand].map((t, i) => i === index ? value.trim() : t) }));
    setEditTypeData(null);
  };

  // --- FUNGSI MASTER RING ---
  const handleAddRing = () => {
    const ring = newRing.trim(); if (!ring) return;
    setRingData(prev => Array.from(new Set([...prev, ring])).sort((a, b) => Number(a) - Number(b)));
    setNewRing("");
  };

  const handleDeleteRing = (index: number) => {
    setRingData(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveEditRing = () => {
    if (editRingIndex === null || !editRingValue.trim()) return;
    setRingData(prev => prev.map((r, i) => i === editRingIndex ? editRingValue.trim() : r).sort((a, b) => Number(a) - Number(b)));
    setEditRingIndex(null); setEditRingValue("");
  };

  // --- FUNGSI MASTER KATEGORI (OTHERS & SORTED) ---
  const handleAddMasterCategory = (type: "Others" | "Sorted") => {
    const name = newMasterCategory.trim(); if (!name) return;
    if (type === "Others") {
      setOtherCategories(prev => prev.some(i => i.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]);
    } else {
      setSortedCategories(prev => prev.some(i => i.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]);
    }
    setNewMasterCategory("");
  };

  const handleDeleteMasterCategory = (type: "Others" | "Sorted", index: number) => {
    if (!window.confirm("Hapus kategori ini?")) return;
    if (type === "Others") setOtherCategories(prev => prev.filter((_, i) => i !== index));
    else setSortedCategories(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveEditMasterCategory = () => {
    if (!editMasterCategoryData || !editMasterCategoryData.value.trim()) return;
    const { type, index, value } = editMasterCategoryData;
    if (type === "Others") setOtherCategories(prev => prev.map((c, i) => i === index ? value.trim() : c));
    else setSortedCategories(prev => prev.map((c, i) => i === index ? value.trim() : c));
    setEditMasterCategoryData(null);
  };

  const commitCategory = () => {
    const name = newCategory.trim(); if (!name) return;
    
    if (category === "Others") {
      setOtherCategories((prev) => prev.some((item) => item.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]);
      setSubCategory(name);
    } else if (category === "Sorted") {
      setSortedCategories((prev) => prev.some((item) => item.toLowerCase() === name.toLowerCase()) ? prev : [...prev, name]);
      setSubCategory(name);
    }
    
    setNewCategory(""); setIsAddingCategory(false);
    setNotice(`Kategori "${name}" ditambahkan ke ${category}.`);
  };

  const handleDelete = (item: Product) => {
    if (!window.confirm(`Hapus "${item.namaBarang}" dari stock list?`)) return;
    setProducts((prev) => prev.filter((entry) => entry.id !== item.id));
    setNotice(`Produk "${item.namaBarang}" dihapus.`);
  };

  const openEdit = (item: Product) => { setEditItem(item); setRegisterOpen(true); };

  const handleExportExcel = () => {
    if (filteredItems.length === 0) { setNotice("Tidak ada data."); return; }
    const header = detailColumns.map((column) => column.label).join(",");
    const rows = filteredItems.map((item) => detailColumns.map((column) => `"${column.value(item).replace(/"/g, '""')}"`).join(","));
    const csv = `\uFEFF${[header, ...rows].join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = `StockList_${category}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); setNotice("Excel berhasil diunduh.");
  };

  const handleExportDocument = () => {
    if (filteredItems.length === 0) { setNotice("Tidak ada data."); return; }
    const printWindow = window.open("", "_blank"); if (!printWindow) { setNotice("Popup diblokir."); return; }
    const rows = filteredItems.map((item) => `<tr>${detailColumns.map((column) => `<td>${escapeHtml(column.value(item))}</td>`).join("")}</tr>`).join("");
    const tableHead = `<tr>${detailColumns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr>`;
    printWindow.document.write(`<html><head><title>Stock List - ${escapeHtml(category)}</title><style>@page { size: landscape; } body { font-family: sans-serif; padding: 24px; } table { width: 100%; border-collapse: collapse; font-size: 9px; } th, td { border: 1px solid #d9d5dc; padding: 5px; } th { background: #f5f4f6; }</style></head><body><h1>Stock List - ${escapeHtml(category)}</h1><p>Dicetak ${new Date().toLocaleString("id-ID")}</p><table><thead>${tableHead}</thead><tbody>${rows}</tbody></table></body></html>`);
    printWindow.document.close(); printWindow.focus(); window.setTimeout(() => printWindow.print(), 400);
  };

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv")) { setNotice("Gunakan file .csv"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
      const dataLines = lines.slice(1);
      const imported: Product[] = dataLines.map((line, index) => {
        const cols = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
        const id = `IMP-${Date.now().toString().slice(-5)}-${index + 1}`;
        if (category === "Ban") {
          const [merekBan = "", typeBan = "", ukuranTapak = "", ukuranTinggi = "", ring = "", supplier = "", stok = "0"] = cols;
          return toProduct(formToItem(id, { kategori: "Ban", merekBan, typeBan, ukuranTapak, ukuranTinggi, ring, supplier, stok, gambar: "" }), `Import`);
        }
        
        const [subKategori = category, merekProduk = "", typeVelg = "", ring = "", wide = "", hole = "", et = "", colour = "", nobes = "", keterangan = "", supplier = "", stok = "0", notes = ""] = cols;
        return toProduct(formToItem(id, { kategori: category as any, subKategori, merekProduk, typeVelg, ring, wide, hole, et, colour, nobes, keterangan, supplier, stok, notes, gambar: "" }), `Import`);
      });
      if (imported.length > 0) { setProducts((prev) => [...imported, ...prev]); setNotice(`${imported.length} produk diimport.`); } else setNotice("Tidak ada data.");
    };
    reader.readAsText(file);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">Inventory</p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Management Product Distributor</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Kelola pendaftaran barang, supplier, dan stok dalam satu tampilan.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {can("distribusi", "input") && (
              <>
                <button type="button" onClick={() => { setEditItem(null); setRegisterOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_var(--primary)] transition-transform hover:-translate-y-0.5 active:translate-y-0"><Plus className="size-4" /> Register Produk Baru</button>
              </>
            )}
          </div>
        </header>

        <section className="surface overflow-hidden" aria-label="Stock list distribusi">
          
          {/* HEADER TAB & TOMBOL MASTER DATA (Sudah Dipindah) */}
          <div className="flex flex-col gap-3 border-b border-border px-4 pt-1 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              {/* Tab Kategori Utama */}
              <div className="flex items-center gap-2 py-2">
                {(["Ban", "Others", "Sorted"] as const).map((tab) => {
                  const TabIcon = tab === "Ban" ? Disc3 : tab === "Others" ? Box : Layers;
                  return (
                    <button key={tab} type="button" onClick={() => { setCategory(tab); setSubCategory("Semua"); }} className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${category === tab ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><TabIcon className="size-3.5" /> {tab}</button>
                  );
                })}
              </div>

              {/* Tombol Kelola Master Data */}
              {can("distribusi", "input") && (
                <button type="button" onClick={() => setIsMasterDataOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
                  <Settings className="size-3.5" /> Kelola Merek, Tipe, Ring & Kategori
                </button>
              )}
            </div>

            {/* Sub-Kategori Dinamis (Others / Sorted) */}
            {mounted && (category === "Others" || category === "Sorted") && (
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-muted/50 p-1">
                <button type="button" onClick={() => setSubCategory("Semua")} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${subCategory === "Semua" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Semua</button>
                {(category === "Others" ? otherCategories : sortedCategories).map((item) => (
                  <button key={item} type="button" onClick={() => setSubCategory(item)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${subCategory === item ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{item}</button>
                ))}
                {isAddingCategory ? (
                  <input autoFocus value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitCategory(); } if (e.key === "Escape") { setNewCategory(""); setIsAddingCategory(false); } }} onBlur={() => { if (!newCategory.trim()) setIsAddingCategory(false); }} placeholder="Kategori..." className="w-32 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary" />
                ) : (
                  <button type="button" onClick={() => setIsAddingCategory(true)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-card"><Plus className="size-3" /> Kategori</button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-border bg-muted/20 p-4 sm:p-5 lg:grid-cols-12 lg:items-center">
            <div className="relative lg:col-span-4">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari..." className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/30" />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-ring/30 lg:col-span-2">
              {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <div className="flex flex-wrap gap-2 lg:col-span-6 lg:justify-end">
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportFile} />
              {can("distribusi", "input") && <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 py-2.5 text-xs font-semibold transition-colors hover:bg-muted"><Upload className="size-4" /> Import CSV</button>}
              <button type="button" onClick={handleExportExcel} className="inline-flex items-center gap-2 rounded-xl bg-success px-3.5 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"><FileSpreadsheet className="size-4" /> Excel</button>
              <button type="button" onClick={handleExportDocument} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 py-2.5 text-xs font-semibold transition-colors hover:bg-muted"><FileText className="size-4" /> PDF</button>
            </div>
          </div>

          {notice && (
            <div className="flex items-center justify-between gap-3 border-b border-border bg-primary-soft px-4 py-2.5 text-xs font-medium text-accent-foreground sm:px-6">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")} className="flex size-6 items-center justify-center rounded-lg transition-colors hover:bg-black/5"><X className="size-3.5" /></button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-375 text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                <tr>
                  {detailColumns.map((column) => <th key={column.label} className={`whitespace-nowrap px-3 py-3.5 font-semibold ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""}`}>{column.label}</th>)}
                  <th className="whitespace-nowrap px-3 py-3.5 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {!mounted ? (
                  Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={detailColumns.length + 1} className="px-6 py-3"><div className="h-10 animate-pulse rounded-lg bg-muted/60" /></td></tr>)
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={detailColumns.length + 1} className="px-6 py-16">
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground"><Box className="size-6" /></span>
                        <div><p className="text-sm font-semibold">Belum ada barang terdaftar</p><p className="mt-1 text-xs text-muted-foreground">Tambahkan produk atau import CSV.</p></div>
                        {can("distribusi", "input") && <button type="button" onClick={() => { setEditItem(null); setRegisterOpen(true); }} className="mt-1 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Plus className="size-3.5" /> Register Produk Baru</button>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const stockStatus = statusOf(item.stok);
                    const statusClass = stockStatus === "Wajib Pesan" ? "bg-danger-soft text-danger" : stockStatus === "Menipis" ? "bg-warning-soft text-warning" : "bg-success-soft text-success";
                    const initials = (item.merekBan || item.merekProduk || item.subKategori || "?").slice(0, 3).toUpperCase();
                    return (
                      <tr key={item.id} className="group transition-colors hover:bg-muted/40">
                        {detailColumns.map((column) => {
                          const value = column.value(item);
                          const alignClass = column.align === "right" ? "text-right font-mono tabular-nums" : column.align === "center" ? "text-center" : "";
                          if (column.label === "Nama Barang") return (
                            <td key={column.label} className="px-3 py-3.5">
                              <div className="flex min-w-56 items-center gap-3">
                                {item.gambar ? <img src={item.gambar} alt={item.namaBarang} className="size-10 shrink-0 rounded-xl border border-border object-cover" /> : <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-[10px] font-semibold text-primary">{initials}</span>}
                                <div className="min-w-0"><p className="max-w-56 truncate font-medium">{item.namaBarang}</p><p className="truncate text-[11px] text-muted-foreground">{item.subKategori}</p></div>
                              </div>
                            </td>
                          );
                          if (column.label === "Stok") return <td key={column.label} className="px-3 py-3.5 text-right"><span className={`inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${statusClass}`}>{item.stok}</span></td>;
                          if (column.label === "Status") return <td key={column.label} className="px-3 py-3.5 text-center"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{stockStatus === "Wajib Pesan" && <TriangleAlert className="size-3.5" />}{stockStatus}</span></td>;
                          return <td key={column.label} className={`whitespace-nowrap px-3 py-3.5 text-xs ${alignClass} ${column.label === "Kode" ? "font-mono text-muted-foreground" : ""}`}>{value}</td>;
                        })}
                        <td className="px-3 py-3.5">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => setDetailItem(item)} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Eye className="size-4" /></button>
                            {can("distribusi", "edit") && <button onClick={() => openEdit(item)} className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"><Pencil className="size-4" /></button>}
                            {can("distribusi", "delete") && <button onClick={() => handleDelete(item)} className="rounded-xl p-2 text-muted-foreground transition-colors hover:border-danger/20 hover:bg-danger-soft hover:text-danger"><Trash2 className="size-4" /></button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground sm:px-6">
            <span>{mounted ? `Menampilkan ${filteredItems.length} dari ${categoryItems.length} produk ${category}` : "Memuat data…"}</span>
          </div>
        </section>
      </div>

      {registerOpen && (
        <RegisterProductModal
          suppliers={supplierOptions}
          categories={otherCategories}
          sortedCategories={sortedCategories} // Passing data sorted ke modal
          banData={banData}
          ringData={ringData}
          initialSubKategori={(category === "Others" || category === "Sorted") && subCategory !== "Semua" ? subCategory : undefined}
          initialData={editItem}
          onClose={() => { setRegisterOpen(false); setEditItem(null); }}
          onSubmit={handleRegister}
        />
      )}

      {detailItem && <ProductDetailModal item={detailItem} onClose={() => setDetailItem(null)} />}

      {isMasterDataOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-3 sm:p-6" onClick={() => setIsMasterDataOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Kelola Master Data</h2>
                <p className="text-sm text-muted-foreground">Merek, Tipe, Ring, dan Kategori tersinkronisasi.</p>
              </div>
              <button onClick={() => setIsMasterDataOpen(false)} className="rounded-xl p-2 hover:bg-muted"><X className="size-5" /></button>
            </div>

            {/* SECTION KATEGORI OTHERS & SORTED */}
            <div className="mb-8 space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">Kategori Others</h3>
                <div className="mb-3 flex gap-2">
                  <input value={newMasterCategory} onChange={(e) => setNewMasterCategory(e.target.value)} placeholder="Tambah Others (cth: Shock Absorber)" className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" onKeyDown={(e) => e.key === "Enter" && handleAddMasterCategory("Others")} />
                  <button onClick={() => handleAddMasterCategory("Others")} className="rounded-lg bg-primary px-3 py-2 text-primary-foreground"><Plus className="size-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {otherCategories.map((cat, idx) => {
                    const isEditing = editMasterCategoryData?.type === "Others" && editMasterCategoryData?.index === idx;
                    return (
                      <div key={idx} className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 py-1 text-sm">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input autoFocus value={editMasterCategoryData.value} onChange={(e) => setEditMasterCategoryData({ ...editMasterCategoryData, value: e.target.value })} className="w-24 rounded border border-border px-1 py-0.5 text-xs" onKeyDown={(e) => e.key === "Enter" && handleSaveEditMasterCategory()} />
                            <button onClick={handleSaveEditMasterCategory} className="text-primary hover:text-primary/80"><Check className="size-3" /></button>
                            <button onClick={() => setEditMasterCategoryData(null)} className="text-muted-foreground hover:text-foreground"><X className="size-3" /></button>
                          </div>
                        ) : (
                          <>
                            <span>{cat}</span>
                            <button onClick={() => setEditMasterCategoryData({ type: "Others", index: idx, value: cat })} className="ml-1 text-muted-foreground hover:text-primary"><Pencil className="size-3" /></button>
                            <button onClick={() => handleDeleteMasterCategory("Others", idx)} className="text-muted-foreground hover:text-danger"><Trash2 className="size-3" /></button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">Kategori Sorted</h3>
                <div className="mb-3 flex gap-2">
                  <input value={newMasterCategory} onChange={(e) => setNewMasterCategory(e.target.value)} placeholder="Tambah Sorted (cth: Parfum)" className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" onKeyDown={(e) => e.key === "Enter" && handleAddMasterCategory("Sorted")} />
                  <button onClick={() => handleAddMasterCategory("Sorted")} className="rounded-lg bg-primary px-3 py-2 text-primary-foreground"><Plus className="size-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sortedCategories.map((cat, idx) => {
                    const isEditing = editMasterCategoryData?.type === "Sorted" && editMasterCategoryData?.index === idx;
                    return (
                      <div key={idx} className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 py-1 text-sm">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input autoFocus value={editMasterCategoryData.value} onChange={(e) => setEditMasterCategoryData({ ...editMasterCategoryData, value: e.target.value })} className="w-24 rounded border border-border px-1 py-0.5 text-xs" onKeyDown={(e) => e.key === "Enter" && handleSaveEditMasterCategory()} />
                            <button onClick={handleSaveEditMasterCategory} className="text-primary hover:text-primary/80"><Check className="size-3" /></button>
                            <button onClick={() => setEditMasterCategoryData(null)} className="text-muted-foreground hover:text-foreground"><X className="size-3" /></button>
                          </div>
                        ) : (
                          <>
                            <span>{cat}</span>
                            <button onClick={() => setEditMasterCategoryData({ type: "Sorted", index: idx, value: cat })} className="ml-1 text-muted-foreground hover:text-primary"><Pencil className="size-3" /></button>
                            <button onClick={() => handleDeleteMasterCategory("Sorted", idx)} className="text-muted-foreground hover:text-danger"><Trash2 className="size-3" /></button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION MEREK & TIPE */}
            <div className="mb-8">
              <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">Merek & Tipe Ban</h3>
              
              <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="mb-2 text-xs font-semibold text-foreground">Tambah Merek Baru</h4>
                <div className="space-y-2">
                  <input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="Nama Merek (cth: Hainsen)" className="w-full rounded-lg border border-border px-3 py-2 text-sm" />
                  <input value={newBrandType} onChange={(e) => setNewBrandType(e.target.value)} placeholder="Tipe Pertama (cth: Tipe A)" className="w-full rounded-lg border border-border px-3 py-2 text-sm" onKeyDown={(e) => e.key === "Enter" && handleAddBrand()} />
                  <button onClick={handleAddBrand} className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">Tambah Merek & Tipe</button>
                </div>
              </div>

              <div className="space-y-2">
                {Object.keys(banData).map((brand) => {
                  const isExpanded = expandedBrand === brand;
                  const isEditingBrand = editBrandName === brand;
                  return (
                    <div key={brand} className="rounded-xl border border-border overflow-hidden">
                      <div className="flex items-center justify-between bg-muted/50 p-3">
                        {isEditingBrand ? (
                          <div className="flex flex-1 gap-2 mr-2">
                            <input autoFocus value={editBrandValue} onChange={(e) => setEditBrandValue(e.target.value)} className="flex-1 rounded border border-border px-2 py-1 text-sm" onKeyDown={(e) => e.key === "Enter" && handleSaveEditBrand()} />
                            <button onClick={handleSaveEditBrand} className="rounded bg-primary px-2 py-1 text-xs text-white">Simpan</button>
                            <button onClick={() => setEditBrandName(null)} className="rounded bg-muted px-2 py-1 text-xs">Batal</button>
                          </div>
                        ) : (
                          <button onClick={() => setExpandedBrand(isExpanded ? null : brand)} className="flex flex-1 items-center gap-2 text-sm font-semibold">
                            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                            {brand}
                          </button>
                        )}
                        {!isEditingBrand && (
                          <div className="flex gap-1">
                            <button onClick={() => { setEditBrandName(brand); setEditBrandValue(brand); }} className="p-1 text-muted-foreground hover:text-primary"><Pencil className="size-3.5" /></button>
                            <button onClick={() => handleDeleteBrand(brand)} className="p-1 text-muted-foreground hover:text-danger"><Trash2 className="size-3.5" /></button>
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="p-3 space-y-2 bg-background">
                          {banData[brand].map((type, idx) => {
                            const isEditingType = editTypeData?.brand === brand && editTypeData?.index === idx;
                            return (
                              <div key={idx} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-2 py-1.5 text-sm">
                                {isEditingType ? (
                                  <div className="flex flex-1 gap-2 mr-2">
                                    <input autoFocus value={editTypeData.value} onChange={(e) => setEditTypeData({ ...editTypeData, value: e.target.value })} className="flex-1 rounded border border-border px-2 py-1 text-xs" onKeyDown={(e) => e.key === "Enter" && handleSaveEditType()} />
                                    <button onClick={handleSaveEditType} className="rounded bg-primary px-2 py-1 text-xs text-white">Oke</button>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">{type}</span>
                                )}
                                {!isEditingType && (
                                  <div className="flex gap-1">
                                    <button onClick={() => setEditTypeData({ brand, index: idx, value: type })} className="p-1 text-muted-foreground hover:text-primary"><Pencil className="size-3" /></button>
                                    <button onClick={() => handleDeleteType(brand, idx)} className="p-1 text-muted-foreground hover:text-danger"><Trash2 className="size-3" /></button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          
                          <div className="flex gap-2 pt-2 border-t border-border/50 mt-2">
                            <input value={newTypeInput} onChange={(e) => setNewTypeInput(e.target.value)} placeholder="Tambah tipe baru..." className="flex-1 rounded-lg border border-border px-2 py-1.5 text-xs" onKeyDown={(e) => e.key === "Enter" && handleAddTypeToBrand(brand)} />
                            <button onClick={() => handleAddTypeToBrand(brand)} className="rounded-lg bg-primary px-2.5 py-1.5 text-xs text-primary-foreground"><Plus className="size-3" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION RING */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-foreground border-b border-border pb-2">Master Ring</h3>
              
              <div className="mb-4 flex gap-2">
                <input value={newRing} onChange={(e) => setNewRing(e.target.value)} placeholder="Tambah Ring (cth: 17)" className="flex-1 rounded-lg border border-border px-3 py-2 text-sm" onKeyDown={(e) => e.key === "Enter" && handleAddRing()} />
                <button onClick={handleAddRing} className="rounded-lg bg-primary px-3 py-2 text-primary-foreground"><Plus className="size-4" /></button>
              </div>

              <div className="flex flex-wrap gap-2">
                {ringData.map((ring, idx) => {
                  const isEditing = editRingIndex === idx;
                  return (
                    <div key={idx} className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 px-2 py-1 text-sm">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input autoFocus value={editRingValue} onChange={(e) => setEditRingValue(e.target.value)} className="w-16 rounded border border-border px-1 py-0.5 text-xs" onKeyDown={(e) => e.key === "Enter" && handleSaveEditRing()} />
                          <button onClick={handleSaveEditRing} className="text-primary hover:text-primary/80"><Check className="size-3" /></button>
                          <button onClick={() => setEditRingIndex(null)} className="text-muted-foreground hover:text-foreground"><X className="size-3" /></button>
                        </div>
                      ) : (
                        <>
                          <span className="font-mono font-semibold">{ring}</span>
                          <button onClick={() => { setEditRingIndex(idx); setEditRingValue(ring); }} className="ml-1 text-muted-foreground hover:text-primary"><Pencil className="size-3" /></button>
                          <button onClick={() => handleDeleteRing(idx)} className="text-muted-foreground hover:text-danger"><Trash2 className="size-3" /></button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function DistribusiPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Memuat data...</div>}>
      <DistribusiContent />
    </Suspense>
  );
}