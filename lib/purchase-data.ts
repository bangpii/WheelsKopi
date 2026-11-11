import { storeNames } from "./master-data";
import { othersRecords, type OthersRecord } from "./operations-data";

export type PurchaseOrderCategory = "Ban" | "Others";

/**
 * Satu baris Purchase Order. Dibangun dari seed `othersRecords`, lalu
 * disimpan di DataContext supaya halaman Purchase Order dan Receipt PO
 * membaca sumber data yang sama.
 */
export interface PurchaseOrderDetail extends OthersRecord {
  /** Nomor PO, dipakai Receipt PO untuk memilih PO. */
  number: string;
  category: PurchaseOrderCategory;
  deliverTo: string;
  invoiceNumber: string;
  rawPriceAfterDisc: number;
  additionalDiscount: number;
  cashbackPercent: number;
  status: "Draft" | "Completed";
  /** true bila stok sudah pernah ditambahkan dari PO ini. */
  received?: boolean;
}

export function buildSeedPurchaseOrders(): PurchaseOrderDetail[] {
  return othersRecords.map((record, index) => ({
    ...record,
    number: `PO-${record.nomorBon}`,
    category: record.item === "Ban" ? "Ban" : "Others",
    deliverTo: index % 2 === 0 ? storeNames[0] : storeNames[1] ?? storeNames[0],
    invoiceNumber: `INV-PO-${record.nomorBon}`,
    rawPriceAfterDisc: Math.round(record.rawPrice * (1 - record.sswDisc / 100)),
    additionalDiscount: 0,
    cashbackPercent: 0,
    status: "Completed",
    // Seed dianggap sudah diterima agar tidak menambah stok dua kali.
    received: true,
  }));
}
