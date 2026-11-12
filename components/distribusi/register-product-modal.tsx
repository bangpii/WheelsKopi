"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Box,
  Check,
  Disc3,
  ImagePlus,
  PackagePlus,
  X,
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

interface RegisterProductModalProps {
  suppliers: { name: string }[];
  categories?: string[];
  initialSubKategori?: string;
  initialData?: Product | null;
  onClose: () => void;
  onSubmit: (values: DistribusiFormValues) => void;
}

const fieldClass =
  "w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none backdrop-blur-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-ring/40";

const labelClass =
  "mb-1.5 block text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

function createInitialForm(
  initialData: Product | null | undefined,
  suppliers: { name: string }[],
  initialSubKategori?: string,
): DistribusiFormValues {
  if (initialData) {
    return {
      kategori: initialData.kategoriUtama,
      supplier: initialData.supplier ?? suppliers[0]?.name ?? "",
      stok: String(initialData.stok ?? ""),
      gambar: initialData.gambar ?? "",
      merekBan: initialData.merekBan ?? "",
      typeBan: initialData.typeBan ?? "",
      ring: initialData.ring ?? "",
      ukuranTapak: initialData.ukuranTapak ?? "",
      ukuranTinggi: initialData.ukuranTinggi ?? "",
      subKategori:
        initialData.kategoriUtama === "Others"
          ? initialData.subKategori
          : undefined,
      merekProduk: initialData.merekProduk ?? "",
      typeVelg: initialData.typeVelg ?? "",
      wide: initialData.wide ?? "",
      hole: initialData.hole ?? "",
      et: initialData.et ?? "",
      colour: initialData.colour ?? "",
      nobes: initialData.nobes ?? "",
      keterangan: initialData.keterangan ?? "",
      notes: initialData.notes ?? "",
      namaBarang: initialData.namaBarang,
      ukuran: initialData.ukuran,
      tanggal: initialData.tanggal,
      hargaModalAsli: String(initialData.hargaModalAsli ?? ""),
      hargaModalToko: String(initialData.hargaModalToko ?? ""),
      hargaTagihanToko: String(initialData.hargaTagihanToko ?? ""),
      standarPrice: String(initialData.standarPrice ?? ""),
    };
  }

  return {
    kategori: initialSubKategori ? "Others" : "Ban",
    supplier: "",
    stok: "",
    gambar: "",
    merekBan: "",
    typeBan: "",
    ring: "",
    ukuranTapak: "",
    ukuranTinggi: "",
    subKategori: initialSubKategori ?? "",
    merekProduk: "",
    typeVelg: "",
    wide: "",
    hole: "",
    et: "",
    colour: "",
    nobes: "",
    keterangan: "",
    notes: "",
    standarPrice: "",
  };
}

export function RegisterProductModal({
  suppliers,
  categories = [...othersCategories],
  initialSubKategori,
  initialData,
  onClose,
  onSubmit,
}: RegisterProductModalProps) {
  const [formData, setFormData] = useState<DistribusiFormValues>(() =>
    createInitialForm(initialData, suppliers, initialSubKategori),
  );

  const [error, setError] = useState("");

  const [brandOptions, setBrandOptions] = useState<string[]>(() => {
    const merged = [...BAN_BRAND_LIST];

    if (initialData?.merekBan && !merged.includes(initialData.merekBan)) {
      merged.push(initialData.merekBan);
    }

    return merged;
  });

  const [ringOptions, setRingOptions] = useState<string[]>(() => {
    const merged = [...BAN_RING_OPTIONS];
    const ring = initialData?.ring;

    if (ring && !merged.includes(ring)) {
      merged.push(ring);
    }

    return merged;
  });

  const [customTypes, setCustomTypes] = useState<Record<string, string[]>>({});

  const isBan = formData.kategori === "Ban";
  const isVelg = !isBan && formData.subKategori === "Velg";

  const update = (patch: Partial<DistribusiFormValues>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    setError("");
  };

  const switchCategory = (kategori: DistribusiCategory) => {
    const patch: Partial<DistribusiFormValues> = { kategori };

    if (kategori === "Others" && !formData.subKategori) {
      patch.subKategori = "Velg";
    }

    update(patch);
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File yang diupload harus berupa gambar.");

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 2MB.");

      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      update({ gambar: String(reader.result ?? "") });
    };

    reader.readAsDataURL(file);
  };

  const validate = (): string => {
    if (!formData.supplier.trim()) return "Supplier wajib dipilih.";

    if (!formData.stok.trim() || Number(formData.stok) < 0) {
      return "Stok wajib diisi dengan angka 0 atau lebih.";
    }

    if (!formData.gambar && !initialData?.gambar) {
      return "Upload gambar produk terlebih dahulu.";
    }

    if (isBan) {
      if (!formData.merekBan?.trim()) return "Merek ban wajib dipilih.";

      if (!formData.typeBan?.trim()) return "Type ban wajib dipilih.";

      if (!formData.ring?.trim()) return "Ring wajib dipilih.";

      if (!formData.ukuranTapak?.trim()) return "Tapak/lebar wajib diisi.";

      if (!formData.ukuranTinggi?.trim()) return "Tinggi wajib diisi.";

      return "";
    }

    if (!formData.subKategori) return "Jenis produk wajib dipilih.";

    if (!formData.merekProduk?.trim()) return "Merek produk wajib diisi.";

    if (isVelg) {
      if (!formData.typeVelg?.trim()) return "Type velg wajib diisi.";

      if (!formData.ring?.trim()) return "Ring wajib dipilih.";

      if (!formData.wide?.trim()) return "Wide wajib diisi.";

      if (!formData.hole?.trim()) return "Hole wajib diisi.";

      if (!formData.et?.trim()) return "ET wajib diisi.";

      if (!formData.colour?.trim()) return "Colour wajib diisi.";

      return "";
    }

    if (!formData.keterangan?.trim()) return "Keterangan wajib diisi.";

    return "";
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = validate();

    if (message) {
      setError(message);

      return;
    }

    onSubmit({
      kategori: formData.kategori,
      supplier: formData.supplier.trim(),
      stok: formData.stok,
      gambar: formData.gambar,
      merekBan: isBan ? formData.merekBan : undefined,
      typeBan: isBan ? formData.typeBan : undefined,
      ring: formData.ring,
      ukuranTapak: isBan ? formData.ukuranTapak : undefined,
      ukuranTinggi: isBan ? formData.ukuranTinggi : undefined,
      subKategori: isBan ? undefined : formData.subKategori,
      merekProduk: isBan ? undefined : formData.merekProduk,
      typeVelg: isVelg ? formData.typeVelg : undefined,
      wide: isVelg ? formData.wide : undefined,
      hole: isVelg ? formData.hole : undefined,
      et: isVelg ? formData.et : undefined,
      colour: isVelg ? formData.colour : undefined,
      nobes: isVelg ? formData.nobes : undefined,
      keterangan: isBan || isVelg ? undefined : formData.keterangan,
      notes: isBan || isVelg ? undefined : formData.notes,
      standarPrice: formData.standarPrice,
      // Legacy tidak ditampilkan lagi; nilai lama tetap dipertahankan saat edit.
      hargaModalAsli: initialData
        ? String(initialData.hargaModalAsli ?? "")
        : undefined,
      hargaModalToko: initialData
        ? String(initialData.hargaModalToko ?? "")
        : undefined,
      hargaTagihanToko: initialData
        ? String(initialData.hargaTagihanToko ?? "")
        : undefined,
    });
  };

  const baseTypes = formData.merekBan ? BAN_BRANDS[formData.merekBan] ?? [] : [];
  const extraTypes = formData.merekBan ? customTypes[formData.merekBan] ?? [] : [];
  const typeOptions = Array.from(new Set([...baseTypes, ...extraTypes]));

  const typeSelectOptions =
    formData.typeBan && !typeOptions.includes(formData.typeBan)
      ? [formData.typeBan, ...typeOptions]
      : typeOptions;

  const registerBrand = (value: string) => {
    const brand = value.trim();

    if (!brand) return;
    setBrandOptions((current) =>
      current.includes(brand) ? current : [...current, brand],
    );
  };

  const registerType = (brand: string, value: string) => {
    const type = value.trim();

    if (!brand || !type) return;
    setCustomTypes((current) => {
      const existing = current[brand] ?? [];

      if (existing.includes(type) || (BAN_BRANDS[brand] ?? []).includes(type)) {
        return current;
      }

      return { ...current, [brand]: [...existing, type] };
    });
  };

  const registerRing = (value: string) => {
    const ring = value.trim();

    if (!ring) return;

    setRingOptions((current) =>
      current.includes(ring) ? current : [...current, ring],
    );
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-product-title"
        className="surface relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <PackagePlus className="size-5" />
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.28em] text-primary uppercase">
                {initialData ? "Edit Produk" : "Registrasi Produk"}
              </p>
              <h2
                id="register-product-title"
                className="font-display mt-1 text-lg font-semibold tracking-tight"
              >
                {initialData ? "Perbarui Data Produk" : "Daftarkan Produk Baru"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Pilih kategori, lengkapi spesifikasi, lalu simpan.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="inline-flex w-full rounded-xl border border-border bg-muted/50 p-1 sm:w-auto">
              {(["Ban", "Others"] as const).map((tab) => {
                const TabIcon = tab === "Ban" ? Disc3 : Box;
                const active = formData.kategori === tab;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => switchCategory(tab)}
                    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-colors sm:flex-none ${
                      active
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <TabIcon className="size-4" />
                    {tab}
                  </button>
                );
              })}
            </div>

            {isBan ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Merek Ban</span>
                  <input
                    list="ban-brand-options"
                    value={formData.merekBan ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      update({ merekBan: value, typeBan: "" });

                      if (brandOptions.includes(value)) return;
                    }}
                    onBlur={() => registerBrand(formData.merekBan ?? "")}
                    className={fieldClass}
                    placeholder="Pilih / ketik merek baru"
                  />
                  <datalist id="ban-brand-options">
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    Bisa pilih dari daftar atau ketik merek baru.
                  </span>
                </label>

                <label>
                  <span className={labelClass}>Type Ban</span>
                  <input
                    list="ban-type-options"
                    value={formData.typeBan ?? ""}
                    onChange={(event) => update({ typeBan: event.target.value })}
                    onBlur={() =>
                      registerType(formData.merekBan ?? "", formData.typeBan ?? "")
                    }
                    className={fieldClass}
                    placeholder={
                      formData.merekBan
                        ? "Pilih / ketik type baru"
                        : "Pilih merek terlebih dahulu"
                    }
                    disabled={!formData.merekBan?.trim()}
                  />
                  <datalist id="ban-type-options">
                    {typeSelectOptions.map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    Bisa pilih dari daftar atau ketik type baru.
                  </span>
                </label>

                <label>
                  <span className={labelClass}>Ring</span>
                  <input
                    list="ring-options-ban"
                    value={formData.ring ?? ""}
                    onChange={(event) => update({ ring: event.target.value })}
                    onBlur={() => registerRing(formData.ring ?? "")}
                    className={fieldClass}
                    placeholder="Pilih / ketik ring"
                  />
                  <datalist id="ring-options-ban">
                    {ringOptions.map((ring) => (
                      <option key={ring} value={ring} />
                    ))}
                  </datalist>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className={labelClass}>Tapak / Lebar</span>
                    <input
                      value={formData.ukuranTapak ?? ""}
                      onChange={(event) =>
                        update({ ukuranTapak: event.target.value })
                      }
                      placeholder="195"
                      inputMode="numeric"
                      className={fieldClass}
                    />
                  </label>
                  <label>
                    <span className={labelClass}>Tinggi</span>
                    <input
                      value={formData.ukuranTinggi ?? ""}
                      onChange={(event) =>
                        update({ ukuranTinggi: event.target.value })
                      }
                      placeholder="65"
                      inputMode="numeric"
                      className={fieldClass}
                    />
                  </label>
                </div>

                <label className="sm:col-span-2">
                  <span className={labelClass}>Supplier</span>
                  <select
                    value={formData.supplier}
                    onChange={(event) =>
                      update({ supplier: event.target.value })
                    }
                    className={fieldClass}
                  >
                    <option value="">Pilih supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.name} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className={labelClass}>Stok</span>
                  <input
                    value={formData.stok}
                    onChange={(event) => update({ stok: event.target.value })}
                    placeholder="0"
                    inputMode="numeric"
                    type="number"
                    min={0}
                    className={fieldClass}
                  />
                </label>

                <label>
                  <span className={labelClass}>Standar Price</span>
                  <input
                    value={formData.standarPrice ?? ""}
                    onChange={(event) =>
                      update({ standarPrice: event.target.value })
                    }
                    placeholder="0"
                    inputMode="numeric"
                    type="number"
                    min={0}
                    className={fieldClass}
                  />
                </label>

                <div className="sm:col-span-2">
                  <ImageField
                    value={formData.gambar}
                    onChange={handleImageUpload}
                    onRemove={() => update({ gambar: "" })}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Supplier</span>
                  <select
                    value={formData.supplier}
                    onChange={(event) =>
                      update({ supplier: event.target.value })
                    }
                    className={fieldClass}
                  >
                    <option value="">Pilih supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.name} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className={labelClass}>Pilih / Ketik Jenis</span>
                  <input
                    list="others-categories"
                    value={formData.subKategori ?? ""}
                    onChange={(event) =>
                      update({ subKategori: event.target.value })
                    }
                    placeholder="Ketik jenis baru..."
                    className={fieldClass}
                  />
                  <datalist id="others-categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    Ketik bebas untuk menambah kategori baru.
                  </span>
                </label>

                {isVelg ? (
                  <>
                    <label>
                      <span className={labelClass}>Merek Produk</span>
                      <input
                        value={formData.merekProduk ?? ""}
                        onChange={(event) =>
                          update({ merekProduk: event.target.value })
                        }
                        placeholder="SSW"
                        className={fieldClass}
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Type Velg</span>
                      <input
                        value={formData.typeVelg ?? ""}
                        onChange={(event) =>
                          update({ typeVelg: event.target.value })
                        }
                        placeholder="S280"
                        className={fieldClass}
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Ring</span>
                      <input
                        list="ring-options-velg"
                        value={formData.ring ?? ""}
                        onChange={(event) => update({ ring: event.target.value })}
                        onBlur={() => registerRing(formData.ring ?? "")}
                        className={fieldClass}
                        placeholder="Pilih / ketik ring"
                      />
                      <datalist id="ring-options-velg">
                        {ringOptions.map((ring) => (
                          <option key={ring} value={ring} />
                        ))}
                      </datalist>
                    </label>

                    <label>
                      <span className={labelClass}>Wide</span>
                      <input
                        value={formData.wide ?? ""}
                        onChange={(event) =>
                          update({ wide: event.target.value })
                        }
                        placeholder="9,5"
                        className={fieldClass}
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Hole</span>
                      <input
                        value={formData.hole ?? ""}
                        onChange={(event) =>
                          update({ hole: event.target.value })
                        }
                        placeholder="6x139.7"
                        className={fieldClass}
                      />
                    </label>

                    <label>
                      <span className={labelClass}>ET</span>
                      <input
                        value={formData.et ?? ""}
                        onChange={(event) => update({ et: event.target.value })}
                        placeholder="25"
                        className={fieldClass}
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Colour</span>
                      <input
                        value={formData.colour ?? ""}
                        onChange={(event) =>
                          update({ colour: event.target.value })
                        }
                        placeholder="BMC"
                        className={fieldClass}
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Nobes</span>
                      <input
                        value={formData.nobes ?? ""}
                        onChange={(event) =>
                          update({ nobes: event.target.value })
                        }
                        placeholder="Nomor besi"
                        className={fieldClass}
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Stok</span>
                      <input
                        value={formData.stok}
                        onChange={(event) =>
                          update({ stok: event.target.value })
                        }
                        placeholder="0"
                        inputMode="numeric"
                        type="number"
                        min={0}
                        className={fieldClass}
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Standar Price</span>
                      <input
                        value={formData.standarPrice ?? ""}
                        onChange={(event) =>
                          update({ standarPrice: event.target.value })
                        }
                        placeholder="0"
                        inputMode="numeric"
                        type="number"
                        min={0}
                        className={fieldClass}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      <span className={labelClass}>Merek Produk</span>
                      <input
                        value={formData.merekProduk ?? ""}
                        onChange={(event) =>
                          update({ merekProduk: event.target.value })
                        }
                        placeholder="KYB"
                        className={fieldClass}
                      />
                    </label>

                    <label>
                      <span className={labelClass}>Stok</span>
                      <input
                        value={formData.stok}
                        onChange={(event) =>
                          update({ stok: event.target.value })
                        }
                        placeholder="0"
                        inputMode="numeric"
                        type="number"
                        min={0}
                        className={fieldClass}
                      />
                    </label>

                    <label className="sm:col-span-2">
                      <span className={labelClass}>Keterangan</span>
                      <input
                        value={formData.keterangan ?? ""}
                        onChange={(event) =>
                          update({ keterangan: event.target.value })
                        }
                        placeholder="Shock Absorber Belakang"
                        className={fieldClass}
                      />
                    </label>

                    <label className="sm:col-span-2">
                      <span className={labelClass}>Notes</span>
                      <textarea
                        value={formData.notes ?? ""}
                        onChange={(event) =>
                          update({ notes: event.target.value })
                        }
                        placeholder="Catatan tambahan (opsional)"
                        rows={3}
                        className={`${fieldClass} resize-none`}
                      />
                    </label>
                  </>
                )}

                <div className="sm:col-span-2">
                  <ImageField
                    value={formData.gambar}
                    onChange={handleImageUpload}
                    onRemove={() => update({ gambar: "" })}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="mt-4 rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-xs font-medium text-danger">
                {error}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border bg-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-[11px] text-muted-foreground">
              Field bertanda wajib harus lengkap sebelum disimpan.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_var(--primary)] transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Check className="size-4" />
                {initialData ? "Simpan Perubahan" : "Daftarkan Produk"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ImageField({
  value,
  onChange,
  onRemove,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <span className={labelClass}>Upload Gambar</span>
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <div className="relative size-20 overflow-hidden rounded-xl border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview produk"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={onRemove}
              aria-label="Hapus gambar"
              className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-lg bg-black/60 text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : null}

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border bg-background/60 px-4 py-3 text-xs font-semibold transition-colors hover:border-primary/50 hover:bg-primary-soft/40">
          <ImagePlus className="size-4 text-primary" />
          {value ? "Ganti Gambar" : "Pilih Gambar"}
          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
          />
        </label>
        <p className="text-[11px] text-muted-foreground">
          JPG/PNG, maksimal 2MB.
        </p>
      </div>
    </div>
  );
}
