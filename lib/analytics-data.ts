// lib/analytics-data.ts

/**
 * Simulasi perhitungan total penjualan berdasarkan ID produk.
 * Dalam aplikasi produksi, fungsi ini akan mengambil data dari tabel transaksi di database.
 */
export function getProductSalesCount(productId: string): number {
  // Menghasilkan nilai deterministik antara 10 - 59 berdasarkan karakter ID
  const charCodeSum = productId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return (charCodeSum % 50) + 10; 
}

/**
 * Menentukan batas minimum stok secara dinamis berdasarkan performa penjualan.
 * - Jika produk sering laku (sales > 30), batas minimal stoknya adalah 8.
 * - Jika produk jarang laku (sales <= 30), batas minimal stoknya adalah 4.
 */
export function getDynamicMinStock(productId: string): number {
  const sales = getProductSalesCount(productId);
  return sales > 30 ? 8 : 4;
}