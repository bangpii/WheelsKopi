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

export type TireCategory = "Mobil" | "Motor" | "SUV" | "Truk";

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

export const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const compactRupiah = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const kpis: Kpi[] = [
  {
    label: "Total Pendapatan",
    value: "Rp 128,4 jt",
    change: "+12,8%",
    trend: "up",
    hint: "dibanding bulan lalu",
    spark: [42, 48, 45, 56, 52, 61, 58, 67, 72, 69, 78, 84],
  },
  {
    label: "Ban Terjual",
    value: "1.284",
    change: "+8,2%",
    trend: "up",
    hint: "unit bulan ini",
    spark: [30, 36, 33, 41, 39, 46, 44, 52, 49, 57, 60, 64],
  },
  {
    label: "Stok Tersedia",
    value: "3.842",
    change: "-2,1%",
    trend: "down",
    hint: "unit di gudang",
    spark: [70, 68, 72, 69, 66, 70, 65, 63, 66, 62, 60, 58],
  },
  {
    label: "Perlu Restock",
    value: "18",
    change: "+4 SKU",
    trend: "down",
    hint: "di bawah stok minimum",
    spark: [8, 9, 8, 10, 9, 12, 11, 13, 12, 15, 14, 18],
  },
];

export const revenueMonthly: RevenuePoint[] = [
  { month: "Jan", value: 62 },
  { month: "Feb", value: 71 },
  { month: "Mar", value: 68 },
  { month: "Apr", value: 84 },
  { month: "Mei", value: 79 },
  { month: "Jun", value: 92 },
  { month: "Jul", value: 101 },
  { month: "Agu", value: 96 },
  { month: "Sep", value: 112 },
  { month: "Okt", value: 118 },
  { month: "Nov", value: 124 },
  { month: "Des", value: 128 },
];

export const categorySlices: CategorySlice[] = [
  { label: "Ban Mobil", value: 59, percent: 46, color: "var(--chart-1)" },
  { label: "Ban Motor", value: 31, percent: 24, color: "var(--chart-2)" },
  { label: "Ban Truk", value: 23, percent: 18, color: "var(--chart-3)" },
  { label: "Velg", value: 9, percent: 7, color: "var(--chart-4)" },
  { label: "Aksesoris", value: 6, percent: 5, color: "var(--chart-5)" },
];

export const stockItems: StockItem[] = [
  {
    id: "WK-1001",
    name: "Pilot Sport 4",
    brand: "Michelin",
    size: "205/55 R16",
    category: "Mobil",
    price: 1850000,
    stock: 24,
    minStock: 10,
    sold: 186,
  },
  {
    id: "WK-1002",
    name: "Turanza T005",
    brand: "Bridgestone",
    size: "195/65 R15",
    category: "Mobil",
    price: 1320000,
    stock: 8,
    minStock: 12,
    sold: 118,
  },
  {
    id: "WK-1003",
    name: "Champiro ECO",
    brand: "GT Radial",
    size: "185/70 R14",
    category: "Mobil",
    price: 720000,
    stock: 42,
    minStock: 15,
    sold: 142,
  },
  {
    id: "WK-1004",
    name: "NR73",
    brand: "IRC",
    size: "80/90-14",
    category: "Motor",
    price: 285000,
    stock: 96,
    minStock: 30,
    sold: 164,
  },
  {
    id: "WK-1005",
    name: "Sport XR",
    brand: "FDR",
    size: "90/80-14",
    category: "Motor",
    price: 310000,
    stock: 12,
    minStock: 20,
    sold: 97,
  },
  {
    id: "WK-1006",
    name: "Roadster",
    brand: "Swallow",
    size: "195/70 R15",
    category: "Mobil",
    price: 890000,
    stock: 18,
    minStock: 10,
    sold: 76,
  },
  {
    id: "WK-1007",
    name: "Desert Hawk",
    brand: "Achilles",
    size: "265/65 R17",
    category: "SUV",
    price: 1650000,
    stock: 6,
    minStock: 8,
    sold: 54,
  },
  {
    id: "WK-1008",
    name: "Dynapro AT2",
    brand: "Hankook",
    size: "235/60 R16",
    category: "SUV",
    price: 1480000,
    stock: 33,
    minStock: 12,
    sold: 68,
  },
  {
    id: "WK-1009",
    name: "Maxmiler",
    brand: "GT Radial",
    size: "185R14C",
    category: "Truk",
    price: 980000,
    stock: 0,
    minStock: 6,
    sold: 41,
  },
  {
    id: "WK-1010",
    name: "R-268",
    brand: "Bridgestone",
    size: "1000-20",
    category: "Truk",
    price: 3450000,
    stock: 14,
    minStock: 6,
    sold: 29,
  },
];

export const transactions: Transaction[] = [
  {
    id: "TRX-2401",
    customer: "Budi Santoso",
    items: 4,
    total: 5420000,
    status: "Lunas",
    method: "Transfer",
    time: "10:24",
  },
  {
    id: "TRX-2400",
    customer: "Siti Aminah",
    items: 2,
    total: 1760000,
    status: "Lunas",
    method: "QRIS",
    time: "09:58",
  },
  {
    id: "TRX-2399",
    customer: "Agus Wijaya",
    items: 6,
    total: 8930000,
    status: "Proses",
    method: "Transfer",
    time: "09:41",
  },
  {
    id: "TRX-2398",
    customer: "Dewi Lestari",
    items: 1,
    total: 1320000,
    status: "Lunas",
    method: "Tunai",
    time: "09:12",
  },
  {
    id: "TRX-2397",
    customer: "Rizky Pratama",
    items: 3,
    total: 3240000,
    status: "Lunas",
    method: "QRIS",
    time: "08:47",
  },
];

export const topProducts: TopProduct[] = [
  { name: "Pilot Sport 4", brand: "Michelin", sold: 186, revenue: 344100000, share: 92 },
  { name: "NR73", brand: "IRC", sold: 164, revenue: 46740000, share: 78 },
  { name: "Champiro ECO", brand: "GT Radial", sold: 142, revenue: 102240000, share: 64 },
  { name: "Turanza T005", brand: "Bridgestone", sold: 118, revenue: 155760000, share: 51 },
];

export const customers: Customer[] = [
  { name: "Toko Ban Jaya", type: "Reseller", orders: 48, spend: 42600000, initials: "TJ" },
  { name: "PT Armada Trans", type: "Perusahaan", orders: 32, spend: 38200000, initials: "AT" },
  { name: "CV Mitra Jaya", type: "Perusahaan", orders: 27, spend: 24750000, initials: "MJ" },
  { name: "Bengkel Cepat", type: "Bengkel", orders: 21, spend: 18600000, initials: "BC" },
];

export const suppliers: Supplier[] = [
  { name: "PT Michelin Indonesia", brand: "Michelin", leadTime: "3-5 hari", status: "Aktif" },
  { name: "PT Bridgestone Tire", brand: "Bridgestone", leadTime: "2-4 hari", status: "Aktif" },
  { name: "PT GT Radial", brand: "GT Radial", leadTime: "4-7 hari", status: "Aktif" },
  { name: "PT IRC Inoac", brand: "IRC", leadTime: "5-8 hari", status: "Perlu Review" },
];

export const monthlyTarget = {
  label: "Target Penjualan Oktober",
  achieved: 128400000,
  target: 150000000,
  percent: 86,
};
