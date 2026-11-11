import type { Product } from "@/lib/context/data-context";
import { ledgerFromRecord, ledgerTotals } from "@/lib/finance-store";
import type { PurchaseOrderDetail } from "@/lib/purchase-data";
import type {
  FinanceLedgerEntry,
  FinanceLedgerType,
  FinanceStoreDayRecord,
  SelloutRecord,
} from "@/lib/transaction-data";

/**
 * Membuat satu entri ledger Finance Store.
 */
export function makeLedgerEntry(
  type: FinanceLedgerType,
  ref: string,
  description: string,
  amount: number,
  source: string,
): FinanceLedgerEntry {
  return {
    id: `LED-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    ref,
    description,
    amount,
    source,
  };
}

interface UpsertFinanceParams {
  store: string;
  date: string;
  entries: FinanceLedgerEntry[];
}

/**
 * Menambahkan entri ke Finance Store untuk kombinasi store + tanggal.
 * Jika belum ada record hari itu, record baru dibuat. Hari yang sudah
 * ditutup (Closed) tidak diubah.
 */
export function upsertFinanceLedger(
  records: FinanceStoreDayRecord[],
  params: UpsertFinanceParams,
): FinanceStoreDayRecord[] {
  if (params.entries.length === 0) return records;

  const existing = records.find(
    (row) => row.store === params.store && row.date === params.date,
  );

  if (existing) {
    if (existing.status === "Closed") return records;

    const ledger = [...ledgerFromRecord(existing), ...params.entries];
    const totals = ledgerTotals(ledger);

    return records.map((row) =>
      row.id === existing.id
        ? {
            ...row,
            payments: totals.payments,
            purchases: totals.purchases,
            sales: totals.sales,
            spends: totals.spends,
            remainder: totals.remainder,
            ledger,
            details: ledger
              .flatMap((entry) => (entry.description ? [entry.description] : []))
              .join("; "),
          }
        : row,
    );
  }

  const totals = ledgerTotals(params.entries);
  const record: FinanceStoreDayRecord = {
    id: `FS-${Date.now()}-${params.store}`,
    store: params.store,
    date: params.date,
    payments: totals.payments,
    purchases: totals.purchases,
    sales: totals.sales,
    spends: totals.spends,
    remainder: totals.remainder,
    details: params.entries
      .map((entry) => entry.description)
      .filter(Boolean)
      .join("; "),
    ledger: params.entries,
    status: "Open",
    createdAt: new Date().toLocaleDateString("id-ID"),
  };

  return [record, ...records];
}

function productFromPurchaseOrder(po: PurchaseOrderDetail): Product {
  const id = po.kodeBarang.trim() || `PO-${Date.now()}`;
  const isBan = po.category === "Ban";

  return {
    id,
    kategori: po.category,
    namaBarang: po.item || po.kodeBarang || po.number,
    subKategori: isBan ? po.merek || "Ban" : po.item || "Others",
    supplier: po.supplier,
    ukuran: [po.wide, po.hole].filter(Boolean).join("/"),
    ring: po.ring,
    hargaModalAsli: po.modalPerSet || po.rawPrice || 0,
    hargaModalToko: po.modalToko || po.modalPerSet || 0,
    standarPrice: po.standarPrice || 0,
    stok: po.qty,
    gambar: "",
    merekBan: isBan ? po.merek : undefined,
    typeBan: isBan ? po.type : undefined,
    ukuranTapak: isBan ? po.wide : undefined,
    ukuranTinggi: isBan ? po.hole : undefined,
    merekProduk: isBan ? undefined : po.merek,
    kodeBarang: po.kodeBarang,
    typeVelg: isBan ? undefined : po.type,
    wide: po.wide,
    hole: po.hole,
    et: po.et,
    item: po.item,
    discount: po.discount,
    dealerPrice: po.dealerPrice,
    rawPrice: po.rawPrice,
    sswDisc: po.sswDisc,
    rawPriceAfterDisc: po.rawPriceAfterDisc,
    shippingFee: po.shippingFee,
    subTotalModalTP: po.subTotal,
    modal1Set: po.modalPerSet,
    up: po.up,
    modalToko: po.modalToko,
    arrivalDate: po.arrivalDate,
    stockOwner: po.stockOwner,
    nomorBon: po.nomorBon,
    notes: po.notes,
    kategoriUtama: po.category,
    history: [
      `[${new Date().toLocaleString("id-ID")}] Dibuat dari ${po.number}`,
    ],
  };
}

/**
 * Menambahkan stok produk dari PO yang belum pernah diterima.
 * Jika produk belum ada di master, produk baru dibuat dari data PO.
 */
export function applyPurchaseOrderToStock(
  products: Product[],
  po: PurchaseOrderDetail,
): Product[] {
  if (po.received) return products;

  const code = po.kodeBarang.trim().toLowerCase();
  const name = po.item.trim().toLowerCase();
  const match = products.find(
    (product) =>
      (code && product.id.toLowerCase() === code) ||
      (name && product.namaBarang.toLowerCase() === name) ||
      (code && product.kodeBarang?.toLowerCase() === code),
  );

  if (!match) {
    return [productFromPurchaseOrder(po), ...products];
  }

  return products.map((product) =>
    product.id === match.id
      ? {
          ...product,
          stok: product.stok + po.qty,
          hargaModalToko: po.modalToko || product.hargaModalToko,
          hargaModalAsli: po.modalPerSet || product.hargaModalAsli,
        }
      : product,
  );
}

/**
 * Mengembalikan stok yang sudah dikurangi saat sellout dihapus.
 */
export function restoreSelloutStock(
  products: Product[],
  sellout: SelloutRecord,
): Product[] {
  return products.map((product) => {
    const line = sellout.items.find((item) => item.productId === product.id);

    return line ? { ...product, stok: product.stok + line.qty } : product;
  });
}

/**
 * Entri finance saat invoice diterbitkan: penjualan dan pembayaran.
 */
export function invoiceFinanceEntries(
  sellout: SelloutRecord,
  grandTotal: number,
): FinanceLedgerEntry[] {
  const reference = `INV-${sellout.number}`;

  return [
    makeLedgerEntry(
      "sales",
      reference,
      `Penjualan ${sellout.number} - ${sellout.customer}`,
      grandTotal,
      "Sales",
    ),
    makeLedgerEntry(
      "payment",
      reference,
      `Pembayaran ${sellout.customer} (${sellout.paymentMethod ?? "Transfer"})`,
      grandTotal,
      sellout.paymentMethod ?? "Transfer",
    ),
  ];
}

/**
 * Entri finance saat Daily Spend disimpan.
 */
export function dailySpendFinanceEntry(
  spendId: string,
  description: string,
  total: number,
): FinanceLedgerEntry {
  return makeLedgerEntry(
    "spend",
    spendId,
    description || "Pengeluaran harian toko",
    total,
    "Daily Spend",
  );
}

/**
 * Entri finance saat PO diterima/di-complete.
 */
export function purchaseFinanceEntry(
  po: PurchaseOrderDetail,
): FinanceLedgerEntry {
  const amount = po.subTotal || po.modalToko * po.qty || po.totalPrice;

  return makeLedgerEntry(
    "purchase",
    po.number,
    `Pembelian ${po.item || po.kodeBarang} (${po.supplier})`,
    amount,
    po.supplier,
  );
}
