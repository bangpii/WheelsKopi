"use client";

import { useState } from "react";
import { ArrowRightLeft, Plus, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { useCan } from "@/lib/permissions";
import {
  displayDate,
  todayInputDate,
  type MovementItem,
  type MovementRecord,
} from "@/lib/transaction-data";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:border-primary/50";

const thClass =
  "whitespace-nowrap border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground";

const tdClass = "whitespace-nowrap border-b border-border/70 px-4 py-3 text-sm";

interface MovementForm {
  number: string;
  date: string;
  sourceStore: string;
  destinationStore: string;
}

export default function MovementPage() {
  const {
    products,
    movements: records,
    setMovements: setRecords,
    storeNames,
  } = useData();
  const can = useCan();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<MovementForm>({
    number: "",
    date: "",
    sourceStore: "",
    destinationStore: "",
  });
  const [items, setItems] = useState<MovementItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState("1");
  const [error, setError] = useState("");


  const openCreate = () => {
    setForm({
      number: `MV-${String(records.length + 1).padStart(4, "0")}`,
      date: todayInputDate(),
      sourceStore: storeNames[0],
      destinationStore: storeNames[1] ?? storeNames[0],
    });
    setItems([]);
    setSelectedProduct("");
    setQty("1");
    setError("");
    setIsOpen(true);
  };

  const addItem = () => {
    const product = products.find((item) => item.id === selectedProduct);
    const quantity = Number(qty) || 0;

    if (!product || quantity <= 0) {
      setError("Pilih produk dan qty lebih dari 0.");
      return;
    }

    setItems((current) => [
      ...current,
      { productId: product.id, name: product.namaBarang, qty: quantity },
    ]);
    setSelectedProduct("");
    setQty("1");
    setError("");
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.number.trim()) {
      setError("Movement number wajib diisi.");
      return;
    }

    if (form.sourceStore === form.destinationStore) {
      setError("Source store dan destination store harus berbeda.");
      return;
    }

    if (items.length === 0) {
      setError("Tambahkan minimal satu produk.");
      return;
    }

    const record: MovementRecord = {
      id: `${form.number}-${records.length + 1}`,
      number: form.number.trim(),
      date: displayDate(form.date),
      sourceStore: form.sourceStore,
      destinationStore: form.destinationStore,
      items,
      createdAt: new Date().toLocaleDateString("id-ID"),
    };

    const next = [record, ...records];
    setRecords(next);
    setIsOpen(false);
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              Transaction
            </p>
            <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Movement
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Pindahkan barang dari source store ke destination store. Produk
              diambil dari inventory.
            </p>
          </div>
          {can("movement", "input") && (
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              <Plus className="size-4" />
              Buat Movement
            </button>
          )}
        </header>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className={thClass}>Movement Number</th>
                  <th className={thClass}>Movement Date</th>
                  <th className={thClass}>Source Store</th>
                  <th className={thClass}>Destination Store</th>
                  <th className={thClass}>Products</th>
                  <th className={thClass}>Created At</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-14 text-center text-sm text-muted-foreground"
                    >
                      Belum ada movement.
                    </td>
                  </tr>
                ) : (
                  records.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className={`${tdClass} font-mono font-semibold`}>
                        {row.number}
                      </td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {row.date}
                      </td>
                      <td className={tdClass}>{row.sourceStore}</td>
                      <td className={tdClass}>
                        <span className="inline-flex items-center gap-1.5">
                          <ArrowRightLeft className="size-3.5 text-primary" />
                          {row.destinationStore}
                        </span>
                      </td>
                      <td className={tdClass}>
                        {row.items
                          .map((item) => `${item.name} x${item.qty}`)
                          .join(", ")}
                      </td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {row.createdAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Buat Movement
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
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Movement Number</span>
                  <input
                    required
                    value={form.number}
                    onChange={(event) =>
                      setForm({ ...form, number: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Movement Date</span>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Source Store</span>
                  <select
                    value={form.sourceStore}
                    onChange={(event) =>
                      setForm({ ...form, sourceStore: event.target.value })
                    }
                    className={fieldClass}
                  >
                    {storeNames.map((store) => (
                      <option key={store}>{store}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Destination Store</span>
                  <select
                    value={form.destinationStore}
                    onChange={(event) =>
                      setForm({ ...form, destinationStore: event.target.value })
                    }
                    className={fieldClass}
                  >
                    {storeNames.map((store) => (
                      <option key={store}>{store}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_90px_auto]">
                  <select
                    value={selectedProduct}
                    onChange={(event) => setSelectedProduct(event.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Pilih produk inventory</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.namaBarang} (stok {product.stok})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(event) => setQty(event.target.value)}
                    className={fieldClass}
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    className="rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Tambah
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-3 py-2 text-sm"
                    >
                      <span>
                        {item.name} x{item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setItems((current) =>
                            current.filter((_, i) => i !== index),
                          )
                        }
                        className="text-danger"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  Simpan Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
