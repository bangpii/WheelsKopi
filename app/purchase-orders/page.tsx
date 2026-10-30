"use client";

import { useState } from "react";
import {
  Plus,
  Printer,
  Eye,
  Trash2,
  ArrowLeft,
  Save,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { useData } from "@/lib/context/data-context";
import { storeNames } from "@/lib/master-data";
import { purchaseOrders as demoPurchaseOrders } from "@/lib/operations-data";

interface ProductItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  discount: number;
}

interface PurchaseOrder {
  id: string;
  channel: "Distributor" | "Store";
  number: string;
  date: string;
  supplier: string;
  store: string;
  createdBy: string;
  grandTotal: number;
  status: string;
  receiptStatus: string;
  createdAt: string;
  items: ProductItem[];
}

const STORES = storeNames;

export default function PurchaseOrdersPage() {
  // 2. AMBIL DATA DARI CONTEXT
  const {
    stockItems,
    setStockItems,
    transactions,
    setTransactions,
    suppliers,
  } = useData();

  const [viewMode, setViewMode] = useState<"list" | "create">("list");

  const [channel, setChannel] = useState<"Distributor" | "Store">(
    "Distributor",
  );

  const [orders, setOrders] = useState<PurchaseOrder[]>(demoPurchaseOrders);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState<{
    numberPO: string;
    channel: "Distributor" | "Store";
    supplier: string;
    store: string;
    discountPercent: number;
    description: string;
    createdBy: string;
  }>({
    numberPO: "",
    channel: "Distributor",
    supplier: "",
    store: "",
    discountPercent: 0,
    description: "",
    createdBy: "adminwheels",
  });

  const [items, setItems] = useState<ProductItem[]>([]);

  const handleAddProduct = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: "", qty: 1, price: 0, discount: 0 },
    ]);
  };

  const handleUpdateItem = (
    id: string,
    field: keyof ProductItem,
    value: string | number,
  ) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const calculateSubtotal = (item: ProductItem) => item.qty * item.price;

  const totalPrice = items.reduce(
    (sum, item) => sum + calculateSubtotal(item),
    0,
  );

  const totalProductDiscount = items.reduce(
    (sum, item) => sum + item.discount,
    0,
  );

  const discountValueFromPercent =
    (totalPrice * formData.discountPercent) / 100;

  const grandTotal =
    totalPrice - totalProductDiscount - discountValueFromPercent;

  const handleSave = (status: "Completed" | "Draft") => {
    if (!formData.supplier || !formData.store || items.length === 0) {
      alert("Mohon lengkapi Supplier, Store, dan tambahkan minimal 1 produk.");

      return;
    }

    const newOrderId = formData.numberPO || `PO-${Date.now()}`;

    // 3. SIMPAN KE CONTEXT TRANSAKSI (AGAR MASUK DASHBOARD)
    const newTransaction = {
      id: newOrderId,
      customer: formData.supplier,
      items: items.length,
      total: grandTotal,
      status: status === "Draft" ? ("Proses" as const) : ("Lunas" as const),
      method: "Transfer" as const,
      time: new Date().toLocaleTimeString(),
    };

    setTransactions([...transactions, newTransaction]);

    // 4. UPDATE STOK DI CONTEXT (KURANGI STOK SESUAI QTY YANG DIBELI)
    const updatedStockItems = stockItems.map((stock) => {
      const orderedItem = items.find((i) => i.name === stock.name);

      if (orderedItem) {
        return { ...stock, stock: stock.stock - orderedItem.qty };
      }

      return stock;
    });

    setStockItems(updatedStockItems);

    // 5. SIMPAN KE LOCAL STATE HALAMAN PO
    const newOrder: PurchaseOrder = {
      id: newOrderId,
      channel: formData.channel,
      number: newOrderId,
      date: new Date().toLocaleDateString(),
      supplier: formData.supplier,
      store: formData.store,
      createdBy: formData.createdBy,
      grandTotal: grandTotal,
      status: status === "Draft" ? "Pending" : "Completed",
      receiptStatus: status === "Draft" ? "Pending" : "Completed",
      createdAt: new Date().toLocaleString(),
      items: items,
    };

    setOrders([newOrder, ...orders]);
    setViewMode("list");

    // Reset Form
    setFormData({
      numberPO: "",
      channel: "Distributor",
      supplier: "",
      store: "",
      discountPercent: 0,
      description: "",
      createdBy: "adminwheels",
    });
    setItems([]);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.channel === channel &&
      (o.supplier.toLowerCase().includes(search.toLowerCase()) ||
        o.number.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <AppShell>
      <div className="w-full space-y-6">
        {viewMode === "list" && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Transaction Purchase Order
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {channel === "Distributor"
                  ? "Purchase order distributor Anagata Makmur Group."
                  : "Purchase order toko yang diinput kasir atau admin toko."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["Distributor", "Store"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setChannel(option)}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                    channel === option
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option === "Distributor"
                    ? "Distributor (AMG)"
                    : "Store (Toko)"}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border shadow-sm">
              <button
                onClick={() => {
                  setFormData((current) => ({ ...current, channel }));
                  setViewMode("create");
                }}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="size-4" /> Create Purchase Order
              </button>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Search:</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Cari nomor PO atau supplier..."
                />
              </div>
            </div>

            <div className="surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Number</th>
                      <th className="px-4 py-3 font-semibold">Number Manual</th>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Supplier</th>
                      <th className="px-4 py-3 font-semibold">In Store</th>
                      <th className="px-4 py-3 font-semibold">Created By</th>
                      <th className="px-4 py-3 font-semibold text-right">
                        Grand Total
                      </th>
                      <th className="px-4 py-3 font-semibold text-center">
                        Status
                      </th>
                      <th className="px-4 py-3 font-semibold text-center">
                        Status Receipt
                      </th>
                      <th className="px-4 py-3 font-semibold">Created At</th>
                      <th className="px-4 py-3 font-semibold text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map((o) => (
                      <tr
                        key={o.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-primary">
                          {o.number}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {o.number}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {o.date}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {o.supplier}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {o.store}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {o.createdBy}
                        </td>
                        <td className="px-4 py-3 font-semibold text-right text-foreground">
                          Rp {o.grandTotal.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded text-[10px] font-bold ${o.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                          {o.receiptStatus}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {o.createdAt}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">
                            <button
                              className="rounded bg-primary p-1.5 text-white hover:bg-primary/90 transition-colors"
                              title="Print"
                            >
                              <Printer className="size-4" />
                            </button>
                            <button
                              className="rounded bg-primary p-1.5 text-white hover:bg-primary/90 transition-colors"
                              title="Detail"
                            >
                              <Eye className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td
                          colSpan={11}
                          className="px-5 py-12 text-center text-muted-foreground"
                        >
                          Belum ada data Purchase Order. Silakan buat baru.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {viewMode === "create" && (
          <div className="bg-background rounded-xl border border-border shadow-sm">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
              <h1 className="text-xl font-bold text-foreground">
                Create Purchase Order
              </h1>
              <button
                onClick={() => setViewMode("list")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-500 transition-colors"
              >
                <ArrowLeft className="size-4" /> Kembali
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="w-40 text-sm font-medium text-muted-foreground text-right">
                      Date
                    </label>
                    <input
                      readOnly
                      type="text"
                      value={new Date().toLocaleString()}
                      className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-40 text-sm font-medium text-muted-foreground text-right">
                      Number PO Manual
                    </label>
                    <input
                      type="text"
                      value={formData.numberPO}
                      onChange={(e) =>
                        setFormData({ ...formData, numberPO: e.target.value })
                      }
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Otomatis jika kosong"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-40 text-sm font-medium text-muted-foreground text-right">
                      Tipe PO
                    </label>
                    <select
                      value={formData.channel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          channel:
                            e.target.value === "Store"
                              ? "Store"
                              : "Distributor",
                        })
                      }
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Distributor">
                        Distributor (Anagata Makmur Group)
                      </option>
                      <option value="Store">Store (Toko)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-40 text-sm font-medium text-muted-foreground text-right">
                      Supplier
                    </label>
                    <select
                      required
                      value={formData.supplier}
                      onChange={(e) =>
                        setFormData({ ...formData, supplier: e.target.value })
                      }
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="">Please Select Supplier</option>
                      {formData.channel === "Store" && (
                        <option value="Anagata Makmur Group">
                          Anagata Makmur Group
                        </option>
                      )}
                      {suppliers.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-40 text-sm font-medium text-muted-foreground text-right">
                      Discount %
                    </label>
                    <input
                      type="number"
                      value={formData.discountPercent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPercent: Number(e.target.value),
                        })
                      }
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <label className="w-40 text-sm font-medium text-muted-foreground text-right">
                      Deliver To (Store)
                    </label>
                    <select
                      required
                      value={formData.store}
                      onChange={(e) =>
                        setFormData({ ...formData, store: e.target.value })
                      }
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="">Please Select Store</option>
                      {STORES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-start gap-4">
                    <label className="w-40 text-sm font-medium text-muted-foreground text-right mt-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      rows={3}
                      placeholder="Catatan tambahan..."
                    ></textarea>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-40 text-sm font-medium text-muted-foreground text-right">
                      Created By
                    </label>
                    <input
                      readOnly
                      type="text"
                      value={formData.createdBy}
                      className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden mb-6">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center">#</th>
                      <th className="px-4 py-3">Name Product</th>
                      <th className="px-4 py-3 w-24">Qty</th>
                      <th className="px-4 py-3 w-40 text-right">Price</th>
                      <th className="px-4 py-3 w-32 text-right">Discount</th>
                      <th className="px-4 py-3 w-40 text-right">Subtotal</th>
                      <th className="px-4 py-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {items.map((item, index) => (
                      <tr
                        key={item.id}
                        className="bg-background hover:bg-muted/10"
                      >
                        <td className="px-4 py-2 text-center text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={item.name}
                            onChange={(e) =>
                              handleUpdateItem(item.id, "name", e.target.value)
                            }
                            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm outline-none"
                          >
                            <option value="">Pilih Produk...</option>
                            {stockItems.map((p) => (
                              <option key={p.id} value={p.name}>
                                {p.name} ({p.brand})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "qty",
                                Number(e.target.value),
                              )
                            }
                            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm outline-none text-center"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "price",
                                Number(e.target.value),
                              )
                            }
                            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm outline-none text-right"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                "discount",
                                Number(e.target.value),
                              )
                            }
                            className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm outline-none text-right"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-foreground">
                          Rp {calculateSubtotal(item).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="bg-muted/20 p-3 border-t border-border">
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="size-3" /> Add Product
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="flex-1"></div>

                <div className="w-full md:w-96 space-y-3 bg-muted/20 p-4 rounded-xl border border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      TOTAL
                    </span>
                    <span className="font-semibold text-foreground">
                      Rp {totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      DISCOUNT PRODUCT
                    </span>
                    <span className="font-semibold text-red-500">
                      - Rp {totalProductDiscount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">
                      DISCOUNT VALUE ({formData.discountPercent}%)
                    </span>
                    <span className="font-semibold text-red-500">
                      - Rp {discountValueFromPercent.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-bold text-foreground">
                      GRAND TOTAL
                    </span>
                    <span className="font-bold text-lg text-primary">
                      Rp {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-border pt-6">
                <button
                  onClick={() => handleSave("Draft")}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <Save className="size-4" /> Save As Draft
                </button>
                <button
                  onClick={() => handleSave("Completed")}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="size-4" /> Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
