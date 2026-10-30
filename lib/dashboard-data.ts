import { suppliers as supplierRecords } from "./master-data";
import {
  monthlyPerformance,
  profitRows,
  selloutEntries,
  stockListRecords,
} from "./operations-data";

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
  "Mobil" | "Motor" | "SUV" | "Truk" | "Velg" | "Aksesori";

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

const brandPrefixes = [
  "GT Radial",
  "Bridgestone",
  "Michelin",
  "BFGoodrich",
  "HRE",
  "Rays",
  "Vossen",
];

function splitProductName(product: string) {
  const brand =
    brandPrefixes.find((prefix) => product.startsWith(prefix)) ??
    product.split(" ")[0];

  const name = product.slice(brand.length).trim();

  return { brand, name: name.length > 0 ? name : product };
}

function brandFromSupplier(name: string) {
  if (name.includes("Michelin")) return "Michelin";

  if (name.includes("Bridgestone")) return "Bridgestone";

  if (name.includes("Mitra")) return "GT Radial";

  if (name.includes("Velg")) return "Velg Nusantara";

  return name.replace(/^PT |^CV /, "");
}

function stockCategory(item: string): TireCategory {
  if (item === "Velg") return "Velg";

  if (item === "Aksesori") return "Aksesori";

  return "Mobil";
}

function percentage(value: number) {
  return `${value.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

const latestMonth = monthlyPerformance[monthlyPerformance.length - 1];

const previousMonth = monthlyPerformance[monthlyPerformance.length - 2];

const revenueChange =
  ((latestMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;

const orderChange =
  ((latestMonth.orders - previousMonth.orders) / previousMonth.orders) * 100;

const totalUnitsSold = selloutEntries.reduce(
  (sum, entry) => sum + entry.qty,
  0,
);

const totalStock = stockListRecords.reduce(
  (sum, record) => sum + record.qty,
  0,
);

const restockCount = stockListRecords.filter(
  (record) => record.qty <= 10,
).length;

const stockChange = -((restockCount / stockListRecords.length) * 100);

const revenueSpark = monthlyPerformance.map((month) =>
  Math.round(month.revenue / 1_000_000),
);

const profitSpark = monthlyPerformance.map((month) =>
  Math.round(month.profit / 1_000_000),
);

export const kpis: Kpi[] = [
  {
    label: "Total Pendapatan",
    value: `Rp ${compactRupiah.format(latestMonth.revenue)}`,
    change: `${revenueChange >= 0 ? "+" : ""}${percentage(revenueChange)}`,
    trend: revenueChange >= 0 ? "up" : "down",
    hint: "dibanding bulan lalu",
    spark: revenueSpark,
  },
  {
    label: "Unit Terjual",
    value: totalUnitsSold.toLocaleString("id-ID"),
    change: `${orderChange >= 0 ? "+" : ""}${percentage(orderChange)}`,
    trend: orderChange >= 0 ? "up" : "down",
    hint: "unit bulan ini",
    spark: profitSpark,
  },
  {
    label: "Stok Tersedia",
    value: totalStock.toLocaleString("id-ID"),
    change: `${stockChange >= 0 ? "+" : ""}${percentage(stockChange)}`,
    trend: stockChange >= 0 ? "up" : "down",
    hint: "unit di gudang",
    spark: revenueSpark.slice().reverse(),
  },
  {
    label: "Perlu Restock",
    value: restockCount.toString(),
    change: `${restockCount} SKU`,
    trend: "down",
    hint: "di bawah batas aman",
    spark: [1, 2, 1, 3, 2, restockCount],
  },
];

export const revenueMonthly: RevenuePoint[] = monthlyPerformance.map(
  (month) => ({
    month: month.month,
    value: Math.round(month.revenue / 1_000_000),
  }),
);

const categoryTotals = selloutEntries.reduce((groups, entry) => {
  const revenue = entry.qty * entry.unitPrice;
  const current = groups.get(entry.category) ?? { revenue: 0, qty: 0 };
  current.revenue += revenue;
  current.qty += entry.qty;
  groups.set(entry.category, current);

  return groups;
}, new Map<string, { revenue: number; qty: number }>());

const categoryRevenue = Array.from(categoryTotals.values()).reduce(
  (sum, value) => sum + value.revenue,
  0,
);

export const categorySlices: CategorySlice[] = Array.from(
  categoryTotals.entries(),
)
  .map(([label, value], index) => ({
    label,
    value: Math.round(value.revenue / 1_000_000),
    percent: Math.round((value.revenue / categoryRevenue) * 100),
    color: `var(--chart-${(index % 5) + 1})`,
  }))
  .sort((a, b) => b.value - a.value);

const soldByProduct = selloutEntries.reduce((map, entry) => {
  map.set(entry.product, (map.get(entry.product) ?? 0) + entry.qty);

  return map;
}, new Map<string, number>());

export const stockItems: StockItem[] = stockListRecords.map((record) => {
  const { brand, name } = splitProductName(record.namaProduk);

  return {
    id: record.id,
    name,
    brand,
    size: `${record.hole} ${record.ring}`.trim(),
    category: stockCategory(record.item),
    price: record.hargaJual,
    stock: record.qty,
    minStock: 10,
    sold: soldByProduct.get(record.namaProduk) ?? 0,
  };
});

const transactionTimes = ["10:24", "09:58", "09:41", "09:12", "08:47"];

const methodMap = {
  Cash: "Tunai",
  Transfer: "Transfer",
  QRIS: "QRIS",
  Tempo: "Transfer",
} satisfies Record<string, PaymentMethod>;

export const transactions: Transaction[] = selloutEntries
  .slice(-5)
  .reverse()
  .map((entry, index) => ({
    id: entry.invoice,
    customer: entry.customer,
    items: entry.qty,
    total: entry.qty * entry.unitPrice,
    status: entry.status === "Lunas" ? "Lunas" : "Proses",
    method: methodMap[entry.payment],
    time: transactionTimes[index] ?? "08:00",
  }));

export const topProducts: TopProduct[] = profitRows
  .slice()
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 4)
  .map((row) => {
    const { brand, name } = splitProductName(row.product);

    return {
      name,
      brand,
      sold: row.qty,
      revenue: row.revenue,
      share: Math.round((row.profit / row.revenue) * 100),
    };
  });

export const customers: Customer[] = Array.from(
  selloutEntries.reduce((groups, entry) => {
    const current = groups.get(entry.customer) ?? {
      name: entry.customer,
      orders: 0,
      spend: 0,
    };

    current.orders += 1;
    current.spend += entry.qty * entry.unitPrice;
    groups.set(entry.customer, current);

    return groups;
  }, new Map<string, { name: string; orders: number; spend: number }>()),
)
  .map(([, value]) => {
    const words = value.name.split(" ");

    const initials = words
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();

    const type = value.name.includes("Toko")
      ? "Reseller"
      : value.name.includes("Bengkel")
        ? "Bengkel"
        : value.name.includes("Komunitas") || value.name.includes("Club")
          ? "Komunitas"
          : "Perorangan";

    return {
      name: value.name,
      type,
      orders: value.orders,
      spend: value.spend,
      initials,
    };
  })
  .sort((a, b) => b.spend - a.spend)
  .slice(0, 4);

export const suppliers: Supplier[] = supplierRecords.map((supplier) => ({
  name: supplier.name,
  brand: brandFromSupplier(supplier.name),
  leadTime: "3-5 hari",
  status: "Aktif",
}));

const target = Math.ceil(latestMonth.revenue / 10_000_000) * 10_000_000;

const monthLabel = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
}).format(new Date(2026, 5, 1));

export const monthlyTarget = {
  label: `Target Penjualan ${monthLabel}`,
  achieved: latestMonth.revenue,
  target,
  percent: Math.round((latestMonth.revenue / target) * 100),
};
