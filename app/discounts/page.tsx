"use client";

import { useEffect, useState } from "react";
import {
  CalendarClock,
  Pencil,
  Plus,
  Search,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { useCan } from "@/lib/permissions";
import type { DiscountRecord } from "@/lib/warehouse-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusFor(
  discount: Pick<DiscountRecord, "status" | "toDate">,
  now: number | null,
) {
  if (discount.status === "Tidak Aktif" || now === null) {
    return discount.status;
  }

  return new Date(discount.toDate).getTime() < now ? "Tidak Aktif" : "Aktif";
}

interface DiscountForm {
  code: string;
  store: string;
  discountPercent: number;
  maxCut: number;
  limit: number;
  status: DiscountRecord["status"];
  fromDate: string;
  toDate: string;
}

const emptyForm: DiscountForm = {
  code: "",
  store: "",
  discountPercent: 10,
  maxCut: 100_000,
  limit: 5,
  status: "Aktif",
  fromDate: "2026-10-01",
  toDate: "2026-12-31",
};

export default function DiscountsPage() {
  const { discounts, setDiscounts, storeNames } = useData();
  const can = useCan();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<DiscountRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
  }, []);

  const keyword = search.trim().toLowerCase();

  const filtered = discounts.filter(
    (discount) =>
      keyword.length === 0 ||
      discount.code.toLowerCase().includes(keyword) ||
      discount.store.toLowerCase().includes(keyword),
  );

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      store: storeNames[0] ?? "",
      code: `KKW${String(discounts.length + 1).padStart(2, "0")}`,
    });
    setIsOpen(true);
  };

  const openEdit = (discount: DiscountRecord) => {
    setEditing(discount);
    setForm({
      code: discount.code,
      store: discount.store,
      discountPercent: discount.discountPercent,
      maxCut: discount.maxCut,
      limit: discount.limit,
      status: discount.status,
      fromDate: discount.fromDate,
      toDate: discount.toDate,
    });
    setIsOpen(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    const status =
      form.status === "Aktif" &&
      new Date(form.toDate).getTime() < Date.now()
        ? "Tidak Aktif"
        : form.status;

    if (editing) {
      setDiscounts(
        discounts.map((discount) =>
          discount.id === editing.id
            ? {
                ...discount,
                ...form,
                status,
                history: [
                  ...discount.history,
                  `Diedit pada ${new Date().toLocaleDateString("id-ID")}`,
                ],
              }
            : discount,
        ),
      );
    } else {
      setDiscounts([
        {
          id: `DSC-${Date.now()}`,
          ...form,
          status,
          createdAt: new Date().toLocaleDateString("id-ID"),
          history: [`Dibuat pada ${new Date().toLocaleDateString("id-ID")}`],
        },
        ...discounts,
      ]);
    }

    setIsOpen(false);
  };

  const handleDelete = (discount: DiscountRecord) => {
    if (window.confirm(`Hapus voucher ${discount.code}?`)) {
      setDiscounts(discounts.filter((entry) => entry.id !== discount.id));
    }
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
            Master Data
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Voucher &amp; Discount
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Kelola kode voucher per toko. Status otomatis menjadi tidak aktif
            ketika tanggal berakhir terlewati.
          </p>
        </header>

        <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          {can("discount", "input") && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              <Plus className="size-4" />
              Create Discount
            </button>
          )}
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari kode atau toko..."
              className={`${fieldClass} pl-9`}
            />
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Kode Voucher</th>
                  <th className={thClass}>Store</th>
                  <th className={`${thClass} text-right`}>Discount</th>
                  <th className={`${thClass} text-right`}>Max Cut</th>
                  <th className={`${thClass} text-center`}>Limit</th>
                  <th className={thClass}>From Date</th>
                  <th className={thClass}>To Date</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Created At</th>
                  <th className={`${thClass} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-16 text-center text-sm text-muted-foreground"
                    >
                      Belum ada voucher yang cocok.
                    </td>
                  </tr>
                ) : (
                  filtered.map((discount) => {
                    const status = statusFor(discount, now);

                    return (
                      <tr
                        key={discount.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td className={tdClass}>
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                              <TicketPercent className="size-4" />
                            </span>
                            <span className="font-mono font-semibold">
                              {discount.code}
                            </span>
                          </div>
                        </td>
                        <td className={`${tdClass} text-muted-foreground`}>
                          {discount.store}
                        </td>
                        <td
                          className={`${tdClass} text-right font-mono font-semibold tabular-nums`}
                        >
                          {discount.discountPercent}%
                        </td>
                        <td
                          className={`${tdClass} text-right font-mono tabular-nums`}
                        >
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(discount.maxCut)}
                        </td>
                        <td
                          className={`${tdClass} text-center font-mono tabular-nums`}
                        >
                          {discount.limit}
                        </td>
                        <td className={`${tdClass} text-muted-foreground`}>
                          {formatDate(discount.fromDate)}
                        </td>
                        <td className={`${tdClass} text-muted-foreground`}>
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarClock className="size-3.5" />
                            {formatDate(discount.toDate)}
                          </span>
                        </td>
                        <td className={tdClass}>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              status === "Aktif"
                                ? "bg-success-soft text-success"
                                : "bg-danger-soft text-danger"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className={`${tdClass} text-muted-foreground`}>
                          {discount.createdAt}
                        </td>
                        <td className={`${tdClass} text-center`}>
                          <div className="flex justify-center gap-2">
                            {can("discount", "edit") && (
                              <button
                                type="button"
                                onClick={() => openEdit(discount)}
                                className="rounded-lg bg-primary-soft p-2 text-primary hover:bg-primary/20"
                                title="Edit"
                              >
                                <Pencil className="size-4" />
                              </button>
                            )}
                            {can("discount", "delete") && (
                              <button
                                type="button"
                                onClick={() => handleDelete(discount)}
                                className="rounded-lg bg-danger-soft p-2 text-danger hover:bg-danger/20"
                                title="Hapus"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                {editing ? "Edit Voucher" : "Create Voucher"}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-danger"
              >
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Kode Voucher</span>
                  <input
                    required
                    value={form.code}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        code: event.target.value.toUpperCase(),
                      })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Store</span>
                  <select
                    value={form.store}
                    onChange={(event) =>
                      setForm({ ...form, store: event.target.value })
                    }
                    className={fieldClass}
                  >
                    {storeNames.map((store) => (
                      <option key={store}>{store}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Discount (%)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={form.discountPercent}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        discountPercent: Number(event.target.value),
                      })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Max Cut (Rp)</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.maxCut}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        maxCut: Number(event.target.value),
                      })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Limit</span>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.limit}
                    onChange={(event) =>
                      setForm({ ...form, limit: Number(event.target.value) })
                    }
                    className={fieldClass}
                  />
                </label>
                <div className="space-y-1.5 text-sm">
                  <span className="font-medium">Status</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        status:
                          form.status === "Aktif" ? "Tidak Aktif" : "Aktif",
                      })
                    }
                    aria-pressed={form.status === "Aktif"}
                    className={`flex h-[42px] w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold transition-colors ${
                      form.status === "Aktif"
                        ? "border-success/30 bg-success-soft text-success"
                        : "border-border bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    <span>{form.status}</span>
                    <span
                      className={`relative flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.status === "Aktif" ? "bg-success" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute size-5 rounded-full bg-white shadow-sm transition-transform ${
                          form.status === "Aktif"
                            ? "translate-x-[22px]"
                            : "translate-x-0.5"
                        }`}
                      />
                    </span>
                  </button>
                </div>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">From Date</span>
                  <input
                    type="date"
                    required
                    value={form.fromDate}
                    onChange={(event) =>
                      setForm({ ...form, fromDate: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">To Date</span>
                  <input
                    type="date"
                    required
                    value={form.toDate}
                    onChange={(event) =>
                      setForm({ ...form, toDate: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
