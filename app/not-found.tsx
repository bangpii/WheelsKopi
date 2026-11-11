import { RadarErrorPage } from "@/components/error/radar-error";

export default function NotFound() {
  return (
    <RadarErrorPage
      code="404"
      title="Halaman tidak ditemukan"
      description="Sinyal menuju halaman ini hilang dari radar. Periksa kembali alamatnya atau telusuri halaman lain yang tersedia di WheelsKopi."
    />
  );
}
