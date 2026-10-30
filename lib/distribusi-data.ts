import { stockItems, suppliers } from "./dashboard-data";

export type DistribusiCategory = "Ban" | "Others";

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
}

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
}

export const othersCategories = [
  "Velg",
  "Shock Absorber",
  "Per",
  "Coilover",
  "Cakram",
];

const seededTires: DistribusiItem[] = stockItems.map((item) => ({
  id: item.id,
  kategori: "Ban",
  namaBarang: `${item.brand} ${item.name}`,
  subKategori: item.brand,
  supplier: suppliers.find((supplier) => supplier.brand === item.brand)?.name ?? "PT Mitra Ban Nusantara",
  ukuran: item.size,
  ring: "",
  hargaModalAsli: Math.round(item.price * 0.78),
  hargaModalToko: item.price,
  stok: item.stock,
  gambar: "",
}));

export const initialDistribusiItems: DistribusiItem[] = [
  ...seededTires,
  {
    id: "WK-9001",
    kategori: "Others",
    namaBarang: "Velg Racing HSR Ring 17",
    subKategori: "Velg",
    supplier: "PT Velg Nusantara",
    ukuran: "PCD 5x114",
    ring: "R17",
    hargaModalAsli: 2400000,
    hargaModalToko: 2950000,
    stok: 12,
    gambar: "",
  },
  {
    id: "WK-9002",
    kategori: "Others",
    namaBarang: "Shock Absorber KYB Belakang",
    subKategori: "Shock Absorber",
    supplier: "PT Kayaba Indonesia",
    ukuran: "-",
    ring: "",
    hargaModalAsli: 420000,
    hargaModalToko: 550000,
    stok: 5,
    gambar: "",
  },
];
