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

export interface TransactionLine {
  productId: string;
  qty: number;
}

export interface Transaction {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: TransactionStatus;
  method: PaymentMethod;
  time: string;
  tanggal?: string;
  date?: string;
  createdAt?: string;
  lines?: TransactionLine[];
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
/*  SEED HARIAN: TANGGAL 1 - 8                                        */
/* ------------------------------------------------------------------ */

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Ags",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const SEED_NOW = new Date();
const SEED_YEAR = SEED_NOW.getFullYear();
const SEED_MONTH = SEED_NOW.getMonth();

function seedDate(day: number): string {
  return `${SEED_YEAR}-${String(SEED_MONTH + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface SeedProduct {
  name: string;
  brand: string;
  price: number;
  category: TireCategory;
}

const PRODUCT_LOOKUP = new Map<string, SeedProduct>([
  [
    "WK-8001",
    {
      name: "Ecopia 195/65 R15",
      brand: "Bridgestone",
      price: 1050000,
      category: "Mobil",
    },
  ],
  [
    "WK-8002",
    {
      name: "Pilot Sport 225/45 R18",
      brand: "Michelin",
      price: 1800000,
      category: "Mobil",
    },
  ],
  [
    "WK-9001",
    {
      name: "SSW S280",
      brand: "SSW",
      price: 2950000,
      category: "Velg",
    },
  ],
  [
    "WK-9002",
    {
      name: "Shock Absorber Belakang",
      brand: "KYB",
      price: 550000,
      category: "Aksesori",
    },
  ],
]);

/* Urutan array: terbaru dulu (tanggal 8 -> 1) agar muncul di Transaksi Terbaru. */
export const transactions: Transaction[] = [
  {
    id: "INV-D08-02",
    customer: "Bengkel Jaya Motor",
    items: 1,
    total: 2950000,
    status: "Lunas",
    method: "QRIS",
    time: "15:15",
    tanggal: seedDate(8),
    lines: [{ productId: "WK-9001", qty: 1 }],
  },
  {
    id: "INV-D08-01",
    customer: "Komunitas Velg Medan",
    items: 2,
    total: 3600000,
    status: "Lunas",
    method: "Transfer",
    time: "10:30",
    tanggal: seedDate(8),
    lines: [{ productId: "WK-8002", qty: 2 }],
  },
  {
    id: "INV-D07-02",
    customer: "Pelanggan Umum",
    items: 1,
    total: 1050000,
    status: "Lunas",
    method: "Tunai",
    time: "16:00",
    tanggal: seedDate(7),
    lines: [{ productId: "WK-8001", qty: 1 }],
  },
  {
    id: "INV-D07-01",
    customer: "CV Ban Sejahtera",
    items: 1,
    total: 2950000,
    status: "Proses",
    method: "QRIS",
    time: "09:40",
    tanggal: seedDate(7),
    lines: [{ productId: "WK-9001", qty: 1 }],
  },
  {
    id: "INV-D06-02",
    customer: "Toko Maju Jaya",
    items: 2,
    total: 1100000,
    status: "Lunas",
    method: "Transfer",
    time: "14:05",
    tanggal: seedDate(6),
    lines: [{ productId: "WK-9002", qty: 2 }],
  },
  {
    id: "INV-D06-01",
    customer: "Bengkel Sinar",
    items: 3,
    total: 3150000,
    status: "Lunas",
    method: "Tunai",
    time: "10:20",
    tanggal: seedDate(6),
    lines: [{ productId: "WK-8001", qty: 3 }],
  },
  {
    id: "INV-D05-02",
    customer: "CV Velg Nusantara",
    items: 1,
    total: 2950000,
    status: "Proses",
    method: "QRIS",
    time: "15:45",
    tanggal: seedDate(5),
    lines: [{ productId: "WK-9001", qty: 1 }],
  },
  {
    id: "INV-D05-01",
    customer: "Toko Maju Jaya",
    items: 2,
    total: 3600000,
    status: "Lunas",
    method: "Transfer",
    time: "09:30",
    tanggal: seedDate(5),
    lines: [{ productId: "WK-8002", qty: 2 }],
  },
  {
    id: "INV-D04-02",
    customer: "Bengkel Jaya Motor",
    items: 1,
    total: 1800000,
    status: "Lunas",
    method: "Tunai",
    time: "13:30",
    tanggal: seedDate(4),
    lines: [{ productId: "WK-8002", qty: 1 }],
  },
  {
    id: "INV-D04-01",
    customer: "Toko Ban Binjai",
    items: 4,
    total: 4200000,
    status: "Lunas",
    method: "Transfer",
    time: "08:50",
    tanggal: seedDate(4),
    lines: [{ productId: "WK-8001", qty: 4 }],
  },
  {
    id: "INV-D03-02",
    customer: "Pelanggan Umum",
    items: 1,
    total: 550000,
    status: "Lunas",
    method: "Tunai",
    time: "16:10",
    tanggal: seedDate(3),
    lines: [{ productId: "WK-9002", qty: 1 }],
  },
  {
    id: "INV-D03-01",
    customer: "Komunitas Velg Medan",
    items: 2,
    total: 5900000,
    status: "Lunas",
    method: "QRIS",
    time: "11:20",
    tanggal: seedDate(3),
    lines: [{ productId: "WK-9001", qty: 2 }],
  },
  {
    id: "INV-D02-01",
    customer: "CV Ban Sejahtera",
    items: 3,
    total: 5400000,
    status: "Proses",
    method: "Transfer",
    time: "10:05",
    tanggal: seedDate(2),
    lines: [{ productId: "WK-8002", qty: 3 }],
  },
  {
    id: "INV-D01-02",
    customer: "Bengkel Sinar",
    items: 1,
    total: 2950000,
    status: "Lunas",
    method: "QRIS",
    time: "14:40",
    tanggal: seedDate(1),
    lines: [{ productId: "WK-9001", qty: 1 }],
  },
  {
    id: "INV-D01-01",
    customer: "Toko Maju Jaya",
    items: 2,
    total: 2100000,
    status: "Lunas",
    method: "Transfer",
    time: "09:15",
    tanggal: seedDate(1),
    lines: [{ productId: "WK-8001", qty: 2 }],
  },
];

function totalRevenue(list: Transaction[]): number {
  return list.reduce((sum, trx) => sum + (trx.total || 0), 0);
}

function revenueOnDay(day: number): number {
  const date = seedDate(day);
  return totalRevenue(transactions.filter((trx) => trx.tanggal === date));
}

function unitsOnDay(day: number): number {
  const date = seedDate(day);
  return transactions
    .filter((trx) => trx.tanggal === date)
    .reduce(
      (sum, trx) =>
        sum + (trx.lines ?? []).reduce((lineSum, line) => lineSum + line.qty, 0),
      0,
    );
}

const dailyRevenue = [1, 2, 3, 4, 5, 6, 7, 8].map(revenueOnDay);
const dailyUnits = [1, 2, 3, 4, 5, 6, 7, 8].map(unitsOnDay);
const SEED_TOTAL_REVENUE = totalRevenue(transactions);

/* ------------------------------------------------------------------ */
/*  DATA STOK (DISESUAIKAN DENGAN PENJUALAN)                          */
/* ------------------------------------------------------------------ */

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
    sold: 6,
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
    sold: 6,
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
    sold: 4,
  },
  {
    id: "WK-9002",
    name: "Shock Absorber Belakang",
    brand: "KYB",
    size: "-",
    category: "Aksesori",
    price: 550000,
    stock: 5,
    minStock: 3,
    sold: 1,
  },
];

/* ------------------------------------------------------------------ */
/*  DATA TURUNAN DARI TRANSAKSI                                       */
/* ------------------------------------------------------------------ */

function buildTopProducts(): TopProduct[] {
  const sales = new Map<string, { sold: number; revenue: number }>();

  for (const trx of transactions) {
    for (const line of trx.lines ?? []) {
      const product = PRODUCT_LOOKUP.get(line.productId);

      if (!product) continue;

      const entry = sales.get(line.productId) ?? { sold: 0, revenue: 0 };
      entry.sold += line.qty;
      entry.revenue += line.qty * product.price;
      sales.set(line.productId, entry);
    }
  }

  return Array.from(sales.entries())
    .map(([id, entry]) => {
      const product = PRODUCT_LOOKUP.get(id);

      return {
        name: product?.name ?? id,
        brand: product?.brand ?? "-",
        sold: entry.sold,
        revenue: entry.revenue,
        share:
          SEED_TOTAL_REVENUE === 0
            ? 0
            : Math.round((entry.revenue / SEED_TOTAL_REVENUE) * 100),
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);
}

function customerType(name: string): string {
  if (name.includes("Toko")) return "Reseller";
  if (name.includes("Bengkel")) return "Bengkel";
  if (name.includes("Komunitas") || name.includes("Club")) return "Komunitas";

  return "Perorangan";
}

function buildCustomers(): Customer[] {
  const grouped = new Map<string, { orders: number; spend: number }>();

  for (const trx of transactions) {
    const entry = grouped.get(trx.customer) ?? { orders: 0, spend: 0 };
    entry.orders += 1;
    entry.spend += trx.total;
    grouped.set(trx.customer, entry);
  }

  return Array.from(grouped.entries())
    .map(([name, entry]) => ({
      name,
      type: customerType(name),
      orders: entry.orders,
      spend: entry.spend,
      initials: name
        .split(" ")
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase(),
    }))
    .sort((a, b) => b.spend - a.spend);
}

function categoryUnits(category: TireCategory): number {
  return transactions.reduce((sum, trx) => {
    const units = (trx.lines ?? []).reduce((lineSum, line) => {
      const product = PRODUCT_LOOKUP.get(line.productId);

      return product?.category === category ? lineSum + line.qty : lineSum;
    }, 0);

    return sum + units;
  }, 0);
}

const totalUnits = dailyUnits.reduce((sum, value) => sum + value, 0);

export const topProducts: TopProduct[] = buildTopProducts();

export const customers: Customer[] = buildCustomers();

export const categorySlices: CategorySlice[] = [
  {
    label: "Ban",
    value: categoryUnits("Mobil"),
    percent:
      totalUnits === 0
        ? 0
        : Math.round((categoryUnits("Mobil") / totalUnits) * 100),
    color: "var(--chart-1)",
  },
  {
    label: "Velg",
    value: categoryUnits("Velg"),
    percent:
      totalUnits === 0
        ? 0
        : Math.round((categoryUnits("Velg") / totalUnits) * 100),
    color: "var(--chart-2)",
  },
  {
    label: "Aksesori",
    value: categoryUnits("Aksesori"),
    percent:
      totalUnits === 0
        ? 0
        : Math.round((categoryUnits("Aksesori") / totalUnits) * 100),
    color: "var(--chart-3)",
  },
];

/* ------------------------------------------------------------------ */
/*  SUPPLIER                                                          */
/* ------------------------------------------------------------------ */

export const suppliers: Supplier[] = [
  {
    name: "PT Michelin Indonesia",
    brand: "Michelin",
    leadTime: "3-5 hari",
    status: "Aktif",
  },
  {
    name: "PT Bridgestone Tire",
    brand: "Bridgestone",
    leadTime: "3-5 hari",
    status: "Aktif",
  },
  {
    name: "CV Mitra Ban Sejahtera",
    brand: "GT Radial",
    leadTime: "3-5 hari",
    status: "Aktif",
  },
  {
    name: "CV Velg Nusantara",
    brand: "SSW",
    leadTime: "3-5 hari",
    status: "Aktif",
  },
];

/* ------------------------------------------------------------------ */
/*  KPI, TARGET, & GRAFIK BULANAN                                     */
/* ------------------------------------------------------------------ */

export const kpis: Kpi[] = [
  {
    label: "Total Pendapatan",
    value: rupiah.format(SEED_TOTAL_REVENUE),
    change: "+12,5%",
    trend: "up",
    hint: "akumulasi tanggal 1-8",
    spark: dailyRevenue,
  },
  {
    label: "Unit Terjual",
    value: totalUnits.toString(),
    change: "+8,2%",
    trend: "up",
    hint: "unit tanggal 1-8",
    spark: dailyUnits,
  },
  {
    label: "Total Produk",
    value: PRODUCT_LOOKUP.size.toString(),
    change: "+2,1%",
    trend: "up",
    hint: "produk aktif",
    spark: [3, 3, 3, 3, 4, 4, 4],
  },
  {
    label: "Perlu Restock",
    value: stockItems
      .filter((item) => item.stock <= item.minStock)
      .length.toString(),
    change: "-1,5%",
    trend: "down",
    hint: "SKU di bawah batas",
    spark: [2, 2, 2, 1, 1, 1, 1],
  },
];

export const monthlyTarget = {
  label: "Target Penjualan",
  achieved: SEED_TOTAL_REVENUE,
  target: 50000000,
  percent: Math.round((SEED_TOTAL_REVENUE / 50000000) * 100),
};

export const monthlyPerformance = MONTH_LABELS.map((month, index) => ({
  month,
  revenue: index === SEED_MONTH ? SEED_TOTAL_REVENUE : 0,
  orders: index === SEED_MONTH ? transactions.length : 0,
  profit: index === SEED_MONTH ? Math.round(SEED_TOTAL_REVENUE * 0.17) : 0,
}));

export const revenueMonthly: RevenuePoint[] = monthlyPerformance.map(
  (month) => ({
    month: month.month,
    value: month.revenue,
  }),
);
