import type { PaymentMethod, Transaction } from "./dashboard-data";
import { transactions as seedTransactions } from "./dashboard-data";
import { initialDistribusiItems } from "./distribusi-data";
import { storeNames } from "./master-data";
import type {
  DailySpendItemRecord,
  FinanceLedgerEntry,
  FinanceStoreDayRecord,
  MovementRecord,
  SelloutRecord,
  SelloutStatus,
  TradeRecord,
} from "./transaction-data";

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

export const SEED_DAYS = [1, 2, 3, 4, 5, 6, 7, 8];

const seedNow = new Date();
const seedYear = seedNow.getFullYear();
const seedMonth = seedNow.getMonth();

export function seedISO(day: number): string {
  return `${seedYear}-${String(seedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function seedDisplay(day: number): string {
  return `${String(day).padStart(2, "0")} ${MONTH_SHORT[seedMonth]} ${seedYear}`;
}

function displayISO(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day} ${MONTH_SHORT[Number(month) - 1]} ${year}`;
}

const productMap = new Map(
  initialDistribusiItems.map((product) => [product.id, product]),
);

const CAR_PLATES = [
  { car: "Toyota Avanza", plate: "BK 1201 AB" },
  { car: "Honda CR-V", plate: "BK 1202 CD" },
  { car: "Mitsubishi Pajero Sport", plate: "BK 1203 EF" },
  { car: "BMW 320i", plate: "BK 1204 GH" },
  { car: "Toyota Fortuner", plate: "BK 1205 IJ" },
  { car: "Daihatsu Xenia", plate: "BK 1206 KL" },
  { car: "Isuzu Panther", plate: "BK 1207 MN" },
  { car: "Honda Brio", plate: "BK 1208 OP" },
];

const SELLOUT_STATUS: Record<string, SelloutStatus> = {
  "INV-D02-01": "Siap Invoice",
  "INV-D05-02": "Menunggu Approval",
  "INV-D07-01": "Siap Invoice",
};

function selloutRecord(trx: Transaction, index: number): SelloutRecord {
  const vehicle = CAR_PLATES[index % CAR_PLATES.length];
  const items = (trx.lines ?? []).map((line) => {
    const product = productMap.get(line.productId);
    return {
      productId: line.productId,
      name: product?.namaBarang ?? line.productId,
      qty: line.qty,
      price: product?.hargaModalToko ?? 0,
    };
  });

  return {
    id: `SL-${trx.id}`,
    number: `SO-${String(seedTransactions.length - index).padStart(4, "0")}`,
    date: trx.tanggal ? displayISO(trx.tanggal) : seedDisplay(1),
    dateISO: trx.tanggal,
    time: trx.time,
    paymentMethod: trx.method,
    customer: trx.customer,
    description: "Penjualan harian",
    car: vehicle.car,
    licensePlate: vehicle.plate,
    store: storeNames[index % Math.max(1, storeNames.length)],
    items,
    total: trx.total,
    status: SELLOUT_STATUS[trx.id] ?? "Sudah Invoice",
    createdAt: trx.tanggal ? displayISO(trx.tanggal) : seedDisplay(1),
  };
}

export const seedSellouts: SelloutRecord[] = seedTransactions.map(
  selloutRecord,
);

function normalizePaymentMethod(method?: string): PaymentMethod {
  const value = (method ?? "").toLowerCase();

  if (value.includes("qris") || value.includes("shopee") || value.includes("ovo")) {
    return "QRIS";
  }
  if (value.includes("cash") || value.includes("tunai")) {
    return "Tunai";
  }
  return "Transfer";
}

export function selloutToTransaction(row: SelloutRecord): Transaction {
  const items = row.items.reduce((sum, item) => sum + item.qty, 0);

  return {
    id: row.number,
    customer: row.customer,
    items,
    total: row.total,
    status: row.status === "Sudah Invoice" ? "Lunas" : "Proses",
    method: normalizePaymentMethod(row.paymentMethod),
    time: row.time ?? "09:00",
    tanggal: row.dateISO ?? row.date,
    date: row.dateISO ?? row.date,
    createdAt: row.dateISO ?? row.createdAt,
    lines: row.items.map((item) => ({
      productId: item.productId,
      qty: item.qty,
    })),
  };
}

export const seedMovements: MovementRecord[] = SEED_DAYS.slice()
  .reverse()
  .map((day, index) => {
    const product = initialDistribusiItems[index % initialDistribusiItems.length];

    return {
      id: `MV-SEED-${day}`,
      number: `MV-${String(SEED_DAYS.length - index).padStart(4, "0")}`,
      date: seedDisplay(day),
      sourceStore: storeNames[index % Math.max(1, storeNames.length)],
      destinationStore:
        storeNames[(index + 1) % Math.max(1, storeNames.length)],
      items: [
        {
          productId: product.id,
          name: product.namaBarang,
          qty: (index % 3) + 1,
        },
      ],
      createdAt: seedDisplay(day),
    };
  });

const SPEND_CATEGORIES = [
  "Operasional",
  "Listrik & Air",
  "Marketing",
  "Lain-lain",
];

const SPEND_DESCRIPTIONS = [
  "Bensin operasional",
  "Token listrik toko",
  "Cetak brosur promosi",
  "Konsumsi rapat",
  "Perawatan peralatan",
  "Air minum kantor",
  "Iklan media sosial",
  "Perlengkapan kebersihan",
];

export const seedDailySpends: DailySpendItemRecord[] = SEED_DAYS.slice()
  .reverse()
  .map((day, index) => {
    const amount = 150_000 + index * 25_000;
    const spooring = 200_000 + index * 10_000;
    const cut = spooring * 0.3;

    return {
      id: `DS-SEED-${day}`,
      date: seedDisplay(day),
      dateISO: seedISO(day),
      store: storeNames[index % Math.max(1, storeNames.length)],
      description: SPEND_DESCRIPTIONS[index % SPEND_DESCRIPTIONS.length],
      category: SPEND_CATEGORIES[index % SPEND_CATEGORIES.length],
      amount,
      spooring,
      salary: 0,
      total: amount - cut,
      status: "Approved",
      createdAt: seedDisplay(day),
      history: [`Dibuat pada ${seedDisplay(day)}`],
    };
  });

export const seedTrades: TradeRecord[] = [8, 6, 4, 2].map((day, index) => {
  const product = initialDistribusiItems[index % initialDistribusiItems.length];

  return {
    id: `TT-SEED-${day}`,
    store: storeNames[index % Math.max(1, storeNames.length)],
    date: seedDisplay(day),
    bonNumber: `BON-TT-${String(index + 1).padStart(3, "0")}`,
    product: product.namaBarang,
    price: product.hargaModalToko,
    notes: index % 2 === 0 ? "Tukar tambah ban lama" : "Trade in velg",
    status: index % 2 === 0 ? "Available" : "Sold",
  };
});

function ledgerEntry(
  id: string,
  type: FinanceLedgerEntry["type"],
  ref: string,
  description: string,
  amount: number,
  source: string,
): FinanceLedgerEntry {
  return { id, type, ref, description, amount, source };
}

export const seedFinanceStores: FinanceStoreDayRecord[] = SEED_DAYS.slice()
  .reverse()
  .map((day) => {
    const dateISO = seedISO(day);
    const daySales = seedTransactions
      .filter((trx) => trx.tanggal === dateISO)
      .reduce((sum, trx) => sum + trx.total, 0);
    const payments = Math.round(daySales * 0.6);
    const purchases = 1_500_000;
    const spends = 350_000;
    const sales = daySales;
    const adjustment = 0;
    const ledger = [
      ledgerEntry(
        `FIN-D${day}-PAY`,
        "payment",
        `PAY-D${day}`,
        "Penerimaan pembayaran customer",
        payments,
        "Kasir",
      ),
      ledgerEntry(
        `FIN-D${day}-PUR`,
        "purchase",
        `PO-D${day}`,
        "Pembelian stok ban dan velg",
        purchases,
        "Supplier",
      ),
      ledgerEntry(
        `FIN-D${day}-SAL`,
        "sales",
        `INV-D${day}`,
        "Penjualan invoice harian",
        sales,
        "Sales",
      ),
      ledgerEntry(
        `FIN-D${day}-SPD`,
        "spend",
        `DS-D${day}`,
        "Pengeluaran operasional toko",
        spends,
        "Daily Spend",
      ),
    ];

    return {
      id: `FIN-SEED-${day}`,
      store: storeNames[0],
      date: seedDisplay(day),
      payments,
      purchases,
      sales,
      spends,
      remainder: payments - purchases - spends + adjustment,
      details: "Pembukuan harian toko",
      ledger,
      status: "Open",
      createdAt: seedDisplay(day),
    };
  });
