// lib/distribusi-data.ts
import { BAN_RING_OPTIONS } from "./ban-reference-data";

/* ------------------------------------------------------------------ */
/*  Tipe Data                                                         */
/* ------------------------------------------------------------------ */

export type DistribusiCategory = "Ban" | "Others";
export type DistribusiPayment = "Lunas" | "Bon" | "Tidak Lunas";

export const othersCategories = [
  "Velg",
  "Shock Absorber",
  "Per",
  "Coilover",
  "Cakram",
] as const;

export type OthersCategory = (typeof othersCategories)[number];

/** Data produk yang tersimpan di sistem */
export interface DistribusiItem {
  id: string;
  kategori: DistribusiCategory;
  namaBarang: string;
  subKategori: string;
  supplier: string;
  ukuran: string;
  ring: string;
  hargaModalAsli: number;
  hargaModalToko: number;
  stok: number;
  gambar: string;

  // Shared / meta
  tanggal?: string;
  pembayaran?: DistribusiPayment;
  jenisBarang?: string;
  owner?: string;
  paymentDate?: string;
  nomorBon?: string;
  notes?: string;

  // Ban
  merekBan?: string;
  typeBan?: string;
  ukuranTapak?: string;
  ukuranTinggi?: string;
  hargaTagihanToko?: number;

  // Velg / Others
  merekProduk?: string;
  kodeBarang?: string;
  typeVelg?: string;
  wide?: string;
  hole?: string;
  et?: string;
  colour?: string;
  item?: string;
  gtySet?: number;
  standarPrice?: number;
  discount?: number;
  dealerPrice?: number;
  dprice?: number;
  discountType?: string;
  rawPrice?: number;
  sswDisc?: number;
  sswDisc2?: number;
  rawPriceAfterDisc?: number;
  shippingFee?: number;
  shippingPerSet?: number;
  subTotalModalTP?: number;
  modal1Set?: number;
  paymentTipe?: string;
  up?: number;
  modalToko?: number;
  arrivalDate?: string;
  stockOwner?: string;
}

/** Nilai form input (semuanya berupa string) */
export interface DistribusiFormValues {
  kategori: DistribusiCategory;
  subKategori: string;
  namaBarang: string;
  ukuran: string;
  ring: string;
  hargaModalAsli: string;
  hargaModalToko: string;
  stok: string;
  gambar: string;
  supplier: string;

  // Shared / meta
  tanggal?: string;
  pembayaran?: DistribusiPayment;
  jenisBarang?: string;
  owner?: string;
  paymentDate?: string;
  nomorBon?: string;
  notes?: string;

  // Ban
  merekBan?: string;
  typeBan?: string;
  ukuranTapak?: string;
  ukuranTinggi?: string;
  hargaTagihanToko?: string;

  // Velg / Others
  merekProduk?: string;
  kodeBarang?: string;
  typeVelg?: string;
  wide?: string;
  hole?: string;
  et?: string;
  colour?: string;
  item?: string;
  gtySet?: string;
  standarPrice?: string;
  discount?: string;
  dealerPrice?: string;
  dprice?: string;
  discountType?: string;
  rawPrice?: string;
  sswDisc?: string;
  sswDisc2?: string;
  rawPriceAfterDisc?: string;
  shippingFee?: string;
  shippingPerSet?: string;
  subTotalModalTP?: string;
  modal1Set?: string;
  paymentTipe?: string;
  up?: string;
  modalToko?: string;
  arrivalDate?: string;
  stockOwner?: string;
}

/* ------------------------------------------------------------------ */
/*  Helper Functions                                                  */
/* ------------------------------------------------------------------ */

/** Membuat nama Ban otomatis: "Bridgestone Ecopia 195/65 R15" */
export function buildBanName(values: {
  merekBan?: string;
  typeBan?: string;
  ukuranTapak?: string;
  ukuranTinggi?: string;
  ring?: string;
}): string {
  const size =
    values.ukuranTapak || values.ukuranTinggi
      ? `${values.ukuranTapak ?? ""}/${values.ukuranTinggi ?? ""}`.replace(/^\/|\/$/g, "")
      : "";

  return [
    values.merekBan ?? "",
    values.typeBan ?? "",
    size,
    values.ring ?? "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

/** Membuat nama produk Others. Jika Velg, pakai kode item. */
export function buildOthersName(values: {
  subKategori: string;
  merekProduk?: string;
  typeVelg?: string;
  item?: string;
  ring?: string;
  namaBarang?: string;
}): string {
  if (values.subKategori === "Velg" && values.item) return values.item;

  const fallback = [
    values.merekProduk ?? "",
    values.typeVelg ?? "",
    values.ring ?? "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return values.namaBarang?.trim() || fallback || values.subKategori;
}

/** Membuat format kode item Velg: "SSW S280 18 9,5 6x139.7 25 BMC #Jan2601" */
export function buildVelgItemCode(values: {
  merekProduk?: string;
  typeVelg?: string;
  ring?: string;
  wide?: string;
  hole?: string;
  et?: string;
  colour?: string;
  tanggal?: string;
  seq?: string;
}): string {
  const merek = (values.merekProduk ?? "").toUpperCase().trim();
  const type = (values.typeVelg ?? "").trim();
  const ring = (values.ring ?? "").replace(/^R/i, "").trim();
  const wide = (values.wide ?? "").replace(".", ",").trim();
  const hole = (values.hole ?? "").trim();
  const et = (values.et ?? "").trim();
  const colour = (values.colour ?? "").toUpperCase().trim();

  let seq = "";
  if (values.seq) {
    seq = `#${values.seq}`;
  } else if (values.tanggal) {
    const d = new Date(values.tanggal);
    if (!Number.isNaN(d.getTime())) {
      const month = d.toLocaleDateString("en-US", { month: "short" });
      const day = String(d.getDate()).padStart(2, "0");
      seq = `#${month}${day}01`;
    }
  }

  return [merek, type, ring, wide, hole, et, colour, seq]
    .filter(Boolean)
    .join(" ")
    .trim();
}

/** Mengubah FormValues (string) menjadi DistribusiItem (number/objek siap simpan) */
export function formToItem(
  id: string,
  v: DistribusiFormValues,
): DistribusiItem {
  const isBan = v.kategori === "Ban";

  const namaBarang = isBan ? buildBanName(v) : buildOthersName(v);

  return {
    id,
    kategori: v.kategori,
    namaBarang,
    subKategori: isBan ? v.subKategori || v.merekBan || "Ban" : v.subKategori,
    supplier: v.supplier,
    ukuran: isBan
      ? `${v.ukuranTapak ?? ""}${v.ukuranTinggi ? `/${v.ukuranTinggi}` : ""}`.replace(/^\/|\/$/g, "")
      : v.ukuran,
    ring: v.ring,
    hargaModalAsli: Number(v.hargaModalAsli) || 0,
    hargaModalToko: Number(v.hargaModalToko) || 0,
    stok: Number(v.stok) || 0,
    gambar: v.gambar,

    tanggal: v.tanggal,
    pembayaran: v.pembayaran,
    jenisBarang: v.jenisBarang,
    owner: v.owner,
    paymentDate: v.paymentDate,
    nomorBon: v.nomorBon,
    notes: v.notes,

    ...(isBan
      ? {
          merekBan: v.merekBan,
          typeBan: v.typeBan,
          ukuranTapak: v.ukuranTapak,
          ukuranTinggi: v.ukuranTinggi,
          hargaTagihanToko: Number(v.hargaTagihanToko) || 0,
        }
      : {
          merekProduk: v.merekProduk,
          kodeBarang: v.kodeBarang,
          typeVelg: v.typeVelg,
          wide: v.wide,
          hole: v.hole,
          et: v.et,
          colour: v.colour,
          item: v.item,
          gtySet: Number(v.gtySet) || 0,
          standarPrice: Number(v.standarPrice) || 0,
          discount: Number(v.discount) || 0,
          dealerPrice: Number(v.dealerPrice) || 0,
          dprice: Number(v.dprice) || 0,
          discountType: v.discountType,
          rawPrice: Number(v.rawPrice) || 0,
          sswDisc2: Number(v.sswDisc2) || 0,
          rawPriceAfterDisc: Number(v.rawPriceAfterDisc) || 0,
          shippingFee: Number(v.shippingFee) || 0,
          shippingPerSet: Number(v.shippingPerSet) || 0,
          subTotalModalTP: Number(v.subTotalModalTP) || 0,
          modal1Set: Number(v.modal1Set) || 0,
          paymentTipe: v.paymentTipe,
          up: Number(v.up) || 0,
          modalToko: Number(v.modalToko) || 0,
          arrivalDate: v.arrivalDate,
          stockOwner: v.stockOwner,
        }),
  };
}

/* ------------------------------------------------------------------ */
/*  SEED DATA (Database Awal)                                         */
/* ------------------------------------------------------------------ */

// 1. DATA BAN
export const initialBanItems: DistribusiItem[] = [
  {
    id: "WK-8001",
    kategori: "Ban",
    namaBarang: "Bridgestone Ecopia 195/65 R15",
    subKategori: "Bridgestone",
    supplier: "PT Bridgestone Tire",
    ukuran: "195/65",
    ring: "R15",
    hargaModalAsli: 850000,
    hargaModalToko: 1050000,
    stok: 24,
    gambar: "",
    tanggal: "2026-01-10",
    pembayaran: "Lunas",
    jenisBarang: "Ban Tubeless",
    owner: "Budi",
    paymentDate: "2026-01-11",
    nomorBon: "BON-2601-101",
    notes: "Stok awal ban",
    merekBan: "Bridgestone",
    typeBan: "Ecopia",
    ukuranTapak: "195",
    ukuranTinggi: "65",
    hargaTagihanToko: 1050000,
  },
  {
    id: "WK-8002",
    kategori: "Ban",
    namaBarang: "Michelin Pilot Sport 225/45 R18",
    subKategori: "Michelin",
    supplier: "PT Michelin Indonesia",
    ukuran: "225/45",
    ring: "R18",
    hargaModalAsli: 1500000,
    hargaModalToko: 1800000,
    stok: 10,
    gambar: "",
    tanggal: "2026-01-15",
    pembayaran: "Lunas",
    jenisBarang: "Ban Tubeless",
    owner: "Budi",
    paymentDate: "2026-01-15",
    nomorBon: "BON-2601-102",
    notes: "Stok ban sport",
    merekBan: "Michelin",
    typeBan: "Pilot Sport",
    ukuranTapak: "225",
    ukuranTinggi: "45",
    hargaTagihanToko: 1800000,
  },
];

// 2. DATA OTHERS
export const initialOthersItems: DistribusiItem[] = [
  {
    id: "WK-9001",
    kategori: "Others",
    namaBarang: "SSW S280 18 9,5 6x139.7 25 BMC #Jan2601",
    subKategori: "Velg",
    supplier: "PT Velg Nusantara",
    ukuran: "PCD 6x139.7",
    ring: "R18",
    hargaModalAsli: 2400000,
    hargaModalToko: 2950000,
    stok: 12,
    gambar: "",
    merekProduk: "SSW",
    kodeBarang: "SSW-S280-18",
    typeVelg: "S280",
    wide: "9,5",
    hole: "6x139.7",
    et: "25",
    colour: "BMC",
    item: "SSW S280 18 9,5 6x139.7 25 BMC #Jan2601",
    gtySet: 4,
    standarPrice: 3200000,
    discount: 5,
    dealerPrice: 2950000,
    dprice: 2900000,
    discountType: "Cash",
    rawPrice: 3000000,
    sswDisc2: 2,
    rawPriceAfterDisc: 2940000,
    shippingFee: 150000,
    shippingPerSet: 37500,
    subTotalModalTP: 2550000,
    modal1Set: 2475000,
    paymentTipe: "Transfer",
    up: 2950000,
    modalToko: 2550000,
    arrivalDate: "2026-01-15",
    stockOwner: "Gudang Pusat",
    tanggal: "2026-01-26",
    pembayaran: "Lunas",
    jenisBarang: "Velg",
    owner: "Budi",
    paymentDate: "2026-01-27",
    nomorBon: "BON-2601-001",
    notes: "Stok awal velg racing",
  },
  {
    id: "WK-9002",
    kategori: "Others",
    namaBarang: "KYB Shock Absorber Belakang",
    subKategori: "Shock Absorber",
    supplier: "PT Kayaba Indonesia",
    ukuran: "-",
    ring: "",
    hargaModalAsli: 420000,
    hargaModalToko: 550000,
    stok: 5,
    gambar: "",
    merekProduk: "KYB",
    tanggal: "2026-01-20",
    pembayaran: "Bon",
    jenisBarang: "Shock Absorber",
    owner: "Andi",
    paymentDate: "2026-02-10",
    nomorBon: "BON-2601-002",
    notes: "Tempo 30 hari",
  },
];

// 3. GABUNGAN SEMUA DATA
export const initialDistribusiItems: DistribusiItem[] = [
  ...initialBanItems,
  ...initialOthersItems,
];