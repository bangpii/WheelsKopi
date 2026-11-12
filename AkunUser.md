# Akun User WheelsKopi

Daftar akun demo di **Master Management → User**. Role **Administrator** memiliki akses penuh dan satu-satunya yang dapat membuka Utility. Role **Kepala Toko** memiliki akses ke seluruh modul operasional, kecuali Utility.

| No | Nama           | Role          | Email                       | Username      | Password        | Store             | Status |
| -- | -------------- | ------------- | --------------------------- | ------------- | --------------- | ----------------- | ------ |
| 1  | Baihaqie Arrafi | Administrator | baihqiearrafi@gmail.com     | baihqiearrafi | baihaqiearrafi  | WheelsKopi Pusat  | Aktif  |
| 2  | Admin Wheels    | Kepala Toko  | admin@wheelskopi.com        | admin         | admin123        | WheelsKopi Pusat  | Aktif  |
| 3  | Admin Kantor    | Admin Kantor | adminkantor@wheelskopi.id   | adminkantor   | adminkantor123  | WheelsKopi Pusat  | Aktif  |
| 4  | Kasir Toko      | Kasir Toko   | kasir@wheelskopi.id         | kasir         | kasir123        | WheelsKopi Pusat  | Aktif  |
| 5  | Mekanik         | Mekanik      | mekanik@wheelskopi.id       | mekanik       | mekanik123      | WheelsKopi Binjai | Aktif  |
| 6  | Kepala Toko     | Kepala Toko  | kepalatoko@wheelskopi.id    | kepalatoko    | kepalatoko123   | WheelsKopi Binjai | Aktif  |
| 7  | Finance         | Finance      | finance@wheelskopi.id       | finance       | finance123      | WheelsKopi Pusat  | Aktif  |
| 8  | Staff Gudang    | Staff Gudang | gudang@wheelskopi.id        | gudang        | gudang123       | WheelsKopi Pusat  | Aktif  |

## Catatan

- Login menggunakan **email** dan **password** di atas.
- Akun seed disimpan di `lib/master-data.ts` pada `seedUsers`.
- Data akun otomatis dimigrasikan ke `localStorage` (`wheelskopi_v5_users`) saat aplikasi dibuka.
- Role **Administrator** dapat mengakses seluruh modul dan mengubah izin role lain melalui Utility.
- Role **Kepala Toko** dapat mengakses seluruh modul operasional, tetapi tidak dapat membuka Utility.
