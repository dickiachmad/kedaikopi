# Buku Panduan Lengkap Penggunaan Sistem Kedai Kopi Efek Kafein
**Versi Aplikasi:** 2.4 (POS & Inventory Management)  
**Target Pengguna:** Pemilik Kedai (Owner), Manajer Toko, Supervisor, Barista, dan Kasir  

---

## Daftar Isi
1. [Pengenalan & Arsitektur Sistem](#1-pengenalan--arsitektur-sistem)
2. [Hak Akses & Akun Pengguna (User Roles)](#2-hak-akses--akun-pengguna-user-roles)
3. [Modul 1: Kasir POS (Point of Sale)](#3-modul-1-kasir-pos-point-of-sale)
   - 3.1. Memilih Menu & Kustomisasi Pesanan
   - 3.2. Pengaturan Meja (Dine In) & Pesanan Bawa Pulang (Take Away)
   - 3.3. Penerapan Promo Diskon & Pajak Restoran (PB1 10%)
   - 3.4. Proses Pembayaran (Tunai, QRIS Dinamis, Debit, Transfer)
   - 3.5. Pencetakan Struk Belanja Kasir Thermal
4. [Modul 2: Manajemen Stok, Bahan Baku & Resep BOM](#4-modul-2-manajemen-stok-bahan-baku--resep-bom)
   - 4.1. Perbedaan Produk Jadi vs Bahan Baku (Ingredients)
   - 4.2. Mekanisme Resep Bill of Materials (BOM) & Pemotongan Otomatis
   - 4.3. Pencatatan Kartu Mutasi Stok Manual (IN, OUT, WASTE)
   - 4.4. Indikator & Sistem Peringatan Stok Menipis (Low Stock Alert)
5. [Modul 3: Laporan Penjualan & Penutupan Kasir (Shift)](#5-modul-3-laporan-penjualan--penutupan-kasir-shift)
   - 5.1. Membaca Metrik Keuangan (Omzet, HPP/COGS, Laba Kotor, AOV)
   - 5.2. Grafik Jam Ramai Kedai & Komposisi Pembayaran
   - 5.3. Prosedur Tutup Kasir / Z-Report (Pencocokan Uang Fisik Laci)
   - 5.4. Pembatalan / Retur Transaksi (Refund)
   - 5.5. Ekspor Data ke Format CSV (Excel)
6. [Modul 4: Portal Admin, Branding & Database MySQL](#6-modul-4-portal-admin-branding--database-mysql)
   - 6.1. Pengaturan Identitas Gerai (Logo, Nama Toko, Alamat, Instagram)
   - 6.2. Manajemen Akun Kasir & Kode PIN
   - 6.3. Ekspor & Unggah Database ke MySQL (phpMyAdmin, Workbench, CLI)
7. [Pertanyaan yang Sering Diajukan (FAQ) & Pemecahan Masalah](#7-pertanyaan-yang-sering-diajukan-faq--pemecahan-masalah)

---

## 1. Pengenalan & Arsitektur Sistem
**Kedai Kopi Efek Kafein POS** adalah aplikasi manajemen penjualan dan inventaris kedai kopi modern yang dirancang untuk kecepatan kasir di jam sibuk (*peak hours*), pemantauan HPP otomatis (*Cost of Goods Sold*), serta pembukuan keuangan real-time.

### Keunggulan Utama:
- **Dukungan Resep BOM (*Bill of Materials*):** Penjualan 1 cangkir kopi otomatis memotong gramasi biji kopi, mililiter susu, sirup, dan kemasan cup di gudang.
- **Penyimpanan Ganda (Dual Storage):** Data tersimpan aman di penyimpanan lokal browser (*Offline-first*) serta tersinkronisasi otomatis ke Cloud Firestore saat online.
- **Dukungan Format Relasional MySQL:** Dilengkapi skema 10 tabel InnoDB dan views analitik siap pakai untuk integrasi server hosting.

---

## 2. Hak Akses & Akun Pengguna (User Roles)

Sistem membagi operasional menjadi dua tingkat akses:

| Peran | Username Default | Sandi / PIN | Hak Akses & Wewenang |
|---|---|---|---|
| **Owner / Manajer** | `admin` | `admin123` | Akses penuh seluruh sistem: kelola stok, resep, laporan keuangan, tutup shift, kelola branding toko, akun kasir, dan ekspor SQL. |
| **Supervisor** | `supervisor` | `supervisor123` | Mengawasi operasional harian, verifikasi tutup kasir, dan penyesuaian stok. |
| **Kasir / Barista** | `arya`, `maya`, `budi` | `1234` | Akses modul POS, mencatat transaksi, kustomisasi pesanan, dan mencetak struk belanja. |

---

## 3. Modul 1: Kasir POS (Point of Sale)

### 3.1. Memilih Menu & Kustomisasi Pesanan
1. Klik tab **Kasir POS** di bilah menu atas atau bilah navigasi bawah ponsel.
2. Gunakan tombol filter kategori:
   - **Signature Coffee:** Menu racikan khas (misal: *Es Kopi Susu Kafein*, *Double Boost*).
   - **Classic Coffee:** Menu seduhan standar (*Cafe Latte*, *Americano*, *V60 Flores*).
   - **Non-Coffee:** Minuman non-kafein (*Matcha Latte Uji*, *Artisan Chocolate*).
   - **Food / Pastry:** Makanan pendamping (*Croissant Butter Artisan*, *Roti Bakar Keju*).
   - **Beans:** Biji kopi sangrai kemasan 250g.
3. Klik pada kartu menu yang diinginkan. Jendela kustomisasi rasa akan terbuka otomatis:
   - **Suhu:** Pilih *Hot* (Panas) atau *Iced* (Dingin).
   - **Tingkat Manis (Sugar Level):** 100% (Normal), 70% (Less), 50% (Half), atau 0% (Tanpa Gula).
   - **Pilihan Susu:** Susu Sapi Reguler atau Oatmilk Barista (+Rp6.000).
   - **Catatan Barista:** Ketik permintaan khusus pelanggan (contoh: *"es batu sedikit"*, *"jangan pakai sedotan"*).
4. Klik **Tambah ke Pesanan**.

### 3.2. Pengaturan Meja (Dine In) & Pesanan Bawa Pulang (Take Away)
1. Di panel ringkasan keranjang (sebelah kanan layar desktop / laci bawah ponsel):
   - Masukkan **Nama Pelanggan** (contoh: *Dimas Pratama*).
   - Pilih jenis pesanan:
     - **Dine In:** Masukkan nomor meja (contoh: *Meja 04* atau *Bar 02*).
     - **Take Away:** Digunakan untuk pesanan dibungkus bawa pulang.
2. Gunakan tombol **+** atau **-** pada baris item untuk mengatur kuantitas porsi.
3. Klik ikon tempat sampah jika ingin membatalkan item dari pesanan.

### 3.3. Penerapan Promo Diskon & Pajak Restoran (PB1 10%)
- **Menambah Diskon:** Klik tombol *"Tambah Diskon"*, masukkan nominal potongan harga (Rp) dan nama voucher (contoh: *Rp5.000 - Promo Morning Kafein*).
- **Pajak PB1 10%:** Klik sakelar tombol pajak jika kedai memberlakukan pajak restoran resmi 10% pada nota belanja.

### 3.4. Proses Pembayaran
1. Klik tombol hijau besar **"Bayar Sekarang (Rp ...)"**.
2. Pilih salah satu dari 4 metode pembayaran:
   - **TUNAI (Cash):** Klik pecahan uang cepat (Uang Pas, Rp50.000, Rp100.000) atau ketik nominal uang yang diterima dari pembeli. Sistem secara otomatis menghitung kembalian uang.
   - **QRIS:** Sistem menampilkan QR Code pembayaran dinamis untuk dipindai oleh e-wallet (GoPay, OVO, Dana, ShopeePay, BCA, Livin).
   - **DEBIT:** Digunakan saat pelanggan membayar via kartu ATM di mesin EDC.
   - **TRANSFER:** Digunakan untuk transfer bank langsung.
3. Klik tombol **"Selesaikan Transaksi"**.

### 3.5. Pencetakan Struk Belanja Kasir Thermal
- Setelah transaksi sukses, animasi konfeti dan jendela nota struk kasir (*receipt*) akan muncul.
- Format nota telah dioptimalkan khusus printer thermal struk mini (**58mm** dan **80mm**).
- Klik tombol **"Cetak Struk"** atau gunakan pintasan keyboard `Ctrl + P` (Windows) / `Cmd + P` (Mac).
- Struk mencantumkan nomor nota unik (misal: `EFEK-001`), tanggal, kasir yang bertugas, nama pembeli, rincian menu, custom rasa, rincian pembayaran, alamat toko, dan Instagram kedai.

---

## 4. Modul 2: Manajemen Stok, Bahan Baku & Resep BOM

### 4.1. Perbedaan Produk Jadi vs Bahan Baku (Ingredients)
- **Menu Siap Jual (Products):** Katalog menu minuman/makanan yang dipesan pelanggan di kasir POS. Memiliki harga jual konsumen, HPP estimasi, dan harga varian.
- **Bahan Baku (Ingredients):** Barang fisik mentah yang disimpan di gudang/bar, dihitung dengan satuan:
  - Biji Kopi: dihitung dalam satuan **gram**.
  - Susu & Sirup: dihitung dalam satuan **ml** (mililiter).
  - Bubuk Cokelat & Matcha: dihitung dalam satuan **gram**.
  - Cup Dingin 16oz & Cup Panas 8oz: dihitung dalam satuan **pcs** (lembar).

### 4.2. Mekanisme Resep Bill of Materials (BOM)
Setiap menu dapat dihubungkan dengan resep takaran baku.  
*Contoh Resep Cafe Latte:*
- `18 gram` Biji Kopi House Blend
- `180 ml` Susu Fresh Milk
- `1 pcs` Paper Cup Panas 8oz + Sleeve

Saat pesanan 1 Cafe Latte selesai di POS:
1. Stok Biji Kopi House Blend berkurang 18 gram.
2. Stok Susu Fresh Milk berkurang 180 ml.
3. Stok Paper Cup berkurang 1 pcs.  
*Jika ada pembatalan/refund transaksi, stok bahan baku akan dikembalikan otomatis.*

### 4.3. Pencatatan Kartu Mutasi Stok Manual
Buka tab **Kelola Stok > Kartu Mutasi** untuk mencatat transaksi barang fisik di luar penjualan kasir:
1. **IN (Restock / Barang Masuk):** Input penerimaan pasokan bahan baku dari suplier/roastery (contoh: restock 5.000 gram biji kopi).
2. **WASTE (Kerusakan / Afkir / Tumpah):** Input jika ada bahan baku yang kedaluwarsa, susu basi, atau makanan gosong agar nilai kerugian terhitung pada pembukuan.
3. **OUT (Pengeluaran Internal):** Digunakan untuk kalibrasi rasa espresso pagi atau keperluan internal kedai.

### 4.4. Indikator Peringatan Stok Menipis (Low Stock Alert)
- Setiap item memiliki batas aman minimum (*minStock*).
- Jika sisa stok berada pada atau di bawah batas minimum (`stock <= minStock`), ikon segitiga peringatan kuning pada bilah navigasi atas akan berkedip.
- Klik ikon peringatan tersebut untuk melihat daftar belanjaan barang yang harus segera dibeli.

---

## 5. Modul 3: Laporan Penjualan & Penutupan Kasir (Shift)

### 5.1. Membaca Metrik Keuangan (KPI)
Buka tab **Laporan** untuk memantau performa usaha:
- **Total Omzet Penjualan:** Nilai seluruh uang bruto yang masuk dari transaksi selesai.
- **Estimasi Laba Kotor (Gross Profit):** Total Omzet dikurangi Total HPP Bahan Baku. Menunjukkan margin laba murni menu.
- **Total Transaksi & Item Terjual:** Jumlah struk transaksi yang berhasil diproses.
- **Rata-rata per Pesanan (AOV):** Rata-rata nominal belanja tiap pelanggan yang datang.

### 5.2. Grafik Jam Ramai Kedai & Komposisi Pembayaran
- **Grafik Jam Sibuk (*Peak Hours*):** Memetakan lonjakan transaksi dari jam buka hingga tutup (pagi 08:00, siang 12:00, sore 16:00, malam 20:00) untuk membantu pengaturan jadwal shift barista.
- **Diagram Pembayaran:** Memperlihatkan persentase transaksi yang menggunakan Tunai vs QRIS vs Debit vs Transfer.
- **5 Produk Terlaris (*Top Selling*):** Memperlihatkan menu favorit pelanggan berdasarkan kuantitas gelas terjual.

### 5.3. Prosedur Tutup Kasir / Shift (Z-Report)
Di akhir jam operasional shift:
1. Klik tombol **"Tutup Kasir (Shift)"** di bagian atas halaman Laporan.
2. Sistem menampilkan rekap omzet shift berjalan beserta rincian penerimaan Tunai, QRIS, Debit, dan Transfer.
3. Barista/kasir menghitung uang kertas & koin fisik yang ada di dalam laci uang (*Cash Drawer*).
4. Masukkan nominal uang fisik ke kolom penghitungan. Sistem akan menghitung apakah kas pas (*Balanced*), ada selisih lebih (*Over*), atau selisih kurang (*Short*).
5. Masukkan catatan shift dan klik **Cetak Ringkasan Shift** untuk arsip fisik pembukuan kedai.

### 5.4. Pembatalan / Retur Transaksi (Refund)
Jika pelanggan membatalkan pesanan atau terjadi salah input kasir:
1. Temukan nomor nota di tabel riwayat transaksi pada halaman Laporan.
2. Klik tombol merah **Retur**.
3. Pilih alasan retur (misal: *"Pelanggan salah pesan / batal"* atau *"Salah input kasir"*).
4. Status transaksi berubah menjadi **REFUNDED**, total omzet terkoreksi, dan stok bahan baku dikembalikan ke gudang.

---

## 6. Modul 4: Portal Admin, Branding & Database MySQL

### 6.1. Pengaturan Identitas Gerai (Logo & Title Bar)
1. Masuk ke tab **Admin** menggunakan kata sandi manajer (`admin` / `admin123`).
2. Pilih sub-tab **Logo & Title Bar**:
   - **Nama Toko & Tagline:** Ubah nama kedai kopi Anda.
   - **Ikon Preset:** Pilih ikon artisan (*Coffee*, *Flame*, *Soda*, *Sparkles*, *Store*).
   - **Logo URL Kustom:** Masukkan link URL gambar logo usaha Anda.
   - **Alamat & Instagram:** Teks ini akan otomatis tertera di bagian bawah struk belanja kasir.
3. Klik **Simpan Pengaturan Branding**.

### 6.2. Manajemen Akun Kasir & Kode PIN
1. Pilih sub-tab **Pengaturan & Akun Kasir**:
   - **Tambah Kasir Baru:** Masukkan nama lengkap barista, username login, dan kode PIN 4-digit (misal: `1234`).
   - **Status Kasir:** Aktifkan atau nonaktifkan akun barista yang sudah tidak bertugas.
   - **Ubah PIN:** Perbarui PIN keamanan berkala untuk mencegah kebocoran laci kasir.

### 6.3. Ekspor & Unggah Database ke MySQL
Aplikasi dilengkapi modul pembuat skrip SQL utuh yang dapat diunggah ke server MySQL/MariaDB (phpMyAdmin, cPanel, XAMPP, Laragon, Workbench):
1. Buka sub-tab **Database MySQL**.
2. Klik tombol **"Unduh File .SQL"** untuk mengunduh berkas `kedai_kopi_mysql.sql`.
3. Buka **phpMyAdmin** di browser (`http://localhost/phpmyadmin` atau via cPanel).
4. Klik tab menu **Import**, pilih berkas yang diunduh, lalu klik **Go / Kirim**.
5. Seluruh 10 tabel InnoDB, Primary Key, Foreign Key, dan data awal akan aktif seketika.

---

## 7. Pertanyaan yang Sering Diajukan (FAQ) & Pemecahan Masalah

**Q: Bagaimana jika koneksi internet terputus saat kasir sedang melayani pelanggan?**  
*A: Aplikasi tetap dapat digunakan secara normal! Transaksi dan perubahan stok disimpan langsung di penyimpanan lokal browser (*Offline-First*). Saat internet kembali menyala, data otomatis tersinkronkan ke Cloud Firestore.*

**Q: Bagaimana cara mengganti kasir yang sedang bertugas tanpa logout admin?**  
*A: Cukup klik tombol **Kasir Aktif** di bilah atas header. Ketik nama kasir/barista baru dan tekan tombol OK.*

**Q: Apakah aplikasi dapat diakses melalui tablet kasir atau smartphone barista?**  
*A: Ya. Tata letak aplikasi bersifat responsif (*Mobile-friendly*). Di perangkat ponsel, tersedia bilah navigasi bawah (*Bottom Navigation Bar*) yang ergonomis untuk navigasi satu jempol.*

**Q: Bagaimana cara mengembalikan data ke kondisi awal demo pabrik?**  
*A: Klik ikon putar balik (*Reset Demo*) di ujung kanan bilah header atas. Sistem akan meminta konfirmasi dan mengembalikan seluruh produk, resep, dan transaksi ke data awal pelatihan.*
