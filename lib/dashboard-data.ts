// lib/dashboard-data.ts

export interface RevenuePoint {
  month: string;
  value: number;
}

export interface CategorySlice {
  label: string;
  value: number;
  percent: number;
  color: string;
}

export type TireCategory =
  | "Mobil"
  | "Motor"
  | "SUV"
  | "Truk"
  | "Velg"
  | "Aksesori";

export interface StockItem {
  id: string;
  name: string;
  brand: string;
  size: string;
  category: TireCategory;
  price: number;
  stock: number;
  minStock: number;
  sold: number;
}

export type TransactionStatus = "Lunas" | "Proses" | "Batal";
export type PaymentMethod = "Transfer" | "QRIS" | "Tunai";

export interface Transaction {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: TransactionStatus;
  method: PaymentMethod;
  time: string;
  tanggal?: string;
}

export interface TopProduct {
  name: string;
  brand: string;
  sold: number;
  revenue: number;
  share: number;
}

export interface Customer {
  name: string;
  type: string;
  orders: number;
  spend: number;
  initials: string;
}

export interface Supplier {
  name: string;
  brand: string;
  leadTime: string;
  status: "Aktif" | "Perlu Review";
}

export interface Kpi {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  hint: string;
  spark: number[];
}

// Format Mata Uang
export const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const compactRupiah = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/* ------------------------------------------------------------------ */
/*  DATA KOSONG (MULAI DARI NOL)                                      */
/* ------------------------------------------------------------------ */

// 1. Data Transaksi (KOSONG)
export const transactions: Transaction[] = [];

// 2. Data Grafik Pendapatan (KOSONG)
export const monthlyPerformance = [
  { month: "Jan", revenue: 0, orders: 0, profit: 0 },
  { month: "Feb", revenue: 0, orders: 0, profit: 0 },
  { month: "Mar", revenue: 0, orders: 0, profit: 0 },
  { month: "Apr", revenue: 0, orders: 0, profit: 0 },
  { month: "Mei", revenue: 0, orders: 0, profit: 0 },
  { month: "Jun", revenue: 0, orders: 0, profit: 0 },
  { month: "Jul", revenue: 0, orders: 0, profit: 0 },
  { month: "Ags", revenue: 0, orders: 0, profit: 0 },
  { month: "Sep", revenue: 0, orders: 0, profit: 0 },
  { month: "Okt", revenue: 0, orders: 0, profit: 0 },
  { month: "Nov", revenue: 0, orders: 0, profit: 0 },
  { month: "Des", revenue: 0, orders: 0, profit: 0 },
];

export const revenueMonthly: RevenuePoint[] = monthlyPerformance.map((m) => ({
  month: m.month,
  value: m.revenue,
}));

// 3. Data Stok (Hanya Data Master, Tanpa Penjualan)
export const stockItems: StockItem[] = [
  {
    id: "WK-8001",
    name: "Ecopia 195/65 R15",
    brand: "Bridgestone",
    size: "195/65 R15",
    category: "Mobil",
    price: 1050000,
    stock: 24,
    minStock: 10,
    sold: 0,
  },
  {
    id: "WK-8002",
    name: "Pilot Sport 225/45 R18",
    brand: "Michelin",
    size: "225/45 R18",
    category: "Mobil",
    price: 1800000,
    stock: 10,
    minStock: 10,
    sold: 0,
  },
  {
    id: "WK-9001",
    name: "SSW S280",
    brand: "SSW",
    size: "R18",
    category: "Velg",
    price: 2950000,
    stock: 12,
    minStock: 5,
    sold: 0,
  }
];

// 4. Data Supplier (Biarkan tetap ada untuk dropdown form)
export const suppliers: Supplier[] = [
  { name: "PT Michelin Indonesia", brand: "Michelin", leadTime: "3-5 hari", status: "Aktif" },
  { name: "PT Bridgestone Tire", brand: "Bridgestone", leadTime: "3-5 hari", status: "Aktif" },
  { name: "CV Mitra Ban Sejahtera", brand: "GT Radial", leadTime: "3-5 hari", status: "Aktif" },
  { name: "CV Velg Nusantara", brand: "SSW", leadTime: "3-5 hari", status: "Aktif" },
];

// 5. Data Customer (KOSONG)
export const customers: Customer[] = [];

// 6. Data Tambahan (Dummy agar UI tidak error)
export const categorySlices: CategorySlice[] = [
  { label: "Ban", value: 0, percent: 0, color: "var(--chart-1)" },
  { label: "Velg", value: 0, percent: 0, color: "var(--chart-2)" },
  { label: "Aksesori", value: 0, percent: 0, color: "var(--chart-3)" },
];

export const topProducts: TopProduct[] = [];

// 7. KPI (Di-set ke 0 semua)
export const kpis: Kpi[] = [
  {
    label: "Total Pendapatan",
    value: rupiah.format(0),
    change: "0%",
    trend: "up",
    hint: "belum ada transaksi",
    spark: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    label: "Unit Terjual",
    value: "0",
    change: "0%",
    trend: "up",
    hint: "belum ada penjualan",
    spark: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    label: "Total Produk",
    value: stockItems.length.toString(),
    change: "0%",
    trend: "up",
    hint: "produk terdaftar",
    spark: [3, 3, 3, 3, 3, 3, 3],
  },
  {
    label: "Perlu Restock",
    value: "0",
    change: "0%",
    trend: "down",
    hint: "SKU di bawah batas",
    spark: [0, 0, 0, 0, 0, 0, 0],
  },
];

export const monthlyTarget = {
  label: "Target Penjualan",
  achieved: 0,
  target: 80000000,
  percent: 0,
};