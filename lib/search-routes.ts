export interface SearchPage {
  id: string;
  group: string;
  title: string;
  subtitle: string;
  href: string;
}

export const PAGE_RESULTS: SearchPage[] = [
  { id: "p-dashboard", group: "Halaman", title: "Dashboard", subtitle: "Ringkasan usaha", href: "/" },
  { id: "p-distribusi", group: "Halaman", title: "Product Distributor", subtitle: "Stok gudang distributor", href: "/distribusi" },
  { id: "p-products", group: "Halaman", title: "Product Store", subtitle: "Stok produk toko", href: "/products" },
  { id: "p-others", group: "Halaman", title: "Others", subtitle: "Master Management", href: "/others" },
  { id: "p-stock", group: "Halaman", title: "Stock List", subtitle: "Master Management", href: "/stock-list" },
  { id: "p-suppliers", group: "Halaman", title: "Supplier", subtitle: "Master Management", href: "/suppliers" },
  { id: "p-stores", group: "Halaman", title: "Store", subtitle: "Master Management", href: "/stores" },
  { id: "p-users", group: "Halaman", title: "User", subtitle: "Master Management", href: "/users" },
  { id: "p-payments", group: "Halaman", title: "Payment", subtitle: "Master Management", href: "/payments" },
  { id: "p-services", group: "Halaman", title: "Service", subtitle: "Master Management", href: "/services" },
  { id: "p-cars", group: "Halaman", title: "Library Cars", subtitle: "Master Management", href: "/library-cars" },
  { id: "p-communities", group: "Halaman", title: "Community", subtitle: "Master Management", href: "/communities" },
  { id: "p-customers", group: "Halaman", title: "Customer", subtitle: "Master Management", href: "/customers" },
  { id: "p-discounts", group: "Halaman", title: "Voucher & Discount", subtitle: "Master Management", href: "/discounts" },
  { id: "p-utility", group: "Halaman", title: "Utility", subtitle: "Pengaturan hak akses", href: "/settings/utility" },
  { id: "p-po", group: "Halaman", title: "Purchase Orders", subtitle: "Transaction", href: "/purchase-orders" },
  { id: "p-receipt", group: "Halaman", title: "Receipt PO", subtitle: "Transaction", href: "/transaction/receipt" },
  { id: "p-sellout", group: "Halaman", title: "Sellout", subtitle: "Transaction", href: "/transaction/sellout" },
  { id: "p-work", group: "Halaman", title: "Halaman Kerja", subtitle: "Approval sellout", href: "/transaction/work" },
  { id: "p-movement", group: "Halaman", title: "Movement", subtitle: "Transaction", href: "/transaction/movement" },
  { id: "p-daily", group: "Halaman", title: "Daily Spend", subtitle: "Transaction", href: "/transaction/daily-spend" },
  { id: "p-finance", group: "Halaman", title: "Finance Store", subtitle: "Transaction", href: "/finance-store" },
  { id: "p-sellout-g", group: "Halaman", title: "Sellout Global", subtitle: "Transaction", href: "/transaction/sellout-global" },
  { id: "p-daily-g", group: "Halaman", title: "Daily Spend Global", subtitle: "Transaction", href: "/transaction/daily-spend-global" },
  { id: "p-r-sellout", group: "Halaman", title: "Report Sellout", subtitle: "Report", href: "/report/sellout" },
  { id: "p-r-profit", group: "Halaman", title: "Report Profit", subtitle: "Report", href: "/report/profit" },
  { id: "p-r-trade", group: "Halaman", title: "Trade Sellout", subtitle: "Report", href: "/report/trade-sellout" },
];
