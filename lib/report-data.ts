import type { DistribusiItem } from "./distribusi-data";
import type { SelloutRecord } from "./transaction-data";

const MONTH_SHORT = [
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

export interface ReportDay {
  key: string;
  label: string;
  revenue: number;
  cogs: number;
  profit: number;
  orders: number;
  qty: number;
}

export interface ReportStore {
  store: string;
  revenue: number;
  qty: number;
  orders: number;
}

export interface ReportCategory {
  category: string;
  revenue: number;
  cogs: number;
  profit: number;
  qty: number;
}

export interface ReportProduct {
  id: string;
  product: string;
  category: string;
  store: string;
  qty: number;
  revenue: number;
  cogs: number;
  profit: number;
}

export interface ReportData {
  revenue: number;
  cogs: number;
  profit: number;
  orders: number;
  qty: number;
  days: ReportDay[];
  stores: ReportStore[];
  categories: ReportCategory[];
  products: ReportProduct[];
}

function dayLabel(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value;
  }

  return `${match[3]} ${MONTH_SHORT[Number(match[2]) - 1]}`;
}

function categoryOf(product: DistribusiItem | undefined): string {
  if (!product) {
    return "Lain-lain";
  }

  return product.kategori === "Ban" ? "Ban" : product.subKategori || "Lain-lain";
}

export function buildReportData(
  sellouts: SelloutRecord[],
  products: DistribusiItem[],
): ReportData {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const days = new Map<string, ReportDay>();
  const stores = new Map<string, ReportStore>();
  const categories = new Map<string, ReportCategory>();
  const productRows = new Map<string, ReportProduct>();

  let revenue = 0;
  let cogs = 0;
  let orders = 0;
  let qty = 0;

  for (const sellout of sellouts) {
    const dateKey = sellout.dateISO ?? sellout.date;
    const day = days.get(dateKey) ?? {
      key: dateKey,
      label: dayLabel(dateKey),
      revenue: 0,
      cogs: 0,
      profit: 0,
      orders: 0,
      qty: 0,
    };
    const store = stores.get(sellout.store) ?? {
      store: sellout.store,
      revenue: 0,
      qty: 0,
      orders: 0,
    };

    const soldQty = sellout.items.reduce((sum, item) => sum + item.qty, 0);
    const itemBase = sellout.items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0,
    );
    const factor = itemBase > 0 ? sellout.total / itemBase : 0;

    day.revenue += sellout.total;
    day.orders += 1;
    day.qty += soldQty;
    store.revenue += sellout.total;
    store.orders += 1;
    store.qty += soldQty;
    revenue += sellout.total;
    orders += 1;
    qty += soldQty;

    let dayCogs = 0;

    if (sellout.items.length === 0) {
      const key = `Lain-lain::${sellout.store}`;
      const row = productRows.get(key) ?? {
        id: key,
        product: "Lain-lain",
        category: "Lain-lain",
        store: sellout.store,
        qty: 0,
        revenue: 0,
        cogs: 0,
        profit: 0,
      };
      const category = categories.get("Lain-lain") ?? {
        category: "Lain-lain",
        revenue: 0,
        cogs: 0,
        profit: 0,
        qty: 0,
      };

      row.revenue += sellout.total;
      row.profit += sellout.total;
      category.revenue += sellout.total;
      category.profit += sellout.total;
      productRows.set(key, row);
      categories.set("Lain-lain", category);
      days.set(dateKey, day);
      stores.set(sellout.store, store);
      continue;
    }

    for (const item of sellout.items) {
      const product = productMap.get(item.productId);
      const itemRevenue = Math.round(item.qty * item.price * factor);
      const itemCogs = Math.round(
        item.qty * (product?.hargaModalAsli ?? item.price * 0.8),
      );
      const itemProfit = itemRevenue - itemCogs;
      const categoryName = categoryOf(product);
      const key = `${item.productId}::${sellout.store}`;

      const row = productRows.get(key) ?? {
        id: key,
        product: product?.namaBarang ?? item.name,
        category: categoryName,
        store: sellout.store,
        qty: 0,
        revenue: 0,
        cogs: 0,
        profit: 0,
      };
      const category = categories.get(categoryName) ?? {
        category: categoryName,
        revenue: 0,
        cogs: 0,
        profit: 0,
        qty: 0,
      };

      row.qty += item.qty;
      row.revenue += itemRevenue;
      row.cogs += itemCogs;
      row.profit += itemProfit;
      category.qty += item.qty;
      category.revenue += itemRevenue;
      category.cogs += itemCogs;
      category.profit += itemProfit;
      productRows.set(key, row);
      categories.set(categoryName, category);

      dayCogs += itemCogs;
      cogs += itemCogs;
    }

    day.cogs += dayCogs;
    days.set(dateKey, day);
    stores.set(sellout.store, store);
  }

  const dayRows = Array.from(days.values())
    .map((day) => ({
      ...day,
      profit: day.revenue - day.cogs,
    }))
    .sort((a, b) => a.key.localeCompare(b.key));

  return {
    revenue,
    cogs,
    profit: revenue - cogs,
    orders,
    qty,
    days: dayRows,
    stores: Array.from(stores.values()).sort((a, b) => b.revenue - a.revenue),
    categories: Array.from(categories.values()).sort(
      (a, b) => b.revenue - a.revenue,
    ),
    products: Array.from(productRows.values()).sort(
      (a, b) => b.profit - a.profit,
    ),
  };
}
