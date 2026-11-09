"use client";

import { Box, Disc3, X } from "lucide-react";
import type { Product } from "@/lib/context/data-context";

interface ProductDetailModalProps {
  item: Product;
  onClose: () => void;
}

function statusOf(stok: number) {
  if (stok < 2) return "Wajib Pesan";
  if (stok <= 5) return "Menipis";

  return "Tersedia";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/30 px-3.5 py-2.5">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium break-words">{value || "-"}</p>
    </div>
  );
}

export function ProductDetailModal({ item, onClose }: ProductDetailModalProps) {
  const isBan = item.kategoriUtama === "Ban";
  const isVelg = !isBan && item.subKategori === "Velg";
  const status = statusOf(item.stok);

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label="Tutup detail produk"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        className="surface relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              {isBan ? (
                <Disc3 className="size-5" />
              ) : (
                <Box className="size-5" />
              )}
            </span>
            <div>
              <p className="font-mono text-[10px] tracking-[0.28em] text-primary uppercase">
                Detail Produk
              </p>
              <h2
                id="product-detail-title"
                className="font-display mt-1 max-w-md text-lg font-semibold tracking-tight"
              >
                {item.namaBarang}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.id} • {item.kategoriUtama}
                {item.subKategori ? ` • ${item.subKategori}` : ""}
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

        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start gap-4">
            {item.gambar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.gambar}
                alt={item.namaBarang}
                className="size-28 rounded-2xl border border-border object-cover"
              />
            ) : (
              <span className="flex size-28 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 text-muted-foreground">
                {isBan ? (
                  <Disc3 className="size-8" />
                ) : (
                  <Box className="size-8" />
                )}
              </span>
            )}

            <div className="flex-1">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  status === "Wajib Pesan"
                    ? "bg-danger-soft text-danger"
                    : status === "Menipis"
                      ? "bg-warning-soft text-warning"
                      : "bg-success-soft text-success"
                }`}
              >
                {status}
              </span>
              <p className="mt-3 text-xs text-muted-foreground">Stok tersedia</p>
              <p className="font-display text-2xl font-semibold tabular-nums">
                {item.stok}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {isBan ? (
              <>
                <Row label="Merek Ban" value={item.merekBan ?? item.subKategori} />
                <Row label="Type Ban" value={item.typeBan ?? ""} />
                <Row label="Ring" value={item.ring} />
                <Row label="Tapak / Lebar" value={item.ukuranTapak ?? ""} />
                <Row label="Tinggi" value={item.ukuranTinggi ?? ""} />
                <Row label="Supplier" value={item.supplier} />
              </>
            ) : isVelg ? (
              <>
                <Row label="Jenis" value={item.subKategori} />
                <Row label="Merek Produk" value={item.merekProduk ?? ""} />
                <Row label="Type Velg" value={item.typeVelg ?? ""} />
                <Row label="Ring" value={item.ring} />
                <Row label="Wide" value={item.wide ?? ""} />
                <Row label="Hole" value={item.hole ?? ""} />
                <Row label="ET" value={item.et ?? ""} />
                <Row label="Colour" value={item.colour ?? ""} />
                <Row label="Nobes" value={item.nobes ?? ""} />
                <Row label="Supplier" value={item.supplier} />
              </>
            ) : (
              <>
                <Row label="Jenis" value={item.subKategori} />
                <Row label="Merek Produk" value={item.merekProduk ?? ""} />
                <Row
                  label="Keterangan"
                  value={item.keterangan ?? item.ukuran ?? ""}
                />
                <Row label="Supplier" value={item.supplier} />
                <div className="sm:col-span-2">
                  <Row label="Notes" value={item.notes ?? ""} />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end border-t border-border bg-muted/20 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
