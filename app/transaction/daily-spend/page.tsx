"use client";

import { useState } from "react";
import { Plus, Wallet, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { rupiah } from "@/lib/dashboard-data";
import { storeNames } from "@/lib/master-data";
import {
  displayDate,
  todayInputDate,
  type DailySpendItemRecord,
} from "@/lib/transaction-data";

const fieldClass =
  "w-full rounded-xl border border-border bg-background/70 px-3 py-2.5 text-sm outline-none focus:border-primary/50";

const thClass =
  "whitespace-nowrap border-b border-border px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground";

const tdClass = "whitespace-nowrap border-b border-border/70 px-4 py-3 text-sm";

const categories = [
  "Operasional",
  "Gaji",
  "Listrik & Air",
  "Sewa",
  "Marketing",
  "Lain-lain",
];

interface SpendForm {
  date: string;
  store: string;
  description: string;
  category: string;
  amount: string;
  spooring: string;
  salary: string;
  employeeId: string;
}

const emptyForm: SpendForm = {
  date: "",
  store: storeNames[0],
  description: "",
  category: "Operasional",
  amount: "0",
  spooring: "0",
  salary: "0",
  employeeId: "",
};

function isoWeekKey(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);

  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );

  return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

export default function DailySpendPage() {
  const {
    users,
    dailySpends: records,
    setDailySpends: setRecords,
  } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<SpendForm>(emptyForm);
  const [error, setError] = useState("");

  const employees = users.filter(
    (user) => user.status === "Aktif" && user.store === form.store,
  );
  const selectedEmployee = users.find((user) => user.id === form.employeeId);
  const salaryPeriod = selectedEmployee
    ? selectedEmployee.periodeGaji === "Mingguan"
      ? isoWeekKey(form.date)
      : form.date.slice(0, 7)
    : "";
  const salaryPeriodLabel = selectedEmployee
    ? `${selectedEmployee.periodeGaji} ${salaryPeriod}`
    : "";

  const spooringCut = (Number(form.spooring) || 0) * 0.3;
  const salary = Number(form.salary) || 0;
  const amount = Number(form.amount) || 0;
  const total = amount + salary - spooringCut;

  const openCreate = () => {
    setForm({ ...emptyForm, date: todayInputDate() });
    setError("");
    setIsOpen(true);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.description.trim()) {
      setError("Description wajib diisi.");
      return;
    }

    if (amount <= 0 && salary <= 0) {
      setError("Isi nominal spend atau gaji.");
      return;
    }

    if (salary > 0 && !selectedEmployee) {
      setError("Pilih karyawan dari List Karyawan jika mengisi gaji.");
      return;
    }

    if (
      salary > 0 &&
      selectedEmployee &&
      records.some(
        (row) =>
          row.employeeId === selectedEmployee.id &&
          row.salaryPeriod === salaryPeriod,
      )
    ) {
      setError(
        `Gaji ${selectedEmployee.name} untuk periode ${salaryPeriodLabel} sudah diinput.`,
      );
      return;
    }

    const record: DailySpendItemRecord = {
      id: `DS-${records.length + 1}-${form.description}`,
      date: displayDate(form.date),
      dateISO: form.date,
      store: form.store,
      description: form.description,
      category: form.category,
      amount,
      spooring: Number(form.spooring) || 0,
      salary,
      employeeId: salary > 0 ? selectedEmployee?.id : undefined,
      employeeName: salary > 0 ? selectedEmployee?.name : undefined,
      salaryPeriod: salary > 0 ? salaryPeriod : undefined,
      salaryPeriodType:
        salary > 0 ? selectedEmployee?.periodeGaji ?? "Bulanan" : undefined,
      total,
      status: "Approved",
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
              Daily Spend
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Input pengeluaran harian toko. Total spend dikurangi 30% dari
              transaksi spooring pada hari tersebut, lalu ditambah gaji jika ada.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" />
            Tambah Daily Spend
          </button>
        </header>

        <div className="surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className={thClass}>Tanggal</th>
                  <th className={thClass}>Store</th>
                  <th className={thClass}>Description</th>
                  <th className={thClass}>Category</th>
                  <th className={thClass}>Karyawan</th>
                  <th className={`${thClass} text-right`}>Spend</th>
                  <th className={`${thClass} text-right`}>30% Spooring</th>
                  <th className={`${thClass} text-right`}>Gaji</th>
                  <th className={`${thClass} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-14 text-center text-sm text-muted-foreground"
                    >
                      Belum ada data daily spend.
                    </td>
                  </tr>
                ) : (
                  records.map((row) => (
                    <tr key={row.id} className="hover:bg-muted/30">
                      <td className={tdClass}>{row.date}</td>
                      <td className={tdClass}>{row.store}</td>
                      <td className={`${tdClass} font-medium`}>
                        {row.description}
                      </td>
                      <td className={tdClass}>{row.category}</td>
                      <td className={tdClass}>
                        {row.employeeName ? (
                          <div>
                            <p className="font-medium">{row.employeeName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {row.salaryPeriodType
                                ? `${row.salaryPeriodType} · `
                                : ""}
                              {row.salaryPeriod}
                            </p>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className={`${tdClass} text-right font-mono`}>
                        {rupiah.format(row.amount)}
                      </td>
                      <td className={`${tdClass} text-right font-mono`}>
                        {rupiah.format(row.spooring * 0.3)}
                      </td>
                      <td className={`${tdClass} text-right font-mono`}>
                        {rupiah.format(row.salary)}
                      </td>
                      <td
                        className={`${tdClass} text-right font-mono font-semibold`}
                      >
                        {rupiah.format(row.total)}
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
                Tambah Daily Spend
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
                  <span className="font-medium">Tanggal Spend</span>
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
                  <span className="font-medium">Store</span>
                  <select
                    value={form.store}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        store: event.target.value,
                        employeeId: "",
                        salary: "0",
                      })
                    }
                    className={fieldClass}
                  >
                    {storeNames.map((store) => (
                      <option key={store}>{store}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm sm:col-span-2">
                  <span className="font-medium">Description</span>
                  <input
                    required
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Pembelian perlengkapan toko"
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Category</span>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                    className={fieldClass}
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Spend (Rp)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Transaksi Spooring (Rp)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.spooring}
                    onChange={(event) =>
                      setForm({ ...form, spooring: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Karyawan (List Karyawan)</span>
                  <select
                    value={form.employeeId}
                    onChange={(event) => {
                      const employee = users.find(
                        (user) => user.id === event.target.value,
                      );
                      setForm({
                        ...form,
                        employeeId: event.target.value,
                        salary: employee
                          ? String(employee.gajiPokok ?? 0)
                          : form.salary,
                      });
                    }}
                    className={fieldClass}
                  >
                    <option value="">Tanpa gaji / pilih karyawan</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - {employee.role}
                      </option>
                    ))}
                  </select>
                  {selectedEmployee && (
                    <span className="block text-[11px] text-muted-foreground">
                      Periode {salaryPeriodLabel}
                    </span>
                  )}
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Gaji (Rp)</span>
                  <input
                    type="number"
                    min={0}
                    value={form.salary}
                    onChange={(event) =>
                      setForm({ ...form, salary: event.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-border bg-muted/40 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Wallet className="size-4" />
                    Total setelah 30% spooring + gaji
                  </span>
                  <span className="font-mono text-lg font-semibold">
                    {rupiah.format(total)}
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
