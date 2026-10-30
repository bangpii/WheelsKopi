"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Check, ImagePlus, PackagePlus, Upload, X } from "lucide-react";
import type {
  DistribusiCategory,
  DistribusiFormValues,
} from "@/lib/distribusi-data";
import { othersCategories } from "@/lib/distribusi-data";

interface RegisterProductModalProps {
  suppliers: { name: string }[];
  onClose: () => void;
  onSubmit: (values: DistribusiFormValues) => void;
}

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
};

const fieldClass =
  "w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-ring/40";

const labelClass =
  "mb-1.5 block text-[12px] font-semibold tracking-wide text-muted-foreground uppercase";

export function RegisterProductModal({
  suppliers,
  onClose,
  onSubmit,
}: RegisterProductModalProps) {
  const [formData, setFormData] = useState<DistribusiFormValues>(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const update = (patch: Partial<DistribusiFormValues>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const setKategori = (kategori: DistribusiCategory) => {
    setFormData((prev) => ({
      ...prev,
      kategori,
      subKategori: "",
      ukuran: "",
      ring: "",
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.supplier) {
      setError("Pilih supplier terlebih dahulu.");

      return;
    }

    if (!formData.gambar) {
      setError("Upload gambar produk terlebih dahulu.");

      return;
    }

    setError("");
    onSubmit(formData);
    setFormData(emptyForm);
  };

  const isVelg = formData.kategori === "Ban" || formData.subKategori === "Velg";
  const isOthers = formData.kategori === "Others";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-md supports-[backdrop-filter]:bg-black/35"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-product-title"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border-white/60 liquid-glass"
      >
        <div className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-primary/20 blur-3xl dark:bg-primary/25" />
        <div className="pointer-events-none absolute -right-20 -bottom-24 size-64 rounded-full bg-[color:var(--chart-2)]/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/20" />

        <div className="relative flex items-start justify-between gap-4 px-6 pt-6 pb-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
              <PackagePlus className="size-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.26em] text-primary uppercase">
                Register
              </p>
              <h2
                id="register-product-title"
                className="font-display text-xl font-semibold tracking-tight"
              >
                Produk Baru
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
              {(["Ban", "Others"] as const).map((kategori) => (
                <button
                  key={kategori}
                  type="button"
                  onClick={() => setKategori(kategori)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    formData.kategori === kategori
                      ? "bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_var(--primary)]"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  }`}
                >
                  Daftar {kategori}
                </button>
              ))}
            </div>

            <div>
              <label className={labelClass} htmlFor="supplier">
                Supplier (Wajib)
              </label>
              <select
                id="supplier"
                required
                value={formData.supplier}
                onChange={(event) => update({ supplier: event.target.value })}
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

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {isOthers ? (
                <div>
                  <label className={labelClass} htmlFor="jenis">
                    Jenis Produk (Wajib)
                  </label>
                  <select
                    id="jenis"
                    required
                    value={formData.subKategori}
                    onChange={(event) =>
                      update({
                        subKategori: event.target.value,
                        ukuran: "",
                        ring: "",
                      })
                    }
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
              ) : (
                <div>
                  <label className={labelClass} htmlFor="merek">
                    Merek Ban (Wajib)
                  </label>
                  <input
                    id="merek"
                    required
                    type="text"
                    value={formData.subKategori}
                    onChange={(event) =>
                      update({ subKategori: event.target.value })
                    }
                    className={fieldClass}
                    placeholder="Cth: Bridgestone"
                  />
                </div>
              )}

              <div>
                <label className={labelClass} htmlFor="nama">
                  {isOthers && formData.subKategori !== "Velg"
                    ? "Keterangan (Wajib)"
                    : "Nama Barang / Seri (Wajib)"}
                </label>
                <input
                  id="nama"
                  required
                  type="text"
                  value={formData.namaBarang}
                  onChange={(event) =>
                    update({ namaBarang: event.target.value })
                  }
                  className={fieldClass}
                  placeholder={
                    isOthers && formData.subKategori !== "Velg"
                      ? "Cth: Shock Belakang"
                      : "Cth: Ecopia"
                  }
                />
              </div>
            </div>

            {isVelg && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="ukuran">
                    Ukuran / Spesifikasi (Wajib)
                  </label>
                  <input
                    id="ukuran"
                    required
                    type="text"
                    value={formData.ukuran}
                    onChange={(event) => update({ ukuran: event.target.value })}
                    className={fieldClass}
                    placeholder="Cth: 205/65 atau PCD 4x100"
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="ring">
                    Ring (Wajib)
                  </label>
                  <input
                    id="ring"
                    required
                    type="text"
                    value={formData.ring}
                    onChange={(event) => update({ ring: event.target.value })}
                    className={fieldClass}
                    placeholder="Cth: R18"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass} htmlFor="stok">
                  Stok (Wajib)
                </label>
                <input
                  id="stok"
                  required
                  min="0"
                  type="number"
                  value={formData.stok}
                  onChange={(event) => update({ stok: event.target.value })}
                  className={fieldClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="modal-asli">
                  Harga Modal Asli
                </label>
                <input
                  id="modal-asli"
                  required
                  min="0"
                  type="number"
                  value={formData.hargaModalAsli}
                  onChange={(event) =>
                    update({ hargaModalAsli: event.target.value })
                  }
                  className={fieldClass}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="modal-toko">
                  Harga Tagihan Toko
                </label>
                <input
                  id="modal-toko"
                  required
                  min="0"
                  type="number"
                  value={formData.hargaModalToko}
                  onChange={(event) =>
                    update({ hargaModalToko: event.target.value })
                  }
                  className={fieldClass}
                  placeholder="0"
                />
              </div>
            </div>

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
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (file) {
                        update({ gambar: URL.createObjectURL(file) });
                      }
                    }}
                  />
                </label>
                {formData.gambar ? (
                  <div
                    className="size-12 rounded-xl border border-border/70 bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${formData.gambar})` }}
                  />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-xl border border-dashed border-border/70 text-muted-foreground">
                    <ImagePlus className="size-4" />
                  </span>
                )}
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
                {error}
              </p>
            )}
          </div>

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
                Daftarkan Barang
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
