export interface OthersRecord {
  id: string;
  bulan: string;
  date: string;
  lunas: "Lunas" | "Tidak Lunas";
  kodeBarang: string;
  supplier: string;
  merek: string;
  type: string;
  ring: string;
  wide: string;
  hole: string;
  et: string;
  item: string;
  qty: number;
  standarPrice: number;
  discount: number;
  dealerPrice: number;
  totalPrice: number;
  discTypeCash: string;
  rawCase: number;
  sswDisc: number;
  rawPrice: number;
  shippingFee: number;
  shipFeePerSet: number;
  subTotal: number;
  modalPerSet: number;
  paymentCash: number;
  up: number;
  modalToko: number;
  arrivalDate: string;
  stockOwner: string;
  paymentDate: string;
  nomorBon: string;
  invoiceDate: string;
  notes: string;
}

interface OthersSeed {
  id: string;
  bulan: string;
  date: string;
  lunas: "Lunas" | "Tidak Lunas";
  kodeBarang: string;
  supplier: string;
  merek: string;
  type: string;
  ring: string;
  wide: string;
  hole: string;
  et: string;
  item: string;
  qty: number;
  standarPrice: number;
  discount: number;
  discTypeCash: string;
  rawCase: number;
  sswDisc: number;
  shippingFee: number;
  paymentCash: number;
  up: number;
  arrivalDate: string;
  stockOwner: string;
  paymentDate: string;
  nomorBon: string;
  invoiceDate: string;
  notes: string;
}

function buildOthersRecord(seed: OthersSeed): OthersRecord {
  const dealerPrice = Math.round(seed.standarPrice - seed.discount);
  const totalPrice = dealerPrice * seed.qty;
  const subTotal = totalPrice + seed.shippingFee;
  const shipFeePerSet = Math.round(seed.shippingFee / seed.qty);
  const modalPerSet = Math.round((subTotal / seed.qty) * 0.82);
  const modalToko = modalPerSet + seed.up;

  return {
    ...seed,
    dealerPrice,
    totalPrice,
    rawPrice: seed.standarPrice,
    shipFeePerSet,
    subTotal,
    modalPerSet,
    modalToko,
  };
}

const othersSeeds: OthersSeed[] = [
  {
    id: "OTH-001",
    bulan: "Januari",
    date: "04 Jan 2026",
    lunas: "Lunas",
    kodeBarang: "WK-OTH-104",
    supplier: "PT Michelin Indonesia",
    merek: "Michelin",
    type: "Pilot Sport 4",
    ring: "R17",
    wide: "225",
    hole: "45",
    et: "ET40",
    item: "Ban",
    qty: 12,
    standarPrice: 1_850_000,
    discount: 75_000,
    discTypeCash: "Cash",
    rawCase: 1,
    sswDisc: 2,
    shippingFee: 240_000,
    paymentCash: 21_300_000,
    up: 90_000,
    arrivalDate: "07 Jan 2026",
    stockOwner: "Gudang Medan",
    paymentDate: "05 Jan 2026",
    nomorBon: "BON-2401",
    invoiceDate: "04 Jan 2026",
    notes: "Pengiriman reguler, stok utama.",
  },
  {
    id: "OTH-002",
    bulan: "Januari",
    date: "12 Jan 2026",
    lunas: "Tidak Lunas",
    kodeBarang: "WK-OTH-111",
    supplier: "PT Bridgestone Tire",
    merek: "Bridgestone",
    type: "Turanza T005",
    ring: "R16",
    wide: "205",
    hole: "55",
    et: "ET45",
    item: "Ban",
    qty: 8,
    standarPrice: 1_420_000,
    discount: 40_000,
    discTypeCash: "Tempo 30 Hari",
    rawCase: 1,
    sswDisc: 1.5,
    shippingFee: 160_000,
    paymentCash: 0,
    up: 75_000,
    arrivalDate: "15 Jan 2026",
    stockOwner: "Gudang Medan",
    paymentDate: "-",
    nomorBon: "BON-2418",
    invoiceDate: "12 Jan 2026",
    notes: "Menunggu pelunasan dealer.",
  },
  {
    id: "OTH-003",
    bulan: "Februari",
    date: "02 Feb 2026",
    lunas: "Lunas",
    kodeBarang: "WK-OTH-118",
    supplier: "CV Mitra Ban Sejahtera",
    merek: "GT Radial",
    type: "Champiro HPY",
    ring: "R17",
    wide: "215",
    hole: "50",
    et: "ET42",
    item: "Ban",
    qty: 16,
    standarPrice: 1_150_000,
    discount: 50_000,
    discTypeCash: "Cash",
    rawCase: 1,
    sswDisc: 2,
    shippingFee: 320_000,
    paymentCash: 17_280_000,
    up: 60_000,
    arrivalDate: "05 Feb 2026",
    stockOwner: "Gudang Medan",
    paymentDate: "03 Feb 2026",
    nomorBon: "BON-2503",
    invoiceDate: "02 Feb 2026",
    notes: "Restock ban performa tinggi.",
  },
  {
    id: "OTH-004",
    bulan: "Februari",
    date: "18 Feb 2026",
    lunas: "Lunas",
    kodeBarang: "WK-OTH-124",
    supplier: "PT Michelin Indonesia",
    merek: "BFGoodrich",
    type: "Advantage",
    ring: "R15",
    wide: "195",
    hole: "65",
    et: "ET38",
    item: "Ban",
    qty: 10,
    standarPrice: 980_000,
    discount: 30_000,
    discTypeCash: "Cash",
    rawCase: 1,
    sswDisc: 1,
    shippingFee: 180_000,
    paymentCash: 9_320_000,
    up: 55_000,
    arrivalDate: "21 Feb 2026",
    stockOwner: "Gudang Medan",
    paymentDate: "19 Feb 2026",
    nomorBon: "BON-2528",
    invoiceDate: "18 Feb 2026",
    notes: "Permintaan komunitas SUV.",
  },
  {
    id: "OTH-005",
    bulan: "Maret",
    date: "06 Mar 2026",
    lunas: "Tidak Lunas",
    kodeBarang: "OTH-VELG-22",
    supplier: "CV Velg Nusantara",
    merek: "HRE",
    type: "FlowForm FF11",
    ring: "R18",
    wide: "8.5",
    hole: "5x114.3",
    et: "ET35",
    item: "Velg",
    qty: 4,
    standarPrice: 4_250_000,
    discount: 250_000,
    discTypeCash: "Tempo 14 Hari",
    rawCase: 2,
    sswDisc: 3,
    shippingFee: 450_000,
    paymentCash: 0,
    up: 250_000,
    arrivalDate: "10 Mar 2026",
    stockOwner: "Showroom",
    paymentDate: "-",
    nomorBon: "BON-2608",
    invoiceDate: "06 Mar 2026",
    notes: "Pesanan khusus customer.",
  },
  {
    id: "OTH-006",
    bulan: "Maret",
    date: "21 Mar 2026",
    lunas: "Lunas",
    kodeBarang: "OTH-AKS-07",
    supplier: "PT Aksesori Roda",
    merek: "Rays",
    type: "Lock Nut Set",
    ring: "-",
    wide: "-",
    hole: "M12x1.5",
    et: "-",
    item: "Aksesori",
    qty: 24,
    standarPrice: 185_000,
    discount: 10_000,
    discTypeCash: "Cash",
    rawCase: 4,
    sswDisc: 1,
    shippingFee: 95_000,
    paymentCash: 4_240_000,
    up: 15_000,
    arrivalDate: "24 Mar 2026",
    stockOwner: "Gudang Medan",
    paymentDate: "22 Mar 2026",
    nomorBon: "BON-2641",
    invoiceDate: "21 Mar 2026",
    notes: "Paket baut roda untuk display.",
  },
  {
    id: "OTH-007",
    bulan: "April",
    date: "09 Apr 2026",
    lunas: "Lunas",
    kodeBarang: "OTH-OTH-31",
    supplier: "PT Bridgestone Tire",
    merek: "Bridgestone",
    type: "Ecopia EP300",
    ring: "R16",
    wide: "195",
    hole: "60",
    et: "ET43",
    item: "Ban",
    qty: 20,
    standarPrice: 1_280_000,
    discount: 60_000,
    discTypeCash: "Cash",
    rawCase: 1,
    sswDisc: 2,
    shippingFee: 360_000,
    paymentCash: 24_760_000,
    up: 70_000,
    arrivalDate: "12 Apr 2026",
    stockOwner: "Gudang Medan",
    paymentDate: "10 Apr 2026",
    nomorBon: "BON-2709",
    invoiceDate: "09 Apr 2026",
    notes: "Stok ban hemat bahan bakar.",
  },
  {
    id: "OTH-008",
    bulan: "April",
    date: "23 Apr 2026",
    lunas: "Tidak Lunas",
    kodeBarang: "OTH-VELG-28",
    supplier: "CV Velg Nusantara",
    merek: "Vossen",
    type: "Hybrid Forged HF-5",
    ring: "R19",
    wide: "9.5",
    hole: "5x120",
    et: "ET40",
    item: "Velg",
    qty: 4,
    standarPrice: 5_750_000,
    discount: 350_000,
    discTypeCash: "Tempo 30 Hari",
    rawCase: 2,
    sswDisc: 3,
    shippingFee: 520_000,
    paymentCash: 0,
    up: 300_000,
    arrivalDate: "28 Apr 2026",
    stockOwner: "Showroom",
    paymentDate: "-",
    nomorBon: "BON-2735",
    invoiceDate: "23 Apr 2026",
    notes: "Menunggu transfer dealer.",
  },
];

export const othersRecords: OthersRecord[] = othersSeeds.map(buildOthersRecord);

export interface StockListRecord {
  id: string;
  namaProduk: string;
  item: string;
  ring: string;
  hole: string;
  city: string;
  hargaJual: number;
  up: number;
  tagihanToko: number;
  modalDistributor: number;
  qty: number;
}

export const stockListRecords: StockListRecord[] = [
  {
    id: "SL-001",
    namaProduk: "Michelin Pilot Sport 4",
    item: "Ban",
    ring: "R17",
    hole: "225/45",
    city: "Medan",
    hargaJual: 1_940_000,
    up: 90_000,
    tagihanToko: 1_850_000,
    modalDistributor: 1_580_000,
    qty: 14,
  },
  {
    id: "SL-002",
    namaProduk: "Bridgestone Turanza T005",
    item: "Ban",
    ring: "R16",
    hole: "205/55",
    city: "Medan",
    hargaJual: 1_455_000,
    up: 75_000,
    tagihanToko: 1_380_000,
    modalDistributor: 1_190_000,
    qty: 22,
  },
  {
    id: "SL-003",
    namaProduk: "GT Radial Champiro HPY",
    item: "Ban",
    ring: "R17",
    hole: "215/50",
    city: "Binjai",
    hargaJual: 1_160_000,
    up: 60_000,
    tagihanToko: 1_100_000,
    modalDistributor: 945_000,
    qty: 18,
  },
  {
    id: "SL-004",
    namaProduk: "BFGoodrich Advantage",
    item: "Ban",
    ring: "R15",
    hole: "195/65",
    city: "Medan",
    hargaJual: 1_035_000,
    up: 55_000,
    tagihanToko: 980_000,
    modalDistributor: 845_000,
    qty: 9,
  },
  {
    id: "SL-005",
    namaProduk: "HRE FlowForm FF11",
    item: "Velg",
    ring: "R18",
    hole: "5x114.3",
    city: "Deli Serdang",
    hargaJual: 4_750_000,
    up: 250_000,
    tagihanToko: 4_500_000,
    modalDistributor: 3_820_000,
    qty: 6,
  },
  {
    id: "SL-006",
    namaProduk: "Rays Lock Nut Set",
    item: "Aksesori",
    ring: "-",
    hole: "M12x1.5",
    city: "Medan",
    hargaJual: 210_000,
    up: 15_000,
    tagihanToko: 195_000,
    modalDistributor: 152_000,
    qty: 32,
  },
  {
    id: "SL-007",
    namaProduk: "Vossen Hybrid Forged HF-5",
    item: "Velg",
    ring: "R19",
    hole: "5x120",
    city: "Binjai",
    hargaJual: 6_250_000,
    up: 300_000,
    tagihanToko: 5_950_000,
    modalDistributor: 5_100_000,
    qty: 4,
  },
  {
    id: "SL-008",
    namaProduk: "Bridgestone Ecopia EP300",
    item: "Ban",
    ring: "R16",
    hole: "195/60",
    city: "Deli Serdang",
    hargaJual: 1_310_000,
    up: 70_000,
    tagihanToko: 1_240_000,
    modalDistributor: 1_060_000,
    qty: 11,
  },
];

export interface SelloutEntry {
  id: string;
  invoice: string;
  date: string;
  customer: string;
  city: string;
  product: string;
  category: "Ban" | "Velg" | "Aksesori";
  qty: number;
  unitPrice: number;
  payment: "Cash" | "Transfer" | "QRIS" | "Tempo";
  status: "Lunas" | "Piutang";
}

export const selloutEntries: SelloutEntry[] = [
  {
    id: "SO-001",
    invoice: "INV-2601",
    date: "02 Jan 2026",
    customer: "Toko Berkah Jaya",
    city: "Medan",
    product: "Michelin Pilot Sport 4",
    category: "Ban",
    qty: 4,
    unitPrice: 1_940_000,
    payment: "Transfer",
    status: "Lunas",
  },
  {
    id: "SO-002",
    invoice: "INV-2602",
    date: "06 Jan 2026",
    customer: "Bengkel Roda Mas",
    city: "Binjai",
    product: "Bridgestone Turanza T005",
    category: "Ban",
    qty: 6,
    unitPrice: 1_455_000,
    payment: "Cash",
    status: "Lunas",
  },
  {
    id: "SO-003",
    invoice: "INV-2603",
    date: "11 Jan 2026",
    customer: "Honda Brio Club Medan",
    city: "Medan",
    product: "BFGoodrich Advantage",
    category: "Ban",
    qty: 8,
    unitPrice: 1_035_000,
    payment: "QRIS",
    status: "Lunas",
  },
  {
    id: "SO-004",
    invoice: "INV-2604",
    date: "17 Jan 2026",
    customer: "CV Auto Prima",
    city: "Deli Serdang",
    product: "GT Radial Champiro HPY",
    category: "Ban",
    qty: 10,
    unitPrice: 1_160_000,
    payment: "Tempo",
    status: "Piutang",
  },
  {
    id: "SO-005",
    invoice: "INV-2605",
    date: "24 Jan 2026",
    customer: "Garage 88",
    city: "Medan",
    product: "HRE FlowForm FF11",
    category: "Velg",
    qty: 4,
    unitPrice: 4_750_000,
    payment: "Transfer",
    status: "Lunas",
  },
  {
    id: "SO-006",
    invoice: "INV-2606",
    date: "03 Feb 2026",
    customer: "Toko Sinar Ban",
    city: "Binjai",
    product: "Bridgestone Ecopia EP300",
    category: "Ban",
    qty: 12,
    unitPrice: 1_310_000,
    payment: "Transfer",
    status: "Lunas",
  },
  {
    id: "SO-007",
    invoice: "INV-2607",
    date: "09 Feb 2026",
    customer: "Rizky Ramadhan",
    city: "Medan",
    product: "Rays Lock Nut Set",
    category: "Aksesori",
    qty: 2,
    unitPrice: 210_000,
    payment: "Cash",
    status: "Lunas",
  },
  {
    id: "SO-008",
    invoice: "INV-2608",
    date: "15 Feb 2026",
    customer: "CV Auto Prima",
    city: "Deli Serdang",
    product: "Vossen Hybrid Forged HF-5",
    category: "Velg",
    qty: 4,
    unitPrice: 6_250_000,
    payment: "Tempo",
    status: "Piutang",
  },
  {
    id: "SO-009",
    invoice: "INV-2609",
    date: "22 Feb 2026",
    customer: "Komunitas Ban Tubeless",
    city: "Medan",
    product: "Michelin Pilot Sport 4",
    category: "Ban",
    qty: 6,
    unitPrice: 1_940_000,
    payment: "QRIS",
    status: "Lunas",
  },
  {
    id: "SO-010",
    invoice: "INV-2610",
    date: "28 Feb 2026",
    customer: "Bengkel Roda Mas",
    city: "Binjai",
    product: "GT Radial Champiro HPY",
    category: "Ban",
    qty: 8,
    unitPrice: 1_160_000,
    payment: "Transfer",
    status: "Lunas",
  },
  {
    id: "SO-011",
    invoice: "INV-2611",
    date: "06 Mar 2026",
    customer: "Garage 88",
    city: "Medan",
    product: "HRE FlowForm FF11",
    category: "Velg",
    qty: 2,
    unitPrice: 4_750_000,
    payment: "Cash",
    status: "Lunas",
  },
  {
    id: "SO-012",
    invoice: "INV-2612",
    date: "14 Mar 2026",
    customer: "Toko Berkah Jaya",
    city: "Medan",
    product: "Bridgestone Ecopia EP300",
    category: "Ban",
    qty: 10,
    unitPrice: 1_310_000,
    payment: "Tempo",
    status: "Piutang",
  },
];

export interface StockMovement {
  id: string;
  date: string;
  product: string;
  sku: string;
  type: "Masuk" | "Keluar" | "Penyesuaian";
  qty: number;
  before: number;
  after: number;
  reference: string;
  user: string;
  notes: string;
}

export const stockMovements: StockMovement[] = [
  {
    id: "MV-001",
    date: "04 Jan 2026",
    product: "Michelin Pilot Sport 4",
    sku: "WK-OTH-104",
    type: "Masuk",
    qty: 12,
    before: 4,
    after: 16,
    reference: "BON-2401",
    user: "Admin Wheels",
    notes: "Penerimaan dari supplier.",
  },
  {
    id: "MV-002",
    date: "06 Jan 2026",
    product: "Bridgestone Turanza T005",
    sku: "WK-OTH-111",
    type: "Keluar",
    qty: 6,
    before: 28,
    after: 22,
    reference: "INV-2602",
    user: "Kasir Medan",
    notes: "Penjualan Toko Berkah Jaya.",
  },
  {
    id: "MV-003",
    date: "09 Jan 2026",
    product: "BFGoodrich Advantage",
    sku: "WK-OTH-124",
    type: "Masuk",
    qty: 10,
    before: 3,
    after: 13,
    reference: "BON-2528",
    user: "Admin Wheels",
    notes: "Restock ban SUV.",
  },
  {
    id: "MV-004",
    date: "15 Jan 2026",
    product: "HRE FlowForm FF11",
    sku: "OTH-VELG-22",
    type: "Keluar",
    qty: 4,
    before: 10,
    after: 6,
    reference: "INV-2605",
    user: "Kasir Showroom",
    notes: "Pesanan Garage 88.",
  },
  {
    id: "MV-005",
    date: "21 Jan 2026",
    product: "Rays Lock Nut Set",
    sku: "OTH-AKS-07",
    type: "Penyesuaian",
    qty: -2,
    before: 34,
    after: 32,
    reference: "ADJ-012",
    user: "Admin Wheels",
    notes: "Koreksi stok display.",
  },
  {
    id: "MV-006",
    date: "02 Feb 2026",
    product: "GT Radial Champiro HPY",
    sku: "WK-OTH-118",
    type: "Masuk",
    qty: 16,
    before: 8,
    after: 24,
    reference: "BON-2503",
    user: "Admin Wheels",
    notes: "Penerimaan supplier lokal.",
  },
  {
    id: "MV-007",
    date: "09 Feb 2026",
    product: "Rays Lock Nut Set",
    sku: "OTH-AKS-07",
    type: "Keluar",
    qty: 2,
    before: 32,
    after: 30,
    reference: "INV-2607",
    user: "Kasir Medan",
    notes: "Pembelian customer retail.",
  },
  {
    id: "MV-008",
    date: "18 Feb 2026",
    product: "Vossen Hybrid Forged HF-5",
    sku: "OTH-VELG-28",
    type: "Masuk",
    qty: 4,
    before: 0,
    after: 4,
    reference: "BON-2735",
    user: "Admin Wheels",
    notes: "Unit khusus pre-order.",
  },
  {
    id: "MV-009",
    date: "24 Feb 2026",
    product: "Michelin Pilot Sport 4",
    sku: "WK-OTH-104",
    type: "Keluar",
    qty: 6,
    before: 16,
    after: 10,
    reference: "INV-2609",
    user: "Kasir Medan",
    notes: "Order komunitas.",
  },
  {
    id: "MV-010",
    date: "02 Mar 2026",
    product: "Bridgestone Ecopia EP300",
    sku: "OTH-OTH-31",
    type: "Penyesuaian",
    qty: 3,
    before: 8,
    after: 11,
    reference: "ADJ-018",
    user: "Admin Wheels",
    notes: "Temuan stok gudang.",
  },
];

export interface MonthlyPerformance {
  month: string;
  revenue: number;
  cogs: number;
  profit: number;
  orders: number;
}

export const monthlyPerformance: MonthlyPerformance[] = [
  {
    month: "Jan",
    revenue: 41_500_000,
    cogs: 33_200_000,
    profit: 8_300_000,
    orders: 18,
  },
  {
    month: "Feb",
    revenue: 52_800_000,
    cogs: 41_900_000,
    profit: 10_900_000,
    orders: 23,
  },
  {
    month: "Mar",
    revenue: 47_300_000,
    cogs: 37_600_000,
    profit: 9_700_000,
    orders: 21,
  },
  {
    month: "Apr",
    revenue: 63_900_000,
    cogs: 50_200_000,
    profit: 13_700_000,
    orders: 28,
  },
  {
    month: "Mei",
    revenue: 58_400_000,
    cogs: 46_100_000,
    profit: 12_300_000,
    orders: 25,
  },
  {
    month: "Jun",
    revenue: 72_100_000,
    cogs: 56_400_000,
    profit: 15_700_000,
    orders: 31,
  },
];

export interface ProfitRow {
  id: string;
  product: string;
  category: "Ban" | "Velg" | "Aksesori";
  city: string;
  qty: number;
  revenue: number;
  cogs: number;
  profit: number;
}

export const profitRows: ProfitRow[] = [
  {
    id: "PR-001",
    product: "Michelin Pilot Sport 4",
    category: "Ban",
    city: "Medan",
    qty: 26,
    revenue: 50_440_000,
    cogs: 41_080_000,
    profit: 9_360_000,
  },
  {
    id: "PR-002",
    product: "Bridgestone Turanza T005",
    category: "Ban",
    city: "Medan",
    qty: 34,
    revenue: 49_470_000,
    cogs: 40_460_000,
    profit: 9_010_000,
  },
  {
    id: "PR-003",
    product: "GT Radial Champiro HPY",
    category: "Ban",
    city: "Binjai",
    qty: 40,
    revenue: 46_400_000,
    cogs: 37_800_000,
    profit: 8_600_000,
  },
  {
    id: "PR-004",
    product: "BFGoodrich Advantage",
    category: "Ban",
    city: "Medan",
    qty: 22,
    revenue: 22_770_000,
    cogs: 18_590_000,
    profit: 4_180_000,
  },
  {
    id: "PR-005",
    product: "HRE FlowForm FF11",
    category: "Velg",
    city: "Deli Serdang",
    qty: 8,
    revenue: 38_000_000,
    cogs: 30_560_000,
    profit: 7_440_000,
  },
  {
    id: "PR-006",
    product: "Vossen Hybrid Forged HF-5",
    category: "Velg",
    city: "Binjai",
    qty: 6,
    revenue: 37_500_000,
    cogs: 30_600_000,
    profit: 6_900_000,
  },
  {
    id: "PR-007",
    product: "Rays Lock Nut Set",
    category: "Aksesori",
    city: "Medan",
    qty: 28,
    revenue: 5_880_000,
    cogs: 4_256_000,
    profit: 1_624_000,
  },
  {
    id: "PR-008",
    product: "Bridgestone Ecopia EP300",
    category: "Ban",
    city: "Deli Serdang",
    qty: 30,
    revenue: 39_300_000,
    cogs: 31_800_000,
    profit: 7_500_000,
  },
];

export interface PurchaseOrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  discount: number;
}

export interface PurchaseOrderRecord {
  id: string;
  channel: "Distributor" | "Store";
  number: string;
  date: string;
  supplier: string;
  store: string;
  createdBy: string;
  grandTotal: number;
  status: string;
  receiptStatus: string;
  createdAt: string;
  items: PurchaseOrderItem[];
}

export const purchaseOrders: PurchaseOrderRecord[] = [
  {
    id: "PO-001",
    channel: "Distributor",
    number: "PO-2601",
    date: "06 Jan 2026",
    supplier: "PT Michelin Indonesia",
    store: "WheelsKopi Pusat",
    createdBy: "Admin Wheels",
    grandTotal: 22_200_000,
    status: "Completed",
    receiptStatus: "Diterima",
    createdAt: "06 Jan 2026 09:20",
    items: [
      {
        id: "IT-001",
        name: "Michelin Pilot Sport 4",
        qty: 12,
        price: 1_850_000,
        discount: 0,
      },
    ],
  },
  {
    id: "PO-002",
    channel: "Store",
    number: "PO-2602",
    date: "14 Jan 2026",
    supplier: "PT Bridgestone Tire",
    store: "WheelsKopi Binjai",
    createdBy: "Admin Wheels",
    grandTotal: 11_200_000,
    status: "Draft",
    receiptStatus: "Menunggu",
    createdAt: "14 Jan 2026 11:05",
    items: [
      {
        id: "IT-002",
        name: "Bridgestone Turanza T005",
        qty: 8,
        price: 1_400_000,
        discount: 0,
      },
    ],
  },
  {
    id: "PO-003",
    channel: "Store",
    number: "PO-2603",
    date: "03 Feb 2026",
    supplier: "CV Mitra Ban Sejahtera",
    store: "WheelsKopi Deli Serdang",
    createdBy: "Siti Aminah",
    grandTotal: 17_600_000,
    status: "Completed",
    receiptStatus: "Diterima",
    createdAt: "03 Feb 2026 10:12",
    items: [
      {
        id: "IT-003",
        name: "GT Radial Champiro HPY",
        qty: 16,
        price: 1_100_000,
        discount: 0,
      },
    ],
  },
  {
    id: "PO-004",
    channel: "Distributor",
    number: "PO-2604",
    date: "20 Feb 2026",
    supplier: "CV Velg Nusantara",
    store: "WheelsKopi Showroom",
    createdBy: "Admin Wheels",
    grandTotal: 15_600_000,
    status: "Completed",
    receiptStatus: "Diterima",
    createdAt: "20 Feb 2026 14:40",
    items: [
      {
        id: "IT-004",
        name: "HRE FlowForm FF11",
        qty: 4,
        price: 3_900_000,
        discount: 0,
      },
    ],
  },
  {
    id: "PO-005",
    channel: "Store",
    number: "PO-2605",
    date: "05 Mar 2026",
    supplier: "PT Bridgestone Tire",
    store: "WheelsKopi Pusat",
    createdBy: "Dewi Lestari",
    grandTotal: 10_600_000,
    status: "Draft",
    receiptStatus: "Menunggu",
    createdAt: "05 Mar 2026 08:55",
    items: [
      {
        id: "IT-005",
        name: "Bridgestone Ecopia EP300",
        qty: 10,
        price: 1_060_000,
        discount: 0,
      },
    ],
  },
];
