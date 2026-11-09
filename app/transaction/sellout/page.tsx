"use client";

import { useMemo, useState } from "react";
import { Car, PackageMinus, Plus, Search, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { rupiah } from "@/lib/dashboard-data";
import { storeNames } from "@/lib/master-data";
import {
  displayDate,
  inputTime,
  selloutSubtotal,
  todayInputDate,
  type SelloutItem,
  type SelloutRecord,
} from "@/lib/transaction-data";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

const thClass =
  "whitespace-nowrap border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground";

const tdClass = "whitespace-nowrap border-b border-border/70 px-4 py-3 text-sm";

interface SelloutForm {
  date: string;
  customer: string;
  description: string;
  car: string;
  licensePlate: string;
  store: string;
}

const emptyForm: SelloutForm = {
  date: "",
  customer: "",
  description: "",
  car: "",
  licensePlate: "",
  store: storeNames[0],
};

export default function SelloutPage() {
  const {
    products,
    setProducts,
    customers,
    sellouts: records,
    setSellouts: setRecords,
  } = useData();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<SelloutForm>(emptyForm);
  const [items, setItems] = useState<SelloutItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("0");
  const [error, setError] = useState("");


  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return records;

    return records.filter((row) =>
      [
        row.number,
        row.customer,
        row.store,
        row.car,
        row.licensePlate,
        row.description,
      ].some((value) => value.toLowerCase().includes(keyword)),
    );
  }, [records, search]);

  const totalSellout = records.reduce((sum, row) => sum + row.total, 0);
  const waiting = records.filter(
    (row) => row.status === "Menunggu Approval",
  ).length;

  const openCreate = () => {
    setForm({ ...emptyForm, date: todayInputDate() });
    setItems([]);
    setSelectedProduct("");
    setQty("1");
    setPrice("0");
    setError("");
    setIsOpen(true);
  };

  const chooseProduct = (productId: string) => {
    setSelectedProduct(productId);
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    setPrice(String(product.standarPrice || product.hargaModalToko || 0));
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
      {
        productId: product.id,
        name: product.namaBarang,
        qty: quantity,
        price: Number(price) || 0,
      },
    ]);
    setSelectedProduct("");
    setQty("1");
    setPrice("0");
    setError("");
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.customer) {
      setError("Customer wajib dipilih.");
      return;
    }

    if (!form.car.trim() || !form.licensePlate.trim()) {
      setError("Jenis mobil dan license plat wajib diisi.");
      return;
    }

    if (items.length === 0) {
      setError("Tambahkan minimal satu produk sellout.");
      return;
    }

    const number = `SO-${String(records.length + 1).padStart(4, "0")}`;
    const record: SelloutRecord = {
      id: `${number}-${form.customer}`,
      number,
      date: displayDate(form.date),
      dateISO: form.date,
      time: inputTime(),
      paymentMethod: "Transfer",
      customer: form.customer,
      description: form.description,
      car: form.car,
      licensePlate: form.licensePlate,
      store: form.store,
      items,
      total: selloutSubtotal(items),
      status: "Menunggu Approval",
      createdAt: new Date().toLocaleDateString("id-ID"),
    };

    const next = [record, ...records];
    setRecords(next);

    setProducts((current) =>
      current.map((product) => {
        const sold = items.find((item) => item.productId === product.id);
        if (!sold) return product;

        return {
          ...product,
          stok: Math.max(0, product.stok - sold.qty),
        };
      }),
    );

    setIsOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Hapus data sellout ini?")) return;
    const next = records.filter((row) => row.id !== id);
    setRecords(next);
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
              Sellout
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Input barang keluar terlebih dahulu. Sellout bukan invoice; invoice
              dibuat setelah sellout disetujui kepala toko.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_16px_32px_-16px_var(--primary)]"
          >
            <Plus className="size-4" />
            Buat Sellout
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="surface p-5">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Total Sellout
            </p>
            <p className="font-display mt-1 text-xl font-semibold tabular-nums">
              {rupiah.format(totalSellout)}
            </p>
          </div>
          <div className="surface p-5">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Menunggu Approval
            </p>
            <p className="font-display mt-1 text-xl font-semibold tabular-nums">
              {waiting}
            </p>
          </div>
          <div className="surface p-5">
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              Total Transaksi
            </p>
            <p className="font-display mt-1 text-xl font-semibold tabular-nums">
              {records.length}
            </p>
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari customer, nomor, mobil..."
                className="w-full rounded-xl border border-border bg-background/70 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary/50"
              />
            </div>
            <span className="rounded-full border border-border bg-muted/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              {filtered.length} sellout
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className={thClass}>Nomor</th>
                  <th className={thClass}>Tanggal</th>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Mobil</th>
                  <th className={thClass}>License Plat</th>
                  <th className={thClass}>Store</th>
                  <th className={thClass}>Description</th>
                  <th className={thClass}>Produk</th>
                  <th className={`${thClass} text-right`}>Total</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-center`}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-14 text-center text-sm text-muted-foreground"
                    >
                      Belum ada data sellout. Buat sellout pertama untuk mulai.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className={`${tdClass} font-mono font-semibold`}>
                        {row.number}
                      </td>
                      <td className={`${tdClass} text-muted-foreground`}>
                        {row.date}
                      </td>
                      <td className={`${tdClass} font-medium`}>{row.customer}</td>
                      <td className={tdClass}>{row.car}</td>
                      <td className={`${tdClass} font-mono`}>
                        {row.licensePlate}
                      </td>
                      <td className={tdClass}>{row.store}</td>
                      <td className={`${tdClass} max-w-[220px] truncate`}>
                        {row.description || "-"}
                      </td>
                      <td className={tdClass}>
                        {row.items
                          .map((item) => `${item.name} x${item.qty}`)
                          .join(", ")}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold tabular-nums`}
                      >
                        {rupiah.format(row.total)}
                      </td>
                      <td className={tdClass}>
                        <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[10px] font-semibold text-warning">
                          {row.status}
                        </span>
                      </td>
                      <td className={`${tdClass} text-center`}>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          className="rounded-lg bg-danger-soft p-2 text-danger hover:bg-danger/20"
                          title="Hapus"
                        >
                          <Trash2 className="size-4" />
                        </button>
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
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  Buat Sellout
                </h2>
                <p className="text-xs text-muted-foreground">
                  Barang keluar akan mengurangi stok inventory.
                </p>
              </div>
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
                  <span className="font-medium">Customer</span>
                  <select
                    required
                    value={form.customer}
                    onChange={(event) =>
                      setForm({ ...form, customer: event.target.value })
                    }
                    className={fieldClass}
                  >
                    <option value="">Pilih customer</option>
                    {customers.map((customer) => (
                      <option key={customer.name} value={customer.name}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
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
                  <span className="font-medium">Tanggal</span>
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
                  <span className="font-medium">Car / Jenis Mobil</span>
                  <input
                    required
                    value={form.car}
                    onChange={(event) =>
                      setForm({ ...form, car: event.target.value })
                    }
                    placeholder="Toyota Avanza"
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">License Plat</span>
                  <input
                    required
                    value={form.licensePlate}
                    onChange={(event) =>
                      setForm({ ...form, licensePlate: event.target.value })
                    }
                    placeholder="BK 1234 AB"
                    className={`${fieldClass} font-mono uppercase`}
                  />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Description</span>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Catatan tambahan"
                    className={`${fieldClass} resize-none`}
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <PackageMinus className="size-4 text-primary" />
                  Produk Sellout
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_90px_140px_auto]">
                  <select
                    value={selectedProduct}
                    onChange={(event) => chooseProduct(event.target.value)}
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
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className={fieldClass}
                    placeholder="Harga"
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
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Belum ada produk ditambahkan.
                    </p>
                  ) : (
                    items.map((item, index) => (
                      <div
                        key={`${item.productId}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-border bg-background/70 px-3 py-2 text-sm"
                      >
                        <span>
                          {item.name} x{item.qty} —{" "}
                          {rupiah.format(item.qty * item.price)}
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
                    ))
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="font-medium">Total</span>
                  <span className="font-mono font-semibold">
                    {rupiah.format(selloutSubtotal(items))}
                  </span>
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
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  <Car className="size-4" />
                  Simpan Sellout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
