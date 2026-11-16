// lib/distribusi-data.ts

/* ------------------------------------------------------------------ */
/*  Tipe Data                                                         */
/* ------------------------------------------------------------------ */

export type DistribusiCategory = "Ban" | "Others" | "Sorted";
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
  keterangan?: string;

  // Ban
  merekBan?: string;
  typeBan?: string;
  ukuranTapak?: string;
  ukuranTinggi?: string;
  hargaTagihanToko?: number;

  // Velg / Others / Sorted
  merekProduk?: string;
  kodeBarang?: string;
  typeVelg?: string;
  wide?: string;
  hole?: string;
  et?: string;
  colour?: string;
  nobes?: string;
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
  supplier: string;
  stok: string;
  gambar: string;

  // Ban
  merekBan?: string;
  typeBan?: string;
  ring?: string;
  ukuranTapak?: string;
  ukuranTinggi?: string;

  // Others / Sorted
  subKategori?: string;
  merekProduk?: string;
  typeVelg?: string;
  wide?: string;
  hole?: string;
  et?: string;
  colour?: string;
  nobes?: string;
  keterangan?: string;
  notes?: string;

  // Legacy opsional — tidak ditampilkan lagi di form registrasi.
  namaBarang?: string;
  ukuran?: string;
  hargaModalAsli?: string;
  hargaModalToko?: string;
  hargaTagihanToko?: string;
  tanggal?: string;
  pembayaran?: DistribusiPayment;
  jenisBarang?: string;
  owner?: string;
  paymentDate?: string;
  nomorBon?: string;
  kodeBarang?: string;
  item?: string;
  gtySet?: string;
  standarPrice?: string;
  discount?: string;
  dealerPrice?: string;
  dprice?: string;
  discountType?: string;
  rawPrice?: string;
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
  const today = new Date().toISOString().slice(0, 10);
  const isVelg = !isBan && v.subKategori === "Velg";
  const itemCode = isVelg
    ? buildVelgItemCode({ ...v, tanggal: v.tanggal || today })
    : undefined;

  // Generate Nama Barang
  let namaBarang = "";
  if (isBan) {
    namaBarang = buildBanName(v);
  } else if (isVelg && itemCode) {
    namaBarang = itemCode;
  } else {
    // Untuk Others (Non-Velg) & Sorted
    namaBarang = v.namaBarang?.trim() ||
      [v.merekProduk?.trim(), v.subKategori?.trim()]
        .filter(Boolean)
        .join(" ") ||
      v.subKategori ||
      "Barang";
  }

  // Generate Ukuran
  let ukuran = "";
  if (isBan) {
    ukuran = [v.ukuranTapak, v.ukuranTinggi].filter(Boolean).join("/");
  } else if (isVelg) {
    ukuran = [v.ring, v.wide].filter(Boolean).join(" ");
  } else {
    ukuran = v.keterangan || "-";
  }

  return {
    id,
    kategori: v.kategori,
    namaBarang,
    subKategori: isBan ? v.merekBan || "Ban" : v.subKategori || "Others",
    supplier: v.supplier,
    ukuran,
    ring: v.ring || "",
    hargaModalAsli: Number(v.hargaModalAsli) || 0,
    hargaModalToko: Number(v.hargaModalToko) || 0,
    standarPrice: Number(v.standarPrice) || 0,
    stok: Number(v.stok) || 0,
    gambar: v.gambar,
    notes: v.notes,

    ...(v.keterangan ? { keterangan: v.keterangan } : {}),
    ...(v.tanggal ? { tanggal: v.tanggal } : {}),
    ...(v.pembayaran ? { pembayaran: v.pembayaran } : {}),
    ...(v.jenisBarang ? { jenisBarang: v.jenisBarang } : {}),
    ...(v.owner ? { owner: v.owner } : {}),
    ...(v.paymentDate ? { paymentDate: v.paymentDate } : {}),
    ...(v.nomorBon ? { nomorBon: v.nomorBon } : {}),

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
          typeVelg: isVelg ? v.typeVelg : undefined,
          wide: isVelg ? v.wide : undefined,
          hole: isVelg ? v.hole : undefined,
          et: isVelg ? v.et : undefined,
          colour: isVelg ? v.colour : undefined,
          nobes: isVelg ? v.nobes : undefined,
          item: itemCode,
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
    standarPrice: 3200000,
    tanggal: "2026-01-26",
    pembayaran: "Lunas",
    jenisBarang: "Velg",
    owner: "Budi",
    paymentDate: "2026-01-27",
    nomorBon: "BON-2601-001",
    notes: "Stok awal velg racing",
  },
];

// 3. DATA SORTED
export const initialSortedItems: DistribusiItem[] = [
  {
    id: "WK-7001",
    kategori: "Sorted",
    namaBarang: "Parfum Mobil Lavender",
    subKategori: "Parfum",
    supplier: "PT Aroma Indah",
    ukuran: "100ml",
    ring: "",
    hargaModalAsli: 25000,
    hargaModalToko: 45000,
    standarPrice: 50000,
    stok: 50,
    gambar: "",
    merekProduk: "Lavender",
    keterangan: "Botol kaca 100ml",
    tanggal: "2026-02-01",
    notes: "Wangi tahan lama",
  },
  {
    id: "WK-7002",
    kategori: "Sorted",
    namaBarang: "Centering Mur Roda Alumunium",
    subKategori: "Centering Mur Roda",
    supplier: "CV Maju Jaya",
    ukuran: "M12 x 1.5",
    ring: "",
    hargaModalAsli: 15000,
    hargaModalToko: 35000,
    standarPrice: 40000,
    stok: 100,
    gambar: "",
    merekProduk: "Racing",
    keterangan: "Bahan Alumunium",
    tanggal: "2026-02-05",
    notes: "Ringan & kuat",
  },
];

// 4. GABUNGAN SEMUA DATA
export const initialDistribusiItems: DistribusiItem[] = [
  ...initialBanItems,
  ...initialOthersItems,
  ...initialSortedItems,
];