"use client";

import { useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, UserRound, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { customerTypes, customers as demoCustomers, type CustomerRecord } from "@/lib/warehouse-data";

const thClass =
  "whitespace-nowrap px-4 py-3.5 text-left text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase";

const tdClass = "whitespace-nowrap px-4 py-3.5 text-sm";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-ring/30";

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  type: customerTypes[0],
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(demoCustomers);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<CustomerRecord | null>(null);
  const [viewing, setViewing] = useState<CustomerRecord | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const keyword = search.trim().toLowerCase();

  const filtered = customers.filter(
    (customer) =>
      keyword.length === 0 ||
      customer.name.toLowerCase().includes(keyword) ||
      customer.phone.toLowerCase().includes(keyword) ||
      customer.city.toLowerCase().includes(keyword),
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsOpen(true);
  };

  const openEdit = (customer: CustomerRecord) => {
    setEditing(customer);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      type: customer.type,
    });
    setIsOpen(true);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    if (editing) {
      setCustomers(
        customers.map((customer) =>
          customer.id === editing.id
            ? {
                ...customer,
                ...form,
                history: [...customer.history, `Diedit pada ${new Date().toLocaleDateString("id-ID")}`],
              }
            : customer,
        ),
      );
    } else {
      setCustomers([
        {
          id: `CUS-${Date.now()}`,
          ...form,
          createdAt: new Date().toLocaleDateString("id-ID"),
          history: [`Dibuat pada ${new Date().toLocaleDateString("id-ID")}`],
        },
        ...customers,
      ]);
    }

    setIsOpen(false);
  };

  const handleDelete = (customer: CustomerRecord) => {
    if (window.confirm(`Hapus customer "${customer.name}"?`)) {
      setCustomers(customers.filter((entry) => entry.id !== customer.id));
    }
  };

  return (
    <AppShell>
      <div className="w-full space-y-6">
        <header>
          <p className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">Master Data</p>
          <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Management Customer</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Database customer yang pernah melakukan pembelian di toko, diinput oleh kasir dan admin toko.
          </p>
        </header>

        <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <Plus className="size-4" />
            Create Customer
          </button>
          <div className="relative w-full sm:w-80">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, telepon, atau kota..."
              className={`${fieldClass} pl-9`}
            />
          </div>
        </div>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead className="border-b border-border bg-muted/60">
                <tr>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Tipe</th>
                  <th className={thClass}>Kontak</th>
                  <th className={thClass}>Kota</th>
                  <th className={thClass}>Alamat</th>
                  <th className={thClass}>Created At</th>
                  <th className={`${thClass} text-center`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-sm text-muted-foreground">
                      Belum ada customer yang cocok.
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer) => (
                    <tr key={customer.id} className="transition-colors hover:bg-muted/40">
                      <td className={tdClass}>
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
                            <UserRound className="size-4" />
                          </span>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{customer.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[10px] font-medium">
                          {customer.type}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <p>{customer.phone}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{customer.email}</p>
                      </td>
                      <td className={`${tdClass} text-muted-foreground`}>{customer.city}</td>
                      <td className={`${tdClass} max-w-64 truncate text-muted-foreground`}>{customer.address}</td>
                      <td className={`${tdClass} text-muted-foreground`}>{customer.createdAt}</td>
                      <td className={`${tdClass} text-center`}>
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewing(customer)}
                            className="rounded-lg bg-muted p-2 text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                            title="Lihat"
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(customer)}
                            className="rounded-lg bg-primary-soft p-2 text-primary transition-colors hover:bg-primary/20"
                            title="Edit"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(customer)}
                            className="rounded-lg bg-danger-soft p-2 text-danger transition-colors hover:bg-danger/20"
                            title="Hapus"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
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
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{editing ? "Edit Customer" : "Create Customer"}</h2>
              <button type="button" onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Nama Customer</span>
                  <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Tipe</span>
                  <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className={fieldClass}>
                    {customerTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Phone</span>
                  <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Email</span>
                  <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Kota</span>
                  <input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className={fieldClass} />
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Alamat</span>
                  <textarea required value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} rows={3} className={fieldClass} />
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted">
                  Batal
                </button>
                <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="w-full max-w-md rounded-2xl p-6 liquid-glass">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Detail Customer</h2>
              <button type="button" onClick={() => setViewing(null)} className="text-muted-foreground hover:text-danger">
                <X className="size-5" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                ["Nama", viewing.name],
                ["Tipe", viewing.type],
                ["Phone", viewing.phone],
                ["Email", viewing.email || "-"],
                ["Kota", viewing.city],
                ["Alamat", viewing.address],
                ["Created At", viewing.createdAt],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 rounded-xl bg-muted/60 p-3">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">History</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {viewing.history.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
