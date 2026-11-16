# Alur Sistem WheelsKopi (Distribusi → Purchase Order → Receipt PO → Stok)

Dokumen ini menjelaskan alur proses, use case, dan status data (simulasi FE/state, update realtime tanpa refresh).

## 1) Aktor & Use Case

```text
+-------------------+        +------------------------------------------------------+
| Aktor             |        | Use Case                                             |
+-------------------+        +------------------------------------------------------+
| Admin / Backoffice| -----> | (1) Kelola Master Data Distribusi                    |
|                   |        |     - Merek/Tipe/Ring, Kategori Others/Sorted        |
|                   | -----> | (2) Registrasi & Kelola Produk Distributor           |
|                   |        |     - Ban / Others (Velg, suspensi, per, shock,dll)  |
|                   |        |     - Sorted (minuman, parfum, filter oli, dll)      |
|                   | -----> | (3) Buat Purchase Order (PO)                         |
|                   |        |     - Pilih item terdaftar, isi kode/bon, qty, harga |
|                   |        |     - Status: Draft / Pending / Selesai              |
|                   | -----> | (4) Buat Receipt PO (Penerimaan Barang)              |
|                   |        |     - Pending: barang belum sampai                   |
|                   |        |     - Selesai: konfirmasi barang & ongkir final      |
|                   | -----> | (5) Pantau Update Stok (mutasi bulanan)              |
+-------------------+        +------------------------------------------------------+
                                       |
                                       v
                             +--------------------------+
                             | Sistem (State/DataContext|
                             | + Integrasi Stok/Finance)|
                             +--------------------------+
```

## 2) Diagram Alur Proses Utama

```text
[ START ]
    |
    v
+---------------------------------------------------------------+
| (1) DISTRIBUSI / MASTER PRODUK                                |
| - Registrasi produk: Ban / Others / Sorted                    |
| - Others: Velg, suspensi, per, shock, dll                     |
| - Sorted: minuman, parfum, filter oli, dll                    |
| - Simpan master data (merek/tipe/ring/kategori)              |
+-------------------------------+-------------------------------+
                                |
                                | Item terdaftar + kode barang
                                v
+---------------------------------------------------------------+
| (2) PURCHASE ORDER (PO)                                       |
| - Pilih barang dari distribusi (kategori & item)              |
| - Isi: supplier, deliver to, nomor bon/kode, qty, harga, dll  |
| - Hitung rumus otomatis (lihat bagian 4)                      |
| - Status awal:                                                |
|     * Draft   : rancangan                                     |
|     * Pending : order dibuat, barang belum sampai             |
|     * Selesai : barang diterima & diproses (opsional dari PO) |
| - Ongkir/UP bisa belum final (isi estimasi/0 dulu)            |
+-------------------------------+-------------------------------+
                                |
                                | PO dibuat (Pending/Draft/Selesai)
                                v
+---------------------------------------------------------------+
| (3) RECEIPT PURCHASE ORDER (Penerimaan)                       |
| - Pilih Number PO -> tampil data PO realtime                  |
| - Isi tanggal terima/arrival, alamat, notes                   |
|                                                               |
|   [ Pilih Status Penerimaan ]                                 |
|        |                         |                            |
|        v                         v                            |
|  +-------------------+   +---------------------------------+  |
|  | PENDING           |   | SELESAI / COMPLETED             |  |
|  | Barang belum      |   | Barang sudah sampai & di-ACC    |  |
|  | sampai            |   |                                 |  |
|  | - Simpan receipt  |   | - Isi/konfirmasi ongkir final   |  |
|  | - Update PO       |   |   & modal toko (Others/Velg)    |  |
|  |   (arrival/ongkir/|   | - Hitung ulang Shipfee/Set,     |  |
|  |    modal/UP/status|   |   Modal/Set, UP (realtime)      |  |
|  |    jika diisi)    |   | - Update PO (harga/UP/field)    |  |
|  | - TIDAK tambah    |   | - Tambah STOK produk            |  |
|  |   stok & finance  |   | - Catat FINANCE (ledger)        |  |
|  +---------+---------+   +----------------+----------------+  |
|            \                         /                        |
|             \                       /                         |
|              v                     v                          |
|                 (State/DataContext ter-update realtime,        |
|                  tanpa refresh; cegah proses ganda received)  |
+-------------------------------+-------------------------------+
                                |
                                | Jika Selesai (received)
                                v
+---------------------------------------------------------------+
| (4) DAMPAK SISTEM                                             |
| - Purchase Orders : status/ongkir/modal/UP/arrival ter-update |
| - Produk/Stok     : qty bertambah (barang masuk)              |
| - Finance Store   : entry pembelian (purchase) tercatat       |
| - Update Stok     : kolom "In" bulanan ikut ter-update        |
+-------------------------------+-------------------------------+
                                |
                                v
                             [ END ]
```

## 3) Alur Status (Ringkas)

```text
PO dibuat/backoffice isi data awal (Raw Price, dll; ongkir boleh kosong)
    |
    +--> [Draft]    : simpan rancangan
    |
    +--> [Pending]  : order jalan, barang belum sampai
    |        |
    |        +--> Receipt PO (Pending): simpan info, BELUM proses stok/finance
    |        |
    |        +--> Barang sampai + ongkir final diinput + ACC
    |                 |
    v                 v
 [Completed/Selesai] <---- Receipt PO (Selesai)
    - PO ter-update (ongkir/modal/UP/harga/arrival)
    - Stok + Finance diproses (realtime, sekali saja)
```

## 4) Aturan & Rumus Penting

```text
+----------------------+--------------------------------------------------------------+
| Kategori             | Aturan                                                       |
+----------------------+--------------------------------------------------------------+
| Ban / Sorted         | - Qty, Harga Total, Harga Satuan (otomatis)                  |
|                      | - Ongkir umumnya masuk ke harga total                        |
|                      | - Selesai/received => stok masuk (Update Stok)               |
+----------------------+--------------------------------------------------------------+
| Others (non-Velg)    | - Form/detail Others                                          |
+----------------------+--------------------------------------------------------------+
| Others / Velg        | - Raw Price, Discount, Shipping Fee, Modal Toko, UP, dll      |
|                      | - Ongkir total dapat diisi/ditentukan saat Receipt (final)   |
|                      | - Ongkir terkait per set:                                    |
|                          Shipfee/Set = Shipping Fee Total / Qty                    |
|                      | - Modal/UP dihitung ulang dari ongkir final (realtime)       |
|                      | - Selesai/received => update PO + stok + finance             |
+----------------------+--------------------------------------------------------------+
| Receipt Pending      | - Barang belum sampai                                        |
|                      | - Boleh simpan dulu, tidak menambah stok/finance             |
+----------------------+--------------------------------------------------------------+
| Receipt Selesai      | - Barang sampai/ACC, ongkir & UP final                       |
|                      | - Proses stok & finance sekali (cegah duplikasi received)    |
+----------------------+--------------------------------------------------------------+
```

## 5) Yang Baru Diupdate

### Porting / Fungsional (dari referensi fungsional, UI saat ini dipertahankan)
- `lib/distribusi-data.ts`
  - Tambah kategori `Sorted`, `initialSortedItems`, merge ke `initialDistribusiItems`, update `formToItem`.
- `lib/purchase-data.ts`
  - `PurchaseOrderCategory` mencakup `Sorted`; `buildSeedPurchaseOrders` deteksi Ban/Others/Sorted.
  - Status PO diperluas: `Draft | Pending | Completed`.
- `lib/context/data-context.tsx`
  - `Product.kategoriUtama` mendukung `"Ban" | "Others" | "Sorted"`.
- `app/distribusi/page.tsx`
  - Tab Ban/Others/Sorted, master data (merek/tipe/ring/kategori) via `localStorage`, import CSV, export Excel/CSV & print, auto-add subkategori.
- `components/distribusi/register-product-modal.tsx`
  - Form/validasi per Ban/Others/Sorted, opsi dari master data.
- `app/purchase-orders/page.tsx`
  - Dukungan Ban/Others/Sorted, kolom & kalkulasi harga (Ban/Sorted & Others/Velg), status Draft/Pending/Selesai; proses stok+finance hanya saat Completed/received.
- `app/update-stock/page.tsx` (baru, `/update-stock`)
  - Mutasi stok bulanan (In/Out/Close) untuk Ban/Others/Sorted; **In** dari PO yang `received`.
- `components/dashboard/insight-grid.tsx`
  - Penyesuaian tipe/link untuk kategori `Sorted`.

### Perbaikan UX
- `app/distribusi/page.tsx`
  - Modal "Kelola Merek, Tipe, Ring & Kategori" dipusatkan + click-outside close.
  - Kurangi lag scroll: hapus `backdrop-blur`, sesuaikan overlay, tambah `overscroll-contain`.

### Perbaikan Alur Receipt PO ↔ Purchase Orders (terbaru)
- `lib/warehouse-data.ts`
  - `ReceiptPORecord` + field opsional `shippingFee`, `notes`.
- `app/transaction/receipt/page.tsx` (rework)
  - Receipt status **Pending / Selesai**.
  - Pilih PO → tampil data PO realtime; Others/Velg: input ongkir total final & modal toko, kalkulasi realtime **Shipfee/Set, Sub Total/Modal PT, Modal/Set, UP**.
  - **Pending**: simpan receipt + update info PO (arrival/ongkir/modal/UP/status) **tanpa** tambah stok/finance.
  - **Selesai**: update PO final → tambah stok (`applyPurchaseOrderToStock`) + catat finance (`upsertFinanceLedger`) realtime, tanpa refresh, dan cegah proses ganda jika sudah `received`.

### Catatan Teknis
- Sumber kebenaran state: `DataContext` (`localStorage`) + integrasi `lib/integration.ts`.
- Halaman `/inventory` referensi tidak di-port (tidak kompatibel dengan API `DataContext` saat ini).
- Verifikasi: `npm run typecheck` lulus. `npm run lint` masih memiliki error/warning lama (pre-existing, bukan dari perubahan ini).
