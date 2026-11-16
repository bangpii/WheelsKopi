import { storeNames } from "./master-data";
import { othersRecords, type OthersRecord } from "./operations-data";

// PERBAIKAN 1: Tambahkan "Sorted" ke tipe kategori
export type PurchaseOrderCategory = "Ban" | "Others" | "Sorted";

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
  status: "Draft" | "Pending" | "Completed";
  /** true bila barang sudah diterima & stok/finance sudah diproses. */
  received?: boolean;
}

export function buildSeedPurchaseOrders(): PurchaseOrderDetail[] {
  return othersRecords.map((record, index) => {
    // PERBAIKAN 2: Deteksi kategori dengan lebih aman (termasuk Sorted)
    let category: PurchaseOrderCategory = "Others";
    if (record.item === "Ban") {
      category = "Ban";
    } else if (record.item === "Sorted") {
      category = "Sorted";
    }

    return {
      ...record,
      number: `PO-${record.nomorBon}`,
      category,
      deliverTo: index % 2 === 0 ? storeNames[0] : storeNames[1] ?? storeNames[0],
      invoiceNumber: `INV-PO-${record.nomorBon}`,
      rawPriceAfterDisc: Math.round(record.rawPrice * (1 - record.sswDisc / 100)),
      additionalDiscount: 0,
      cashbackPercent: 0,
      status: "Completed",
      // Seed dianggap sudah diterima agar tidak menambah stok dua kali.
      received: true,
    };
  });
}