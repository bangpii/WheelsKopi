"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import type { ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Disc3,
  Eye,
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  Upload,
  X,
  Pencil,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RegisterProductModal } from "@/components/distribusi/register-product-modal";
import { ProductDetailModal } from "@/components/distribusi/product-detail-modal";
import { rupiah } from "@/lib/dashboard-data";
import {
  useData,
  toProduct,
  type Product,
} from "@/lib/context/data-context";
import type {
  DistribusiCategory,
  DistribusiFormValues,
} from "@/lib/distribusi-data";
// IMPORT DIPERBAIKI: Hapus getStockStatusInfo
import { formToItem, othersCategories } from "@/lib/distribusi-data";
import { useCan } from "@/lib/permissions";

const statusOptions = ["Semua Status Stok", "Tersedia", "Menipis", "Wajib Pesan"];

// FUNGSI BARU: Menentukan status stok secara statis
function statusOf(stok: number) {
  if (stok < 2) return "Wajib Pesan";
  if (stok <= 5) return "Menipis";
  return "Tersedia";
}

function specOf(item: Product) {
  if (item.kategori === "Ban") {
    return [
      item.ukuranTapak && item.ukuranTinggi
        ? `${item.ukuranTapak}/${item.ukuranTinggi}`
        : item.ukuranTapak || item.ukuranTinggi,
      item.ring,
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (item.subKategori === "Velg") {
    return [
      item.typeVelg,
      item.ring,
      item.wide,
      item.hole,
      item.et ? `ET ${item.et}` : "",
      item.colour,
      item.nobes,
    ]
      .filter(Boolean)
      .join(" • ");
  }

  return item.keterangan || item.ukuran || "-";
}

function money(value?: number) {
  return value ? rupiah.format(value) : "-";
}

interface DetailColumn {
  label: string;
  value: (item: Product) => string;
  align?: "left" | "right" | "center";
}

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
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function DistribusiContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "others" ? "Others" : "Ban";

  const { products, setProducts, suppliers } = useData();
  const can = useCan();

  const [category, setCategory] = useState<DistribusiCategory>(initialTab);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Semua Status Stok");
  const [subCategory, setSubCategory] = useState("Semua");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [otherCategories, setOtherCategories] = useState<string[]>(() => {
    if (typeof window === "undefined") return [...othersCategories];

    try {
      const stored = window.localStorage.getItem("wheelskopi-other-categories");
      const parsed = stored ? (JSON.parse(stored) as string[]) : [];

      return Array.from(
        new Set([
          ...othersCategories,
          ...(Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : []),
        ]),
      );
    } catch {
      return [...othersCategories];
    }
  });
  
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [detailItem, setDetailItem] = useState<Product | null>(null);
  
  const [notice, setNotice] = useState("");
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const custom = otherCategories.filter(
      (item) => !(othersCategories as readonly string[]).includes(item),
    );
    window.localStorage.setItem(
      "wheelskopi-other-categories",
      JSON.stringify(custom),
    );
  }, [mounted, otherCategories]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "others") setCategory("Others");
    if (tab === "ban") setCategory("Ban");
  }, [searchParams]);

  const supplierOptions = suppliers.map((s) => ({ name: s.name }));

  const categoryItems = products.filter(
    (item) => item.kategoriUtama === category,
  );

  const filteredItems = categoryItems.filter((item) => {
    const keyword = search.trim().toLowerCase();
    
    const searchTarget = [
      item.namaBarang,
      item.subKategori,
      item.supplier,
      item.merekBan,
      item.merekProduk,
      item.ukuran,
      item.ukuranTapak,
      item.ukuranTinggi,
      item.ring,
      item.item,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchSearch = keyword.length === 0 || searchTarget.includes(keyword);

    // GUNAKAN FUNGSI STATIS
    const computedStatus = statusOf(item.stok);
    const matchStatus = status === "Semua Status Stok" || computedStatus === status;
    const matchSubCategory =
      category !== "Others" ||
      subCategory === "Semua" ||
      item.subKategori === subCategory;

    return matchSearch && matchStatus && matchSubCategory;
  });

  const handleRegister = (values: DistribusiFormValues) => {
    if (editItem) {
      const updatedItem = formToItem(editItem.id, values);
      const updatedProduct: Product = {
        ...editItem,
        ...updatedItem,
        kategoriUtama: values.kategori,
        // Pertahankan data lama yang tidak lagi ditampilkan di form.
        hargaModalAsli: editItem.hargaModalAsli,
        hargaModalToko: editItem.hargaModalToko,
        hargaTagihanToko:
          updatedItem.hargaTagihanToko ?? editItem.hargaTagihanToko,
        tanggal: editItem.tanggal,
        pembayaran: editItem.pembayaran,
        jenisBarang: editItem.jenisBarang,
        owner: editItem.owner,
        paymentDate: editItem.paymentDate,
        nomorBon: editItem.nomorBon,
        kodeBarang: editItem.kodeBarang,
        gtySet: editItem.gtySet,
        discount: editItem.discount,
        dealerPrice: editItem.dealerPrice,
        dprice: editItem.dprice,
        discountType: editItem.discountType,
        rawPrice: editItem.rawPrice,
        sswDisc: editItem.sswDisc,
        sswDisc2: editItem.sswDisc2,
        rawPriceAfterDisc: editItem.rawPriceAfterDisc,
        shippingFee: editItem.shippingFee,
        shippingPerSet: editItem.shippingPerSet,
        subTotalModalTP: editItem.subTotalModalTP,
        modal1Set: editItem.modal1Set,
        paymentTipe: editItem.paymentTipe,
        up: editItem.up,
        modalToko: editItem.modalToko,
        arrivalDate: editItem.arrivalDate,
        stockOwner: editItem.stockOwner,
        history: [
          ...editItem.history,
          `[${new Date().toLocaleString("id-ID")}] Diperbarui dari Distribusi`,
        ],
      };

      setProducts((prev) =>
        prev.map((p) => (p.id === editItem.id ? updatedProduct : p))
      );
      setNotice(`Produk "${updatedProduct.namaBarang}" berhasil diperbarui.`);
      setEditItem(null);
    } else {
      const newItem = formToItem(`WK-${Date.now().toString().slice(-6)}`, values);
      const newProduct = toProduct(newItem, "Didaftarkan dari Distribusi");

      setProducts((prev) => [newProduct, ...prev]);
      setNotice(`Produk "${newProduct.namaBarang}" berhasil didaftarkan.`);
    }

    if (values.kategori === "Others" && values.subKategori) {
      setIsAddingCategory(false);
      setSubCategory(values.subKategori);
      setOtherCategories((prev) =>
        prev.some(
          (item) => item.toLowerCase() === values.subKategori?.toLowerCase(),
        )
          ? prev
          : [...prev, values.subKategori as string],
      );
    }

    setCategory(values.kategori);
    setRegisterOpen(false);
  };

  const commitCategory = () => {
    const name = newCategory.trim();
    if (!name) return;

    setOtherCategories((prev) =>
      prev.some((item) => item.toLowerCase() === name.toLowerCase())
        ? prev
        : [...prev, name],
    );
    setCategory("Others");
    setSubCategory(name);
    setNewCategory("");
    setIsAddingCategory(false);
    setNotice(`Kategori "${name}" ditambahkan.`);
  };

  const handleDelete = (item: Product) => {
    const confirmed = window.confirm(`Hapus "${item.namaBarang}" dari stock list?`);
    if (!confirmed) return;

    setProducts((prev) => prev.filter((entry) => entry.id !== item.id));
    setNotice(`Produk "${item.namaBarang}" telah dihapus.`);
  };

  const openEdit = (item: Product) => {
    setEditItem(item);
    setRegisterOpen(true);
  };

  const handleExportExcel = () => {
    if (filteredItems.length === 0) {
      setNotice("Tidak ada data untuk diexport.");
      return;
    }

    const header = detailColumns.map((column) => column.label).join(",");

    const rows = filteredItems.map((item) =>
      detailColumns
        .map((column) => `"${column.value(item).replace(/"/g, '""')}"`)
        .join(","),
    );

    const csv = `\uFEFF${[header, ...rows].join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `StockList_${category}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setNotice("Stock list berhasil dikonversi ke Excel (CSV).");
  };

  const handleExportDocument = () => {
    if (filteredItems.length === 0) {
      setNotice("Tidak ada data untuk diexport.");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setNotice("Popup diblokir browser. Izinkan popup untuk mencetak.");
      return;
    }

    const rows = filteredItems
      .map(
        (item) =>
          `<tr>${detailColumns
            .map((column) => `<td>${escapeHtml(column.value(item))}</td>`)
            .join("")}</tr>`,
      )
      .join("");

    const tableHead = `<tr>${detailColumns
      .map((column) => `<th>${escapeHtml(column.label)}</th>`)
      .join("")}</tr>`;

    printWindow.document.write(`
      <html>
        <head>
          <title>Stock List - ${escapeHtml(category)}</title>
          <style>
            @page { size: landscape; }
            body { font-family: sans-serif; padding: 24px; color: #18141b; }
            h1 { font-size: 20px; margin-bottom: 4px; }
            p { color: #706a76; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            th, td { border: 1px solid #d9d5dc; padding: 5px 6px; text-align: left; white-space: nowrap; }
            th { background: #f5f4f6; text-transform: uppercase; font-size: 8px; letter-spacing: 0.08em; }
          </style>
        </head>
        <body>
          <h1>Stock List - Kategori ${escapeHtml(category)}</h1>
          <p>Dicetak ${new Date().toLocaleString("id-ID")}</p>
          <table>
            <thead>
              ${tableHead}
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 400);
  };

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const isCsv = file.name.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      setNotice("File .xlsx belum diproses di demo frontend ini. Gunakan file .csv.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/);
      const filledLines = lines.filter((line) => line.trim().length > 0);
      const dataLines = filledLines.slice(1);

      const imported: Product[] = dataLines.map((line, index) => {
        const cols = line
          .split(",")
          .map((value) => value.trim().replace(/^"|"$/g, ""));
        const id = `IMP-${Date.now().toString().slice(-5)}-${index + 1}`;

        if (category === "Ban") {
          const [
            merekBan = "",
            typeBan = "",
            ukuranTapak = "",
            ukuranTinggi = "",
            ring = "",
            supplier = "",
            stok = "0",
          ] = cols;

          const item = formToItem(id, {
            kategori: "Ban",
            merekBan,
            typeBan,
            ukuranTapak,
            ukuranTinggi,
            ring,
            supplier,
            stok,
            gambar: "",
          });

          return toProduct(item, `Diimport dari ${file.name}`);
        }

        const [
          subKategori = "Others",
          merekProduk = "",
          typeVelg = "",
          ring = "",
          wide = "",
          hole = "",
          et = "",
          colour = "",
          nobes = "",
          keterangan = "",
          supplier = "",
          stok = "0",
          notes = "",
        ] = cols;

        const item = formToItem(id, {
          kategori: "Others",
          subKategori,
          merekProduk,
          typeVelg,
          ring,
          wide,
          hole,
          et,
          colour,
          nobes,
          keterangan,
          supplier,
          stok,
          notes,
          gambar: "",
        });

        return toProduct(item, `Diimport dari ${file.name}`);
      });

      if (imported.length === 0) {
        setNotice("Tidak ada baris data yang bisa diimport.");
        return;
      }

      setProducts((prev) => [...imported, ...prev]);
      setNotice(`${imported.length} produk berhasil diimport dari ${file.name}.`);
    };

    reader.readAsText(file);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
              Inventory
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Management Product Distributor
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Kelola pendaftaran barang, supplier, dan stok dalam satu tampilan.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {can("distribusi", "input") && (
              <button
                type="button"
                onClick={() => {
                  setEditItem(null);
                  setRegisterOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_var(--primary)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="size-4" />
                Register Produk Baru
              </button>
            )}
          </div>
        </header>

        <section className="surface overflow-hidden" aria-label="Stock list distribusi">
          <div className="flex flex-col gap-3 border-b border-border px-4 pt-1 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center">
              <span className="flex items-center gap-2 border-b-2 border-primary px-4 py-3.5 text-sm font-semibold text-primary sm:px-5">
                <Box className="size-4" />
                Product Distributor
              </span>
              {can("distribusi", "input") && (
                <button
                  type="button"
                  onClick={() => {
                    setEditItem(null);
                    setRegisterOpen(true);
                  }}
                  className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-5"
                >
                  <Plus className="size-4" />
                  Register Produk Baru
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-1">
                {(["Ban", "Others"] as const).map((tab) => {
                  const TabIcon = tab === "Ban" ? Disc3 : Box;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setCategory(tab);
                        setSubCategory("Semua");
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        category === tab
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <TabIcon className="size-3.5" />
                      {tab}
                    </button>
                  );
                })}
              </div>

              {mounted && (
                <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-muted/50 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("Others");
                      setSubCategory("Semua");
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      category === "Others" && subCategory === "Semua"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Semua
                  </button>
                  {otherCategories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCategory("Others");
                        setSubCategory(item);
                      }}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        category === "Others" && subCategory === item
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                  {isAddingCategory ? (
                    <input
                      autoFocus
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          commitCategory();
                        }
                        if (event.key === "Escape") {
                          setNewCategory("");
                          setIsAddingCategory(false);
                        }
                      }}
                      onBlur={() => {
                        if (!newCategory.trim()) setIsAddingCategory(false);
                      }}
                      placeholder="Ketik kategori..."
                      className="w-32 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs outline-none focus:border-primary"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(true)}
                      className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-card"
                    >
                      <Plus className="size-3" />
                      Kategori
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 border-b border-border bg-muted/20 p-4 sm:p-5 lg:grid-cols-12 lg:items-center">
            <div className="relative lg:col-span-4">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, merek, ukuran, supplier..."
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-2 focus:ring-ring/30"
              />
            </div>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30 lg:col-span-2"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2 lg:col-span-6 lg:justify-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImportFile}
              />
              {can("distribusi", "input") && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 py-2.5 text-xs font-semibold transition-colors hover:bg-muted"
                >
                  <Upload className="size-4" />
                  Import CSV
                </button>
              )}
              <button
                type="button"
                onClick={handleExportExcel}
                className="inline-flex items-center gap-2 rounded-xl bg-success px-3.5 py-2.5 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <FileSpreadsheet className="size-4" />
                Convert to Excel
              </button>
              <button
                type="button"
                onClick={handleExportDocument}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 py-2.5 text-xs font-semibold transition-colors hover:bg-muted"
              >
                <FileText className="size-4" />
                PDF / Print
              </button>
            </div>
          </div>

          {notice && (
            <div className="flex items-center justify-between gap-3 border-b border-border bg-primary-soft px-4 py-2.5 text-xs font-medium text-accent-foreground sm:px-6">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Tutup notifikasi"
                className="flex size-6 items-center justify-center rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1500px] text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                <tr>
                  {detailColumns.map((column) => (
                    <th
                      key={column.label}
                      className={`whitespace-nowrap px-3 py-3.5 font-semibold ${
                        column.align === "right"
                          ? "text-right"
                          : column.align === "center"
                            ? "text-center"
                            : ""
                      }`}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-3 py-3.5 text-center font-semibold">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {!mounted ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td
                        colSpan={detailColumns.length + 1}
                        className="px-6 py-3"
                      >
                        <div className="h-10 animate-pulse rounded-lg bg-muted/60" />
                      </td>
                    </tr>
                  ))
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={detailColumns.length + 1}
                      className="px-6 py-16"
                    >
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <Box className="size-6" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">Belum ada barang terdaftar</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Tambahkan produk baru lewat form register, atau import dari file CSV.
                          </p>
                        </div>
                        {can("distribusi", "input") && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditItem(null);
                              setRegisterOpen(true);
                            }}
                            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                          >
                            <Plus className="size-3.5" />
                            Register Produk Baru
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const stockStatus = statusOf(item.stok);
                    const statusClass =
                      stockStatus === "Wajib Pesan"
                        ? "bg-danger-soft text-danger"
                        : stockStatus === "Menipis"
                          ? "bg-warning-soft text-warning"
                          : "bg-success-soft text-success";
                    const initials = (
                      item.merekBan ||
                      item.merekProduk ||
                      item.subKategori ||
                      "?"
                    )
                      .slice(0, 3)
                      .toUpperCase();

                    return (
                      <tr key={item.id} className="group transition-colors hover:bg-muted/40">
                        {detailColumns.map((column) => {
                          const value = column.value(item);
                          const alignClass =
                            column.align === "right"
                              ? "text-right font-mono tabular-nums"
                              : column.align === "center"
                                ? "text-center"
                                : "";

                          if (column.label === "Nama Barang") {
                            return (
                              <td key={column.label} className="px-3 py-3.5">
                                <div className="flex min-w-56 items-center gap-3">
                                  {item.gambar ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                      src={item.gambar}
                                      alt={item.namaBarang}
                                      className="size-10 shrink-0 rounded-xl border border-border object-cover"
                                    />
                                  ) : (
                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-[10px] font-semibold text-primary">
                                      {initials}
                                    </span>
                                  )}
                                  <div className="min-w-0">
                                    <p className="max-w-56 truncate font-medium">
                                      {item.namaBarang}
                                    </p>
                                    <p className="truncate text-[11px] text-muted-foreground">
                                      {item.subKategori}
                                    </p>
                                  </div>
                                </div>
                              </td>
                            );
                          }

                          if (column.label === "Stok") {
                            return (
                              <td
                                key={column.label}
                                className="px-3 py-3.5 text-right"
                              >
                                <span
                                  className={`inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${statusClass}`}
                                >
                                  {item.stok}
                                </span>
                              </td>
                            );
                          }

                          if (column.label === "Status") {
                            return (
                              <td
                                key={column.label}
                                className="px-3 py-3.5 text-center"
                              >
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}
                                >
                                  {stockStatus === "Wajib Pesan" && (
                                    <TriangleAlert className="size-3.5" />
                                  )}
                                  {stockStatus}
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={column.label}
                              className={`whitespace-nowrap px-3 py-3.5 text-xs ${alignClass} ${
                                column.label === "Kode"
                                  ? "font-mono text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {value}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3.5">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => setDetailItem(item)}
                              className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              title="Lihat Detail Produk"
                            >
                              <Eye className="size-4" />
                            </button>
                            {can("distribusi", "edit") && (
                              <button
                                onClick={() => openEdit(item)}
                                className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
                                title="Edit Produk"
                              >
                                <Pencil className="size-4" />
                              </button>
                            )}
                            {can("distribusi", "delete") && (
                              <button
                                onClick={() => handleDelete(item)}
                                className="rounded-xl p-2 text-muted-foreground transition-colors hover:border-danger/20 hover:bg-danger-soft hover:text-danger"
                                title="Hapus Produk"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
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
            <span>
              {mounted
                ? `Menampilkan ${filteredItems.length} dari ${categoryItems.length} produk ${category}`
                : "Memuat data…"}
            </span>
            <span className="font-mono tracking-wide uppercase">
              Data demo • frontend only
            </span>
          </div>
        </section>
      </div>

      {registerOpen && (
        <RegisterProductModal
          suppliers={supplierOptions}
          categories={otherCategories}
          initialSubKategori={
            category === "Others" && subCategory !== "Semua"
              ? subCategory
              : undefined
          }
          initialData={editItem}
          onClose={() => {
            setRegisterOpen(false);
            setEditItem(null);
          }}
          onSubmit={handleRegister}
        />
      )}

      {detailItem && (
        <ProductDetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
        />
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