export interface NewsItem {
  id: string;
  title: string;
  body: string;
  date: string;
  tag: string;
}

export const news: NewsItem[] = [
  {
    id: "NEWS-001",
    title: "Stok ban SUV menipis",
    body: "Periksa kembali stok Achilles Desert Hawk dan Hankook Dynapro sebelum akhir pekan.",
    date: "28 Okt 2026",
    tag: "Stok",
  },
  {
    id: "NEWS-002",
    title: "Setoran finance mingguan",
    body: "Setoran toko Medan dan Binjai diperiksa setiap Senin pukul 09.00 WIB.",
    date: "27 Okt 2026",
    tag: "Finance",
  },
  {
    id: "NEWS-003",
    title: "Program tukar tambah velg",
    body: "Velg second wajib dicatat nomor bon dan catatan velg baru pasangannya.",
    date: "25 Okt 2026",
    tag: "Promo",
  },
];

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  type: string;
  createdAt: string;
  history: string[];
}

export const customers: CustomerRecord[] = [
  {
    id: "CUS-001",
    name: "Toko Berkah Jaya",
    phone: "0812-6100-2001",
    email: "berkahjaya@gmail.com",
    address: "Jl. Gatot Subroto No. 88",
    city: "Medan",
    type: "Reseller",
    createdAt: "12 Jan 2026",
    history: ["Dibuat pada 12 Jan 2026"],
  },
  {
    id: "CUS-002",
    name: "Bengkel Roda Mas",
    phone: "0813-6100-2002",
    email: "rodamas@gmail.com",
    address: "Jl. Soekarno Hatta No. 21",
    city: "Binjai",
    type: "Bengkel",
    createdAt: "18 Jan 2026",
    history: ["Dibuat pada 18 Jan 2026"],
  },
  {
    id: "CUS-003",
    name: "CV Auto Prima",
    phone: "0812-6100-2003",
    email: "autoprima@yahoo.com",
    address: "Jl. Medan-Batang Kuis KM 12",
    city: "Deli Serdang",
    type: "Perusahaan",
    createdAt: "02 Feb 2026",
    history: ["Dibuat pada 02 Feb 2026"],
  },
  {
    id: "CUS-004",
    name: "Honda Brio Club Medan",
    phone: "0812-6100-2004",
    email: "brioclub.medan@gmail.com",
    address: "Jl. Ring Road No. 5",
    city: "Medan",
    type: "Komunitas",
    createdAt: "20 Feb 2026",
    history: ["Dibuat pada 20 Feb 2026"],
  },
  {
    id: "CUS-005",
    name: "Rizky Ramadhan",
    phone: "0812-6100-2005",
    email: "rizky.ramadhan@gmail.com",
    address: "Jl. Setiabudi No. 17",
    city: "Medan",
    type: "Perorangan",
    createdAt: "05 Mar 2026",
    history: ["Dibuat pada 05 Mar 2026"],
  },
];

export interface DiscountRecord {
  id: string;
  code: string;
  store: string;
  limit: number;
  type: "Discount" | "Voucher";
  fromDate: string;
  toDate: string;
  status: "Aktif" | "Tidak Aktif";
  createdAt: string;
  history: string[];
}

export const discounts: DiscountRecord[] = [
  {
    id: "DSC-001",
    code: "KKW01",
    store: "WheelsKopi Pusat",
    limit: 5,
    type: "Discount",
    fromDate: "2026-10-05",
    toDate: "2026-12-10",
    status: "Aktif",
    createdAt: "05 Okt 2026",
    history: ["Dibuat pada 05 Okt 2026"],
  },
  {
    id: "DSC-002",
    code: "KKW02",
    store: "WheelsKopi Binjai",
    limit: 10,
    type: "Voucher",
    fromDate: "2026-10-01",
    toDate: "2026-11-30",
    status: "Aktif",
    createdAt: "01 Okt 2026",
    history: ["Dibuat pada 01 Okt 2026"],
  },
  {
    id: "DSC-003",
    code: "KKW03",
    store: "WheelsKopi Deli Serdang",
    limit: 3,
    type: "Discount",
    fromDate: "2026-08-01",
    toDate: "2026-09-30",
    status: "Tidak Aktif",
    createdAt: "01 Agu 2026",
    history: ["Dibuat pada 01 Agu 2026"],
  },
];

export interface ReceiptPORecord {
  id: string;
  number: string;
  poNumber: string;
  supplier: string;
  address: string;
  date: string;
  status: "Completed" | "Pending";
}

export const receiptPOs: ReceiptPORecord[] = [
  {
    id: "RCP-001",
    number: "RCP-2601",
    poNumber: "PO-2601",
    supplier: "PT Michelin Indonesia",
    address: "Jl. Gatot Subroto No. 88, Medan",
    date: "07 Jan 2026",
    status: "Completed",
  },
  {
    id: "RCP-002",
    number: "RCP-2602",
    poNumber: "PO-2603",
    supplier: "CV Mitra Ban Sejahtera",
    address: "Jl. Soekarno Hatta No. 21, Binjai",
    date: "04 Feb 2026",
    status: "Completed",
  },
  {
    id: "RCP-003",
    number: "RCP-2603",
    poNumber: "PO-2604",
    supplier: "CV Velg Nusantara",
    address: "Jl. Medan-Batang Kuis KM 12, Deli Serdang",
    date: "21 Feb 2026",
    status: "Completed",
  },
];

export interface DailySpendRecord {
  id: string;
  number: string;
  date: string;
  store: string;
  total: number;
  status: "Draft" | "Approved";
  proof: string;
  createdAt: string;
  history: string[];
}

export const dailySpends: DailySpendRecord[] = [
  {
    id: "DS-001",
    number: "DS-2401",
    date: "23 Feb 2026",
    store: "WheelsKopi Pusat",
    total: 150_000,
    status: "Approved",
    proof: "Nota-2401.pdf",
    createdAt: "24 Feb 2026",
    history: ["Dibuat pada 24 Feb 2026"],
  },
  {
    id: "DS-002",
    number: "DS-2402",
    date: "24 Feb 2026",
    store: "WheelsKopi Binjai",
    total: 85_000,
    status: "Draft",
    proof: "Nota-2402.pdf",
    createdAt: "24 Feb 2026",
    history: ["Dibuat pada 24 Feb 2026"],
  },
  {
    id: "DS-003",
    number: "DS-2403",
    date: "25 Feb 2026",
    store: "WheelsKopi Pusat",
    total: 210_000,
    status: "Approved",
    proof: "Nota-2403.pdf",
    createdAt: "25 Feb 2026",
    history: ["Dibuat pada 25 Feb 2026"],
  },
  {
    id: "DS-004",
    number: "DS-2404",
    date: "26 Feb 2026",
    store: "WheelsKopi Deli Serdang",
    total: 125_000,
    status: "Draft",
    proof: "Nota-2404.pdf",
    createdAt: "26 Feb 2026",
    history: ["Dibuat pada 26 Feb 2026"],
  },
];

export interface FinanceStoreRecord {
  id: string;
  number: string;
  date: string;
  store: string;
  totalSales: number;
  totalDaily: number;
  status: "Draft" | "Completed";
  createdAt: string;
}

export const financeStores: FinanceStoreRecord[] = [
  {
    id: "FS-001",
    number: "KKW-230324",
    date: "23 Feb 2026",
    store: "WheelsKopi Pusat",
    totalSales: 9_000_000,
    totalDaily: 150_000,
    status: "Draft",
    createdAt: "24 Feb 2026",
  },
  {
    id: "FS-002",
    number: "KKW-240324",
    date: "24 Feb 2026",
    store: "WheelsKopi Binjai",
    totalSales: 6_450_000,
    totalDaily: 85_000,
    status: "Completed",
    createdAt: "25 Feb 2026",
  },
  {
    id: "FS-003",
    number: "KKW-250324",
    date: "25 Feb 2026",
    store: "WheelsKopi Pusat",
    totalSales: 7_850_000,
    totalDaily: 210_000,
    status: "Completed",
    createdAt: "26 Feb 2026",
  },
];

export interface SelloutGlobalRecord {
  id: string;
  number: string;
  date: string;
  store: string;
  customer: string;
  discount: number;
  grandTotal: number;
  status: "Sold";
  history: string[];
}

export const selloutGlobals: SelloutGlobalRecord[] = [
  {
    id: "SG-001",
    number: "SO-2601",
    date: "02 Jan 2026",
    store: "KKW",
    customer: "Toko Berkah Jaya",
    discount: 100_000,
    grandTotal: 7_660_000,
    status: "Sold",
    history: ["Dibuat pada 02 Jan 2026"],
  },
  {
    id: "SG-002",
    number: "SO-2604",
    date: "17 Jan 2026",
    store: "KKB",
    customer: "CV Auto Prima",
    discount: 0,
    grandTotal: 11_600_000,
    status: "Sold",
    history: ["Dibuat pada 17 Jan 2026"],
  },
  {
    id: "SG-003",
    number: "SO-2608",
    date: "15 Feb 2026",
    store: "KDS",
    customer: "CV Auto Prima",
    discount: 250_000,
    grandTotal: 24_750_000,
    status: "Sold",
    history: ["Dibuat pada 15 Feb 2026"],
  },
];

export interface TradeInRecord {
  id: string;
  store: string;
  date: string;
  bonNumber: string;
  price: number;
  product: string;
  notes: string;
  status: "Sold" | "Available";
}

export const tradeIns: TradeInRecord[] = [
  {
    id: "TT-001",
    store: "WheelsKopi Pusat",
    date: "12 Feb 2026",
    bonNumber: "BON-TT-001",
    price: 3_500_000,
    product: "Velg HSR Ring 17 Second",
    notes: "Tukar tambah dengan Velg HRE FlowForm FF11 R18.",
    status: "Sold",
  },
  {
    id: "TT-002",
    store: "WheelsKopi Binjai",
    date: "20 Feb 2026",
    bonNumber: "BON-TT-002",
    price: 2_750_000,
    product: "Velg Rays Gram Lights R17 Second",
    notes: "Tukar tambah dengan Velg Vossen HF-5 R19.",
    status: "Sold",
  },
  {
    id: "TT-003",
    store: "WheelsKopi Deli Serdang",
    date: "02 Mar 2026",
    bonNumber: "BON-TT-003",
    price: 1_950_000,
    product: "Velg Enkei RPF1 R16 Second",
    notes: "Tukar tambah dengan Velg HSR Ring 17 baru.",
    status: "Available",
  },
];

export const customerTypes = [
  "Reseller",
  "Bengkel",
  "Perusahaan",
  "Komunitas",
  "Perorangan",
];

export const discountTypes = ["Discount", "Voucher"] as const;
