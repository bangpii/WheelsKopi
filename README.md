# WheelsKopi

Sistem ERP berbasis dashboard untuk WheelsKopi. Dibangun dengan Next.js 16 (App Router, Turbopack), React 19, TypeScript, dan Tailwind CSS v4.

## Menjalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Deskripsi Font

Project ini memakai tiga font yang dimuat secara lokal lewat `next/font/google` (tanpa request ke server Google saat runtime):

| Font | Variabel CSS | Utility Tailwind | Penggunaan |
| --- | --- | --- | --- |
| **Poppins** | `--font-poppins` | `font-display` | Judul halaman, heading card, brand, angka besar yang menonjol |
| **Inter** | `--font-inter` | `font-sans` (default) | Body text, tabel, form, navigasi, label, dan angka |
| **Geist Mono** | `--font-geist-mono` | `font-mono` | Kode, SKU, ID transaksi, dan data teknis |

### Alasan pemilihan

- Poppins bersifat geometris dan ramah, cocok untuk memperkuat identitas brand WheelsKopi pada elemen display.
- Inter sangat legibel di ukuran kecil dan memiliki angka tabular, sehingga ideal untuk tabel dan metrik dashboard ERP.
- Geist Mono memberi jarak karakter yang konsisten untuk kode atau nominal yang harus sejajar.

### Cara pakai

```tsx
<h1 className="font-display text-2xl font-semibold">Dashboard</h1>

<p className="font-sans tabular-nums">Rp 12.450.000</p>

<span className="font-mono text-sm">SKU-0042</span>
```

Konfigurasi font berada di `app/layout.tsx`, sedangkan pemetaan utility Tailwind ada di `app/globals.css` pada blok `@theme inline`.

## Struktur

```text
app/
  layout.tsx    # root layout + konfigurasi font
  page.tsx      # halaman Hello World
  globals.css   # Tailwind + token font/warna
tools/oxlint/anti-slop/   # plugin lint anti-slop (vendored)
oxlint.config.ts          # konfigurasi aturan anti-slop
```

## Skrip

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # jalankan hasil build
npm run lint       # ESLint
npm run lint:oxlint # Oxlint + anti-slop
npm run typecheck  # TypeScript check
```
