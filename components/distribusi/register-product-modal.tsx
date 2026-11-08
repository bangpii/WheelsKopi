"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Check,
  ImagePlus,
  PackagePlus,
  Upload,
  X,
  Disc3,
  Box,
} from "lucide-react";
import type {
  DistribusiCategory,
  DistribusiFormValues,
} from "@/lib/distribusi-data";
import { othersCategories } from "@/lib/distribusi-data";
import {
  BAN_BRANDS,
  BAN_BRAND_LIST,
  BAN_RING_OPTIONS,
} from "@/lib/ban-reference-data";
import type { Product } from "@/lib/context/data-context";

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface RegisterProductModalProps {
  suppliers: { name: string }[];
  initialData?: Product | null; // Mendukung mode Edit
  onClose: () => void;
  onSubmit: (values: DistribusiFormValues) => void;
}

/* ------------------------------------------------------------------ */
/*  Konstanta Form                                                    */
/* ------------------------------------------------------------------ */

const TODAY = new Date().toISOString().slice(0, 10);

const emptyForm: DistribusiFormValues = {
  kategori: "Ban",
  subKategori: "",
  namaBarang: "",
  ukuran: "",
  ring: "",
  hargaModalAsli: "",
  hargaModalToko: "",
  stok: "",
  gambar: "",
  supplier: "",

  tanggal: TODAY,
  pembayaran: "Lunas",
  jenisBarang: "",
  owner: "",
  paymentDate: TODAY,
  nomorBon: "",
  notes: "",

  merekBan: "",
  typeBan: "",
  ukuranTapak: "",
  ukuranTinggi: "",
  hargaTagihanToko: "",

  merekProduk: "",
  kodeBarang: "",
  typeVelg: "",
  wide: "",
  hole: "",
  et: "",
  colour: "",
  item: "",
  gtySet: "",
  standarPrice: "",
  discount: "",
  dealerPrice: "",
  dprice: "",
  discountType: "Cash",
  rawPrice: "",
  sswDisc2: "",
  rawPriceAfterDisc: "",
  shippingFee: "",
  shippingPerSet: "",
  subTotalModalTP: "",
  modal1Set: "",
  paymentTipe: "",
  up: "",
  modalToko: "",
  arrivalDate: TODAY,
  stockOwner: "",
};

const fieldClass =
  "w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-ring/40";

const labelClass =
  "mb-1.5 block text-[12px] font-semibold tracking-wide text-muted-foreground uppercase";

/* ------------------------------------------------------------------ */
/*  Daftar Field Velg & Others                                        */
/* ------------------------------------------------------------------ */

type VelgNumericField =
  | "gtySet"
  | "standarPrice"
  | "discount"
  | "dealerPrice"
  | "dprice"
  | "rawPrice"
  | "sswDisc2"
  | "rawPriceAfterDisc"
  | "shippingFee"
  | "shippingPerSet"
  | "subTotalModalTP"
  | "modal1Set"
  | "up"
  | "modalToko";

type VelgTextField = "discountType" | "paymentTipe";

const VELG_NUMERIC_FIELDS: ReadonlyArray<{
  key: VelgNumericField;
  label: string;
}> = [
  { key: "gtySet", label: "GTY (Set)" },
  { key: "standarPrice", label: "Standar Price" },
  { key: "discount", label: "Discount" },
  { key: "dealerPrice", label: "Dealer Price" },
  { key: "dprice", label: "Dprice" },
  { key: "rawPrice", label: "Raw Price" },
  { key: "sswDisc2", label: "SSW Disc 2%" },
  { key: "rawPriceAfterDisc", label: "Raw Price (after disc)" },
  { key: "shippingFee", label: "Shipping Fee" },
  { key: "shippingPerSet", label: "Shipping / Set" },
  { key: "subTotalModalTP", label: "Sub Total Modal TP" },
  { key: "modal1Set", label: "Modal 1 Set" },
  { key: "up", label: "UP" },
  { key: "modalToko", label: "Modal Toko" },
];

const VELG_TEXT_FIELDS: ReadonlyArray<{
  key: VelgTextField;
  label: string;
}> = [
  { key: "discountType", label: "Discount Type / Cash" },
  { key: "paymentTipe", label: "Payment Tipe" },
];

/* ------------------------------------------------------------------ */
/*  Helper Build Item Code (Velg)                                     */
/* ------------------------------------------------------------------ */

function buildItemCode(v: DistribusiFormValues): string {
  const merek = (v.merekProduk ?? "").toUpperCase().trim();
  const type = (v.typeVelg ?? "").trim();
  const ring = (v.ring ?? "").replace(/^R/i, "").trim();
  const wide = (v.wide ?? "").replace(".", ",").trim();
  const hole = (v.hole ?? "").trim();
  const et = (v.et ?? "").trim();
  const colour = (v.colour ?? "").toUpperCase().trim();

  let seq = "";
  if (v.tanggal) {
    const d = new Date(v.tanggal);
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

/* ------------------------------------------------------------------ */
/*  Komponen Modal                                                    */
/* ------------------------------------------------------------------ */

export function RegisterProductModal({
  suppliers,
  initialData,
  onClose,
  onSubmit,
}: RegisterProductModalProps) {
  
  // Inisialisasi state: Cek apakah sedang Edit atau Tambah Baru
  const [formData, setFormData] = useState<DistribusiFormValues>(() => {
    if (initialData) {
      return {
        ...initialData,
        kategori: initialData.kategoriUtama,
        // Konversi semua field angka ke string untuk form input
        hargaModalAsli: String(initialData.hargaModalAsli ?? ""),
        hargaModalToko: String(initialData.hargaModalToko ?? ""),
        stok: String(initialData.stok ?? ""),
        hargaTagihanToko: String(initialData.hargaTagihanToko ?? ""),
        gtySet: String(initialData.gtySet ?? ""),
        standarPrice: String(initialData.standarPrice ?? ""),
        discount: String(initialData.discount ?? ""),
        dealerPrice: String(initialData.dealerPrice ?? ""),
        dprice: String(initialData.dprice ?? ""),
        rawPrice: String(initialData.rawPrice ?? ""),
        sswDisc2: String(initialData.sswDisc2 ?? ""),
        rawPriceAfterDisc: String(initialData.rawPriceAfterDisc ?? ""),
        shippingFee: String(initialData.shippingFee ?? ""),
        shippingPerSet: String(initialData.shippingPerSet ?? ""),
        subTotalModalTP: String(initialData.subTotalModalTP ?? ""),
        modal1Set: String(initialData.modal1Set ?? ""),
        up: String(initialData.up ?? ""),
        modalToko: String(initialData.modalToko ?? ""),
      } as unknown as DistribusiFormValues;
    }
    return {
      ...emptyForm,
      supplier: suppliers[0]?.name ?? "",
    };
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const update = (patch: Partial<DistribusiFormValues>) =>
    setFormData((prev) => ({ ...prev, ...patch }));

  const setKategori = (kategori: DistribusiCategory) => {
    setFormData((prev) => ({
      ...prev,
      kategori,
      subKategori: "",
      ring: "",
      ukuran: "",
      merekBan: "",
      typeBan: "",
      ukuranTapak: "",
      ukuranTinggi: "",
      merekProduk: "",
      typeVelg: "",
      wide: "",
      hole: "",
      et: "",
      colour: "",
      item: "",
    }));
  };

  const setSubKategori = (subKategori: string) => {
    setFormData((prev) => ({
      ...prev,
      subKategori,
      ...(subKategori !== "Velg"
        ? { ring: "", wide: "", hole: "", et: "", colour: "", item: "" }
        : {}),
    }));
  };

  const typeBanOptions = useMemo(
    () => (formData.merekBan ? BAN_BRANDS[formData.merekBan] ?? [] : []),
    [formData.merekBan],
  );

  const autoItem = useMemo(
    () =>
      formData.kategori === "Others" && formData.subKategori === "Velg"
        ? buildItemCode(formData)
        : "",
    [formData],
  );

  const isBan = formData.kategori === "Ban";
  const isOthers = formData.kategori === "Others";
  const isVelg = isOthers && formData.subKategori === "Velg";

  const validate = (): string | null => {
    if (!formData.supplier) return "Supplier wajib diisi.";
    // Perbaikan: Jika sedang Edit dan tidak upload gambar baru, izinkan simpan (pakai gambar lama)
    if (!formData.gambar && !initialData) return "Upload gambar produk terlebih dahulu.";
    
    if (!formData.stok) return "Stok wajib diisi.";

    if (isBan) {
      if (!formData.merekBan) return "Merek ban wajib dipilih.";
      if (!formData.typeBan) return "Type ban wajib dipilih.";
      if (!formData.ring) return "Ring wajib dipilih.";
      if (!formData.ukuranTapak) return "Tapak / lebar wajib diisi.";
      if (!formData.ukuranTinggi) return "Tinggi wajib diisi.";
    }

    if (isOthers) {
      if (!formData.subKategori) return "Jenis produk wajib dipilih.";
      if (!formData.merekProduk) return "Merek produk wajib diisi.";

      if (isVelg) {
        if (!formData.ring) return "Ring velg wajib dipilih.";
        if (!formData.typeVelg) return "Type velg wajib diisi.";
        if (!formData.wide) return "Wide wajib diisi.";
        if (!formData.hole) return "Hole wajib diisi.";
        if (!formData.et) return "ET wajib diisi.";
        if (!formData.colour) return "Colour wajib diisi.";
      }
    }

    if (!formData.hargaModalAsli) return "Harga modal asli wajib diisi.";
    if (!formData.hargaModalToko) return "Harga tagihan toko wajib diisi.";

    return null;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    onSubmit({
      ...formData,
      item: isVelg ? autoItem : "",
      stok: formData.stok || "0",
    });
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => update({ gambar: String(reader.result ?? "") });
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 sm:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-md supports-backdrop-filter:bg-black/35"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-product-title"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border-white/60 liquid-glass"
      >
        <div className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
        <div className="pointer-events-none absolute -right-20 -bottom-24 size-64 rounded-full bg-(--chart-2)/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />

        <div className="relative flex items-start justify-between gap-4 px-6 pt-6 pb-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
              <PackagePlus className="size-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.26em] text-primary uppercase">
                {initialData ? "Edit" : "Register"}
              </p>
              <h2
                id="register-product-title"
                className="font-display text-xl font-semibold tracking-tight"
              >
                {initialData ? "Perbarui Produk" : "Produk Baru"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form"
            className="flex size-9 items-center justify-center rounded-xl border border-border/70 bg-background/50 text-muted-foreground backdrop-blur-sm transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative flex min-h-0 flex-1 flex-col"
        >
          <div className="no-scrollbar min-h-0 flex-1 space-y-6 overflow-y-auto px-6 pb-6 sm:px-8">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-background/40 p-1.5 backdrop-blur-sm">
              {(["Ban", "Others"] as const).map((kategori) => {
                const Icon = kategori === "Ban" ? Disc3 : Box;
                return (
                  <button
                    key={kategori}
                    type="button"
                    onClick={() => setKategori(kategori)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                      formData.kategori === kategori
                        ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_var(--primary)]"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    Daftar {kategori}
                  </button>
                );
              })}
            </div>

            {/* Supplier — BISA DIUBAH */}
            <div>
              <label className={labelClass} htmlFor="supplier">
                Pilih Supplier
              </label>
              <select
                id="supplier"
                required
                value={formData.supplier}
                onChange={(e) => update({ supplier: e.target.value })}
                className={fieldClass}
              >
                <option value="">-- Pilih Supplier --</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.name} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            {isBan && (
              <section className="space-y-5 rounded-2xl border border-border/60 bg-background/30 p-4 backdrop-blur-sm">
                <h3 className="font-display text-sm font-semibold">
                  Data Ban
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="merekBan">
                      Merek Ban (Wajib)
                    </label>
                    <select
                      id="merekBan"
                      required
                      value={formData.merekBan ?? ""}
                      onChange={(e) =>
                        update({ merekBan: e.target.value, typeBan: "" })
                      }
                      className={fieldClass}
                    >
                      <option value="">-- Pilih Merek --</option>
                      {BAN_BRAND_LIST.map((merek) => (
                        <option key={merek} value={merek}>
                          {merek}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="typeBan">
                      Type Ban (Wajib)
                    </label>
                    <select
                      id="typeBan"
                      required
                      value={formData.typeBan ?? ""}
                      onChange={(e) => update({ typeBan: e.target.value })}
                      disabled={!formData.merekBan}
                      className={`${fieldClass} disabled:opacity-50`}
                    >
                      <option value="">-- Pilih Type --</option>
                      {typeBanOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="ringBan">
                      Ring (Wajib)
                    </label>
                    <select
                      id="ringBan"
                      required
                      value={formData.ring}
                      onChange={(e) => update({ ring: e.target.value })}
                      className={fieldClass}
                    >
                      <option value="">-- Pilih Ring --</option>
                      {BAN_RING_OPTIONS.map((ring) => (
                        <option key={ring} value={ring}>
                          {ring}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass} htmlFor="tapak">
                        Tapak / Lebar
                      </label>
                      <input
                        id="tapak"
                        required
                        type="text"
                        value={formData.ukuranTapak ?? ""}
                        onChange={(e) =>
                          update({ ukuranTapak: e.target.value })
                        }
                        className={fieldClass}
                        placeholder="Cth: 195"
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="tinggi">
                        Tinggi
                      </label>
                      <input
                        id="tinggi"
                        required
                        type="text"
                        value={formData.ukuranTinggi ?? ""}
                        onChange={(e) =>
                          update({ ukuranTinggi: e.target.value })
                        }
                        className={fieldClass}
                        placeholder="Cth: 65"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="stokBan">
                      Stok (Wajib)
                    </label>
                    <input
                      id="stokBan"
                      required
                      min="0"
                      type="number"
                      value={formData.stok}
                      onChange={(e) => update({ stok: e.target.value })}
                      className={fieldClass}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="modalAsliBan">
                      Harga Modal Asli
                    </label>
                    <input
                      id="modalAsliBan"
                      required
                      min="0"
                      type="number"
                      value={formData.hargaModalAsli}
                      onChange={(e) =>
                        update({ hargaModalAsli: e.target.value })
                      }
                      className={fieldClass}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="tagihanTokoBan">
                      Harga Tagihan Toko
                    </label>
                    <input
                      id="tagihanTokoBan"
                      required
                      min="0"
                      type="number"
                      value={formData.hargaModalToko}
                      onChange={(e) =>
                        update({ hargaModalToko: e.target.value })
                      }
                      className={fieldClass}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="tanggalBan">
                      Tanggal / Bulan
                    </label>
                    <input
                      id="tanggalBan"
                      type="date"
                      value={formData.tanggal ?? ""}
                      onChange={(e) => update({ tanggal: e.target.value })}
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="bayarBan">
                      Pembayaran
                    </label>
                    <select
                      id="bayarBan"
                      value={formData.pembayaran ?? "Lunas"}
                      onChange={(e) =>
                        update({
                          pembayaran: e.target
                            .value as DistribusiFormValues["pembayaran"],
                        })
                      }
                      className={fieldClass}
                    >
                      <option value="Lunas">Lunas</option>
                      <option value="Bon">Bon</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="jenisBan">
                      Jenis Barang
                    </label>
                    <input
                      id="jenisBan"
                      type="text"
                      value={formData.jenisBarang ?? ""}
                      onChange={(e) => update({ jenisBarang: e.target.value })}
                      className={fieldClass}
                      placeholder="Cth: Ban Tubeless"
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="ownerBan">
                      Owner
                    </label>
                    <input
                      id="ownerBan"
                      type="text"
                      value={formData.owner ?? ""}
                      onChange={(e) => update({ owner: e.target.value })}
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="payDateBan">
                      Payment Date
                    </label>
                    <input
                      id="payDateBan"
                      type="date"
                      value={formData.paymentDate ?? ""}
                      onChange={(e) => update({ paymentDate: e.target.value })}
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass} htmlFor="nomorBonBan">
                      Nomor Bon
                    </label>
                    <input
                      id="nomorBonBan"
                      type="text"
                      value={formData.nomorBon ?? ""}
                      onChange={(e) => update({ nomorBon: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                </div>
              </section>
            )}

            {isOthers && (
              <>
                <div>
                  <label className={labelClass} htmlFor="jenisProduk">
                    Jenis Produk (Wajib)
                  </label>
                  <select
                    id="jenisProduk"
                    required
                    value={formData.subKategori}
                    onChange={(e) => setSubKategori(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">-- Pilih Jenis --</option>
                    {othersCategories.map((jenis) => (
                      <option key={jenis} value={jenis}>
                        {jenis}
                      </option>
                    ))}
                  </select>
                </div>

                <section className="space-y-5 rounded-2xl border border-border/60 bg-background/30 p-4 backdrop-blur-sm">
                  <h3 className="font-display text-sm font-semibold">
                    {isVelg ? "Data Velg" : "Data Produk Lain"}
                  </h3>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="merekProduk">
                        Merek Produk (Wajib)
                      </label>
                      <input
                        id="merekProduk"
                        required
                        type="text"
                        value={formData.merekProduk ?? ""}
                        onChange={(e) =>
                          update({ merekProduk: e.target.value })
                        }
                        className={fieldClass}
                        placeholder={isVelg ? "Cth: SSW" : "Cth: KYB"}
                      />
                    </div>

                    <div>
                      <label className={labelClass} htmlFor="typeProduk">
                        {isVelg ? "Type Velg (Wajib)" : "Keterangan"}
                      </label>
                      <input
                        id="typeProduk"
                        required={isVelg}
                        type="text"
                        value={
                          isVelg
                            ? formData.typeVelg ?? ""
                            : formData.namaBarang
                        }
                        onChange={(e) =>
                          isVelg
                            ? update({ typeVelg: e.target.value })
                            : update({ namaBarang: e.target.value })
                        }
                        className={fieldClass}
                        placeholder={
                          isVelg ? "Cth: S280" : "Cth: Shock Belakang"
                        }
                      />
                    </div>

                    {/* Spesifikasi Velg HANYA muncul untuk VELG */}
                    {isVelg && (
                      <>
                        <div>
                          <label className={labelClass} htmlFor="ringOthers">
                            Ring (Wajib)
                          </label>
                          <select
                            id="ringOthers"
                            required
                            value={formData.ring}
                            onChange={(e) => update({ ring: e.target.value })}
                            className={fieldClass}
                          >
                            <option value="">-- Pilih Ring --</option>
                            {BAN_RING_OPTIONS.map((ring) => (
                              <option key={ring} value={ring}>
                                {ring}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={labelClass} htmlFor="wide">
                            Wide (Wajib)
                          </label>
                          <input
                            id="wide"
                            required
                            type="text"
                            value={formData.wide ?? ""}
                            onChange={(e) => update({ wide: e.target.value })}
                            className={fieldClass}
                            placeholder="Cth: 9,5"
                          />
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="hole">
                            Hole (Wajib)
                          </label>
                          <input
                            id="hole"
                            required
                            type="text"
                            value={formData.hole ?? ""}
                            onChange={(e) => update({ hole: e.target.value })}
                            className={fieldClass}
                            placeholder="Cth: 6x139.7"
                          />
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="et">
                            ET (Wajib)
                          </label>
                          <input
                            id="et"
                            required
                            type="text"
                            value={formData.et ?? ""}
                            onChange={(e) => update({ et: e.target.value })}
                            className={fieldClass}
                            placeholder="Cth: 25"
                          />
                        </div>
                        <div>
                          <label className={labelClass} htmlFor="colour">
                            Colour (Wajib)
                          </label>
                          <input
                            id="colour"
                            required
                            type="text"
                            value={formData.colour ?? ""}
                            onChange={(e) => update({ colour: e.target.value })}
                            className={fieldClass}
                            placeholder="Cth: BMC"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={labelClass} htmlFor="itemAuto">
                            Item (auto)
                          </label>
                          <input
                            id="itemAuto"
                            readOnly
                            value={autoItem}
                            className={`${fieldClass} bg-muted/60 text-muted-foreground`}
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Harga & stok dasar (muncul untuk semua Others) */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                      <label className={labelClass} htmlFor="stokOthers">
                        Stok
                      </label>
                      <input
                        id="stokOthers"
                        required
                        min="0"
                        type="number"
                        value={formData.stok}
                        onChange={(e) => update({ stok: e.target.value })}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        htmlFor="modalAsliOthers"
                      >
                        Harga Modal Asli
                      </label>
                      <input
                        id="modalAsliOthers"
                        required
                        min="0"
                        type="number"
                        value={formData.hargaModalAsli}
                        onChange={(e) =>
                          update({ hargaModalAsli: e.target.value })
                        }
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        htmlFor="modalTokoOthers"
                      >
                        Harga Tagihan Toko
                      </label>
                      <input
                        id="modalTokoOthers"
                        required
                        min="0"
                        type="number"
                        value={formData.hargaModalToko}
                        onChange={(e) =>
                          update({ hargaModalToko: e.target.value })
                        }
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  {/* Field harga lengkap (muncul untuk semua Others) */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {VELG_NUMERIC_FIELDS.map(({ key, label }) => (
                      <div key={key}>
                        <label className={labelClass} htmlFor={`v-${key}`}>
                          {label}
                        </label>
                        <input
                          id={`v-${key}`}
                          type="number"
                          min="0"
                          value={formData[key] ?? ""}
                          onChange={(e) =>
                            update({
                              [key]: e.target.value,
                            } as Partial<DistribusiFormValues>)
                          }
                          className={fieldClass}
                          placeholder="0"
                        />
                      </div>
                    ))}

                    {VELG_TEXT_FIELDS.map(({ key, label }) => (
                      <div key={key}>
                        <label className={labelClass} htmlFor={`v-${key}`}>
                          {label}
                        </label>
                        <input
                          id={`v-${key}`}
                          type="text"
                          value={formData[key] ?? ""}
                          onChange={(e) =>
                            update({
                              [key]: e.target.value,
                            } as Partial<DistribusiFormValues>)
                          }
                          className={fieldClass}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Meta umum Others (muncul untuk semua Others) */}
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="tanggalOthers">
                        Bulan / Tanggal
                      </label>
                      <input
                        id="tanggalOthers"
                        type="date"
                        value={formData.tanggal ?? ""}
                        onChange={(e) => update({ tanggal: e.target.value })}
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="bayarOthers">
                        Pembayaran
                      </label>
                      <select
                        id="bayarOthers"
                        value={formData.pembayaran ?? "Lunas"}
                        onChange={(e) =>
                          update({
                            pembayaran: e.target
                              .value as DistribusiFormValues["pembayaran"],
                          })
                        }
                        className={fieldClass}
                      >
                        <option value="Lunas">Lunas</option>
                        <option value="Tidak Lunas">Tidak Lunas</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="kodeOthers">
                        Kode Barang
                      </label>
                      <input
                        id="kodeOthers"
                        type="text"
                        value={formData.kodeBarang ?? ""}
                        onChange={(e) =>
                          update({ kodeBarang: e.target.value })
                        }
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label
                        className={labelClass}
                        htmlFor="arrivalOthers"
                      >
                        Arrival Date
                      </label>
                      <input
                        id="arrivalOthers"
                        type="date"
                        value={formData.arrivalDate ?? ""}
                        onChange={(e) =>
                          update({ arrivalDate: e.target.value })
                        }
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label
                        className={labelClass}
                        htmlFor="stockOwnerOthers"
                      >
                        Stock Owner
                      </label>
                      <input
                        id="stockOwnerOthers"
                        type="text"
                        value={formData.stockOwner ?? ""}
                        onChange={(e) =>
                          update({ stockOwner: e.target.value })
                        }
                        className={fieldClass}
                      />
                    </div>

                    <div>
                      <label
                        className={labelClass}
                        htmlFor="payDateOthers"
                      >
                        Payment Date
                      </label>
                      <input
                        id="payDateOthers"
                        type="date"
                        value={formData.paymentDate ?? ""}
                        onChange={(e) =>
                          update({ paymentDate: e.target.value })
                        }
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="nomorBonOthers">
                        Nomor Bon
                      </label>
                      <input
                        id="nomorBonOthers"
                        type="text"
                        value={formData.nomorBon ?? ""}
                        onChange={(e) => update({ nomorBon: e.target.value })}
                        className={fieldClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass} htmlFor="notesOthers">
                        Notes
                      </label>
                      <textarea
                        id="notesOthers"
                        rows={2}
                        value={formData.notes ?? ""}
                        onChange={(e) => update({ notes: e.target.value })}
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* Upload Gambar */}
            <div>
              <label className={labelClass}>Upload Gambar (Wajib)</label>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/70 bg-background/50 px-5 py-2.5 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-muted/70">
                  <Upload className="size-4" />
                  Pilih File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImage}
                  />
                </label>
                {formData.gambar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.gambar}
                    alt="Preview"
                    className="size-14 rounded-xl border border-border/70 object-cover"
                  />
                ) : (
                  <span className="flex size-14 items-center justify-center rounded-xl border border-dashed border-border/70 text-muted-foreground">
                    <ImagePlus className="size-4" />
                  </span>
                )}
              </div>
            </div>

            {/* Pesan Error */}
            {error && (
              <p className="rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
                {error}
              </p>
            )}
          </div>

          {/* Footer Modal */}
          <div className="relative flex items-center justify-between gap-3 border-t border-border/60 bg-background/30 px-6 py-4 backdrop-blur-sm sm:px-8">
            <p className="hidden text-xs text-muted-foreground sm:block">
              Data hanya tersimpan di sesi ini (frontend).
            </p>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border/70 bg-background/50 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_var(--primary)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Check className="size-4" />
                {initialData ? "Simpan Perubahan" : "Daftarkan Barang"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}