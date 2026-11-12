export interface SupplierRecord {
  id: string;
  tipe: "Perorangan" | "Badan Usaha";
  name: string;
  contactPerson: string;
  email: string;
  primaryPhone: string;
  phone: string;
  fileDokumen: string;
  createdAt: string;
  history: string[];
}

export interface StoreRecord {
  id: string;
  warehouse: string;
  storeName: string;
  code: string;
  province: string;
  locationType: string;
  status: string;
  primaryPhone: string;
  secondaryPhone: string;
  letterFile: string;
  createdAt: string;
  history: string[];
}

export interface PaymentRecord {
  id: string;
  name: string;
  status: "Aktif" | "Tidak Aktif";
  createdAt: string;
  history: string[];
}

export interface ServiceRecord {
  id: string;
  name: string;
  serviceValue: number;
  createdAt: string;
  history: string[];
}

export interface LibraryCarRecord {
  id: string;
  merk: string;
  type: string;
  pcd: string;
  cb: string;
  et: string;
  sizeBan: string;
  sizeVelg: string;
  createdAt: string;
  history: string[];
}

export interface CommunityRecord {
  id: string;
  name: string;
  leader: string;
  status: "Aktif" | "Tidak Aktif";
  createdAt: string;
  history: string[];
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: string;
  phone: string;
  store: string;
  fotoKtp: string;
  status: "Aktif" | "Nonaktif";
  gajiPokok: number;
  periodeGaji: "Mingguan" | "Bulanan";
  hariGajian: string;
}

export interface RolePermission {
  roleName: string;
  permissions: string[];
}

export const roles = [
  "Administrator",
  "Kepala Toko",
  "Admin Kantor",
  "Kasir Toko",
  "Mekanik",
  "Finance",
  "Staff Gudang",
];

export const rolePermissions: RolePermission[] = [
  {
    roleName: "Administrator",
    permissions: [],
  },
  {
    roleName: "Kepala Toko",
    permissions: [
      "dashboard_view",
      "product_view",
      "product_input",
      "product_edit",
      "product_delete",
      "supplier_view",
      "supplier_input",
      "supplier_edit",
      "supplier_delete",
      "user_view",
      "user_input",
      "user_edit",
      "user_delete",
      "store_view",
      "store_input",
      "store_edit",
      "store_delete",
      "payment_view",
      "payment_input",
      "payment_edit",
      "payment_delete",
      "service_view",
      "service_input",
      "service_edit",
      "service_delete",
      "library_view",
      "library_input",
      "library_edit",
      "library_delete",
      "community_view",
      "community_input",
      "community_edit",
      "community_delete",
      "customer_view",
      "customer_input",
      "customer_edit",
      "customer_delete",
      "discount_view",
      "discount_input",
      "discount_edit",
      "discount_delete",
      "distribusi_view",
      "distribusi_input",
      "distribusi_edit",
      "distribusi_delete",
      "purchase-order_view",
      "purchase-order_input",
      "purchase-order_edit",
      "purchase-order_delete",
      "receipt_view",
      "receipt_input",
      "sellout_view",
      "sellout_input",
      "sellout_edit",
      "sellout_delete",
      "invoice_view",
      "invoice_input",
      "movement_view",
      "movement_input",
      "movement_delete",
      "daily-spend_view",
      "daily-spend_input",
      "daily-spend_edit",
      "daily-spend_delete",
      "finance-store_view",
      "finance-store_input",
      "finance-store_edit",
      "finance-store_delete",
      "sales-order_view",
      "sellout-global_view",
      "sellout-global_input",
      "sellout-global_edit",
      "sellout-global_delete",
      "daily-spend-global_view",
      "daily-spend-global_edit",
      "daily-spend-global_delete",
      "trade-sellout_view",
      "trade-sellout_input",
      "trade-sellout_edit",
      "trade-sellout_delete",
      "mekanik_view",
      "mekanik_edit",
      "report_view",
      "profit_view",
    ],
  },
  {
    roleName: "Admin Kantor",
    permissions: [
      "dashboard_view",
      "product_view",
      "product_input",
      "product_edit",
      "product_delete",
      "supplier_view",
      "supplier_input",
      "supplier_edit",
      "supplier_delete",
      "store_view",
      "store_input",
      "store_edit",
      "store_delete",
      "user_view",
      "user_input",
      "user_edit",
      "user_delete",
      "payment_view",
      "payment_input",
      "payment_edit",
      "payment_delete",
      "service_view",
      "service_input",
      "service_edit",
      "service_delete",
      "library_view",
      "library_input",
      "library_edit",
      "library_delete",
      "community_view",
      "community_input",
      "community_edit",
      "community_delete",
      "customer_view",
      "customer_input",
      "customer_edit",
      "customer_delete",
      "discount_view",
      "discount_input",
      "discount_edit",
      "discount_delete",
      "distribusi_view",
      "purchase-order_view",
      "purchase-order_input",
      "purchase-order_edit",
      "purchase-order_delete",
      "receipt_view",
      "receipt_input",
      "sellout_view",
      "sellout_input",
      "sellout_edit",
      "sellout_delete",
      "invoice_view",
      "invoice_input",
      "movement_view",
      "movement_input",
      "movement_delete",
      "daily-spend_view",
      "daily-spend_input",
      "daily-spend_edit",
      "daily-spend_delete",
      "finance-store_view",
      "finance-store_input",
      "finance-store_edit",
      "finance-store_delete",
      "sales-order_view",
      "sellout-global_view",
      "sellout-global_input",
      "sellout-global_edit",
      "sellout-global_delete",
      "daily-spend-global_view",
      "daily-spend-global_edit",
      "trade-sellout_view",
      "trade-sellout_input",
      "trade-sellout_edit",
      "trade-sellout_delete",
      "report_view",
      "profit_view",
    ],
  },
  {
    roleName: "Kasir Toko",
    permissions: [
      "dashboard_view",
      "product_view",
      "customer_view",
      "customer_input",
      "sellout_view",
      "sellout_input",
      "invoice_view",
      "sales-order_view",
      "sellout-global_view",
    ],
  },
  {
    roleName: "Mekanik",
    permissions: [
      "dashboard_view",
      "mekanik_view",
      "mekanik_edit",
      "product_view",
      "customer_view",
      "library_view",
      "sellout_view",
    ],
  },
  {
    roleName: "Finance",
    permissions: [
      "dashboard_view",
      "product_view",
      "supplier_view",
      "purchase-order_view",
      "receipt_view",
      "sellout_view",
      "invoice_view",
      "finance-store_view",
      "finance-store_input",
      "finance-store_edit",
      "daily-spend_view",
      "daily-spend-global_view",
      "trade-sellout_view",
      "report_view",
      "profit_view",
    ],
  },
  {
    roleName: "Staff Gudang",
    permissions: [
      "dashboard_view",
      "product_view",
      "product_input",
      "product_edit",
      "distribusi_view",
      "distribusi_input",
      "distribusi_edit",
      "purchase-order_view",
      "receipt_view",
      "receipt_input",
      "movement_view",
      "movement_input",
      "sellout_view",
    ],
  },
];

export const suppliers: SupplierRecord[] = [
  {
    id: "SUP-001",
    tipe: "Badan Usaha",
    name: "PT Michelin Indonesia",
    contactPerson: "Andi Pratama",
    email: "sales@michelin.co.id",
    primaryPhone: "021-555-0101",
    phone: "0812-1000-2001",
    fileDokumen: "NPWP-Michelin.pdf",
    createdAt: "12 Jan 2026",
    history: ["Data awal demo"],
  },
  {
    id: "SUP-002",
    tipe: "Badan Usaha",
    name: "PT Bridgestone Tire",
    contactPerson: "Rina Kartika",
    email: "order@bridgestone.co.id",
    primaryPhone: "021-555-0102",
    phone: "0812-1000-2002",
    fileDokumen: "NPWP-Bridgestone.pdf",
    createdAt: "12 Jan 2026",
    history: ["Data awal demo"],
  },
  {
    id: "SUP-003",
    tipe: "Perorangan",
    name: "CV Mitra Ban Sejahtera",
    contactPerson: "Budi Santoso",
    email: "mitraban@gmail.com",
    primaryPhone: "021-555-0103",
    phone: "0813-2000-3003",
    fileDokumen: "KTP-Budi.pdf",
    createdAt: "18 Feb 2026",
    history: ["Data awal demo"],
  },
  {
    id: "SUP-004",
    tipe: "Badan Usaha",
    name: "CV Velg Nusantara",
    contactPerson: "Fajar Nugroho",
    email: "sales@velgnusantara.id",
    primaryPhone: "061-555-0204",
    phone: "0813-2000-4004",
    fileDokumen: "NPWP-VelgNusantara.pdf",
    createdAt: "05 Mar 2026",
    history: ["Data awal demo"],
  },
];

export const stores: StoreRecord[] = [
  {
    id: "STR-001",
    warehouse: "Gudang Medan",
    storeName: "WheelsKopi Pusat",
    code: "WK-MDN-01",
    province: "Sumatera Utara",
    locationType: "Dalam kota",
    status: "ACTIVE",
    primaryPhone: "061-8455-100",
    secondaryPhone: "0812-6000-1001",
    letterFile: "Surat-Toko-Pusat.pdf",
    createdAt: "10 Jan 2026",
    history: ["Dibuat pada 10 Jan 2026"],
  },
  {
    id: "STR-002",
    warehouse: "Gudang Binjai",
    storeName: "WheelsKopi Binjai",
    code: "WK-BNJ-02",
    province: "Sumatera Utara",
    locationType: "Luar kota",
    status: "ACTIVE",
    primaryPhone: "061-8455-200",
    secondaryPhone: "0812-6000-1002",
    letterFile: "Surat-Toko-Binjai.pdf",
    createdAt: "18 Jan 2026",
    history: ["Dibuat pada 18 Jan 2026"],
  },
  {
    id: "STR-003",
    warehouse: "Gudang Deli Serdang",
    storeName: "WheelsKopi Deli Serdang",
    code: "WK-DLS-03",
    province: "Sumatera Utara",
    locationType: "Luar kota",
    status: "NEW",
    primaryPhone: "061-8455-300",
    secondaryPhone: "0812-6000-1003",
    letterFile: "Surat-Toko-Deli.pdf",
    createdAt: "02 Feb 2026",
    history: ["Dibuat pada 02 Feb 2026"],
  },
  {
    id: "STR-004",
    warehouse: "Gudang Medan",
    storeName: "WheelsKopi Showroom",
    code: "WK-SHM-04",
    province: "Sumatera Utara",
    locationType: "Dalam kota",
    status: "ACTIVE",
    primaryPhone: "061-8455-400",
    secondaryPhone: "0812-6000-1004",
    letterFile: "Surat-Showroom.pdf",
    createdAt: "20 Feb 2026",
    history: ["Dibuat pada 20 Feb 2026"],
  },
];

export const payments: PaymentRecord[] = [
  {
    id: "PAY-001",
    name: "Cash",
    status: "Aktif",
    createdAt: "01 Jan 2026",
    history: ["Dibuat pada 01 Jan 2026"],
  },
  {
    id: "PAY-002",
    name: "Transfer Bank",
    status: "Aktif",
    createdAt: "01 Jan 2026",
    history: ["Dibuat pada 01 Jan 2026"],
  },
  {
    id: "PAY-003",
    name: "QRIS",
    status: "Aktif",
    createdAt: "01 Jan 2026",
    history: ["Dibuat pada 01 Jan 2026"],
  },
  {
    id: "PAY-004",
    name: "Kredivo",
    status: "Aktif",
    createdAt: "02 Jan 2026",
    history: ["Dibuat pada 02 Jan 2026"],
  },
  {
    id: "PAY-005",
    name: "Akulaku",
    status: "Aktif",
    createdAt: "02 Jan 2026",
    history: ["Dibuat pada 02 Jan 2026"],
  },
  {
    id: "PAY-006",
    name: "ShopeePay",
    status: "Tidak Aktif",
    createdAt: "03 Jan 2026",
    history: ["Dibuat pada 03 Jan 2026"],
  },
  {
    id: "PAY-007",
    name: "OVO",
    status: "Aktif",
    createdAt: "03 Jan 2026",
    history: ["Dibuat pada 03 Jan 2026"],
  },
  {
    id: "PAY-008",
    name: "Home Credit",
    status: "Tidak Aktif",
    createdAt: "04 Jan 2026",
    history: ["Dibuat pada 04 Jan 2026"],
  },
  {
    id: "PAY-009",
    name: "Tokopedia",
    status: "Aktif",
    createdAt: "04 Jan 2026",
    history: ["Dibuat pada 04 Jan 2026"],
  },
];

export const services: ServiceRecord[] = [
  {
    id: "SRV-001",
    name: "Spooring & Balancing",
    serviceValue: 350_000,
    createdAt: "05 Jan 2026",
    history: ["Dibuat pada 05 Jan 2026"],
  },
  {
    id: "SRV-002",
    name: "Tambal Ban Tubeless",
    serviceValue: 75_000,
    createdAt: "05 Jan 2026",
    history: ["Dibuat pada 05 Jan 2026"],
  },
  {
    id: "SRV-003",
    name: "Pasang & Lepas Velg",
    serviceValue: 200_000,
    createdAt: "12 Jan 2026",
    history: ["Dibuat pada 12 Jan 2026"],
  },
  {
    id: "SRV-004",
    name: "Nitrogen Filling",
    serviceValue: 50_000,
    createdAt: "20 Jan 2026",
    history: ["Dibuat pada 20 Jan 2026"],
  },
  {
    id: "SRV-005",
    name: "Cuci Ban & Velg",
    serviceValue: 40_000,
    createdAt: "02 Feb 2026",
    history: ["Dibuat pada 02 Feb 2026"],
  },
];

export const libraryCars: LibraryCarRecord[] = [
  {
    id: "CAR-001",
    merk: "Honda",
    type: "Brio Satya",
    pcd: "4x100",
    cb: "54.1",
    et: "ET45",
    sizeBan: "175/65 R14\n185/55 R15",
    sizeVelg: "5.5J R14\n6J R15",
    createdAt: "08 Jan 2026",
    history: ["Dibuat pada 08 Jan 2026"],
  },
  {
    id: "CAR-002",
    merk: "Toyota",
    type: "Avanza",
    pcd: "5x114.3",
    cb: "60.1",
    et: "ET39",
    sizeBan: "185/65 R15\n195/60 R16",
    sizeVelg: "6J R15\n6.5J R16",
    createdAt: "08 Jan 2026",
    history: ["Dibuat pada 08 Jan 2026"],
  },
  {
    id: "CAR-003",
    merk: "Honda",
    type: "CR-V",
    pcd: "5x114.3",
    cb: "64.1",
    et: "ET40",
    sizeBan: "235/60 R18\n235/55 R19",
    sizeVelg: "7.5J R18\n8J R19",
    createdAt: "15 Jan 2026",
    history: ["Dibuat pada 15 Jan 2026"],
  },
  {
    id: "CAR-004",
    merk: "Mitsubishi",
    type: "Pajero Sport",
    pcd: "6x139.7",
    cb: "67.1",
    et: "ET33",
    sizeBan: "265/65 R17\n265/60 R18",
    sizeVelg: "7.5J R17\n8J R18",
    createdAt: "22 Jan 2026",
    history: ["Dibuat pada 22 Jan 2026"],
  },
  {
    id: "CAR-005",
    merk: "BMW",
    type: "320i",
    pcd: "5x112",
    cb: "66.6",
    et: "ET34",
    sizeBan: "225/45 R18\n225/40 R19",
    sizeVelg: "8J R18\n8J R19",
    createdAt: "03 Feb 2026",
    history: ["Dibuat pada 03 Feb 2026"],
  },
];

export const communities: CommunityRecord[] = [
  {
    id: "COM-001",
    name: "Wheels Kopi Owners",
    leader: "Rizky Ramadhan",
    status: "Aktif",
    createdAt: "10 Jan 2026",
    history: ["Dibuat pada 10 Jan 2026"],
  },
  {
    id: "COM-002",
    name: "Komunitas Ban Tubeless",
    leader: "Sari Wulandari",
    status: "Aktif",
    createdAt: "22 Feb 2026",
    history: ["Dibuat pada 22 Feb 2026"],
  },
  {
    id: "COM-003",
    name: "Kopi & Knalpot",
    leader: "Dedi Kurniawan",
    status: "Tidak Aktif",
    createdAt: "05 Mar 2026",
    history: ["Dibuat pada 05 Mar 2026"],
  },
];

export const seedUsers: UserRecord[] = [
  {
    id: "USR-KT-001",
    name: "Baihaqie Arrafi",
    email: "baihqiearrafi@gmail.com",
    username: "baihqiearrafi",
    password: "baihaqiearrafi",
    role: "Administrator",
    store: "WheelsKopi Pusat",
    phone: "0812-6000-0001",
    fotoKtp: "",
    status: "Aktif",
    gajiPokok: 8_000_000,
    periodeGaji: "Bulanan",
    hariGajian: "25",
  },
  {
    id: "USR-KT-002",
    name: "Admin Wheels",
    email: "admin@wheelskopi.com",
    username: "admin",
    password: "admin123",
    role: "Kepala Toko",
    store: "WheelsKopi Pusat",
    phone: "0812-6000-0002",
    fotoKtp: "",
    status: "Aktif",
    gajiPokok: 8_000_000,
    periodeGaji: "Bulanan",
    hariGajian: "25",
  },
  {
    id: "USR-AK-001",
    name: "Admin Kantor",
    email: "adminkantor@wheelskopi.id",
    username: "adminkantor",
    password: "adminkantor123",
    role: "Admin Kantor",
    store: "WheelsKopi Pusat",
    phone: "0812-6000-0003",
    fotoKtp: "",
    status: "Aktif",
    gajiPokok: 6_500_000,
    periodeGaji: "Bulanan",
    hariGajian: "25",
  },
  {
    id: "USR-KSR-001",
    name: "Kasir Toko",
    email: "kasir@wheelskopi.id",
    username: "kasir",
    password: "kasir123",
    role: "Kasir Toko",
    store: "WheelsKopi Pusat",
    phone: "0812-6000-0004",
    fotoKtp: "",
    status: "Aktif",
    gajiPokok: 4_200_000,
    periodeGaji: "Bulanan",
    hariGajian: "25",
  },
  {
    id: "USR-MKN-001",
    name: "Mekanik",
    email: "mekanik@wheelskopi.id",
    username: "mekanik",
    password: "mekanik123",
    role: "Mekanik",
    store: "WheelsKopi Binjai",
    phone: "0812-6000-0005",
    fotoKtp: "",
    status: "Aktif",
    gajiPokok: 4_000_000,
    periodeGaji: "Bulanan",
    hariGajian: "25",
  },
  {
    id: "USR-KT-003",
    name: "Kepala Toko",
    email: "kepalatoko@wheelskopi.id",
    username: "kepalatoko",
    password: "kepalatoko123",
    role: "Kepala Toko",
    store: "WheelsKopi Binjai",
    phone: "0812-6000-0006",
    fotoKtp: "",
    status: "Aktif",
    gajiPokok: 7_000_000,
    periodeGaji: "Bulanan",
    hariGajian: "25",
  },
  {
    id: "USR-FIN-001",
    name: "Finance",
    email: "finance@wheelskopi.id",
    username: "finance",
    password: "finance123",
    role: "Finance",
    store: "WheelsKopi Pusat",
    phone: "0812-6000-0007",
    fotoKtp: "",
    status: "Aktif",
    gajiPokok: 5_500_000,
    periodeGaji: "Bulanan",
    hariGajian: "25",
  },
  {
    id: "USR-GDG-001",
    name: "Staff Gudang",
    email: "gudang@wheelskopi.id",
    username: "gudang",
    password: "gudang123",
    role: "Staff Gudang",
    store: "WheelsKopi Pusat",
    phone: "0812-6000-0008",
    fotoKtp: "",
    status: "Aktif",
    gajiPokok: 4_500_000,
    periodeGaji: "Bulanan",
    hariGajian: "25",
  },
];

export const storeNames = stores.map((store) => store.storeName);
