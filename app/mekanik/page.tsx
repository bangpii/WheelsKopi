import { RadarErrorPage } from "@/components/error/radar-error";

export default function MechanicPlaceholderPage() {
  return (
    <RadarErrorPage
      code="500"
      title="Halaman Mekanik belum tersedia"
      description="Halaman khusus Mekanik sedang disiapkan. Untuk sementara, akses menu lain dari dashboard atau hubungi Kepala Toko bila membutuhkan bantuan."
    />
  );
}
