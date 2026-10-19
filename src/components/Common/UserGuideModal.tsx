import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ShoppingBag,
  Package,
  BarChart3,
  ShieldCheck,
  Database,
  CheckCircle2,
  HelpCircle,
  Clock,
  Printer,
  FileText,
  DollarSign,
  Coffee,
  AlertTriangle,
  RotateCcw,
  Users,
  Search,
  ChevronRight,
  ExternalLink,
  Download,
  FileDown,
} from 'lucide-react';
import { useCoffee } from '../../context/CoffeeContext';
import { generateUserGuidePdf } from '../../utils/pdfManualGenerator';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  const { branding } = useCoffee();
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'reports' | 'admin' | 'database' | 'faq'>('pos');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFDF9] border border-[#6F4534]/20 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header Modal */}
        <div className="bg-[#4A2C20] text-[#FFFDF9] p-5 sm:p-6 flex items-center justify-between border-b border-[#6F4534] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C8894A]/25 text-[#E5B567] flex items-center justify-center border border-[#E5B567]/30">
              <BookOpen className="w-5 h-5 text-[#E5B567]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                  Panduan Penggunaan Sistem
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C8894A]/30 text-[#E5B567] border border-[#E5B567]/40 uppercase tracking-wider">
                  Kedai Kopi Efek Kafein
                </span>
              </div>
              <p className="text-xs text-[#E5B567]/80 mt-0.5">
                Petunjuk lengkap operasional kasir POS, kelola bahan baku & resep, pembukuan omzet, serta portal admin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-download-pdf-guide-header"
              type="button"
              onClick={() => {
                generateUserGuidePdf({
                  storeName: branding.storeName,
                  tagline: branding.tagline,
                  address: branding.address,
                  instagram: branding.instagram,
                });
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold transition-all shadow-md shadow-[#C8894A]/20 cursor-pointer"
              title="Unduh Panduan Lengkap dalam Format PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Unduh PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#E5B567]/80 hover:text-white hover:bg-[#6F4534] transition-colors cursor-pointer"
              title="Tutup Panduan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-[#F7F2EA] px-4 pt-3 border-b border-[#6F4534]/15 flex gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 pb-3 px-3 font-serif text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'pos'
                ? 'border-[#C8894A] text-[#4A2C20]'
                : 'border-transparent text-[#6F4534]/70 hover:text-[#4A2C20]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#C8894A]" />
            <span>1. Kasir POS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 pb-3 px-3 font-serif text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-[#C8894A] text-[#4A2C20]'
                : 'border-transparent text-[#6F4534]/70 hover:text-[#4A2C20]'
            }`}
          >
            <Package className="w-4 h-4 text-[#C8894A]" />
            <span>2. Stok & Resep BOM</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 pb-3 px-3 font-serif text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'reports'
                ? 'border-[#C8894A] text-[#4A2C20]'
                : 'border-transparent text-[#6F4534]/70 hover:text-[#4A2C20]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#C8894A]" />
            <span>3. Laporan & Tutup Shift</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 pb-3 px-3 font-serif text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'admin'
                ? 'border-[#C8894A] text-[#4A2C20]'
                : 'border-transparent text-[#6F4534]/70 hover:text-[#4A2C20]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#C8894A]" />
            <span>4. Admin & Branding</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 pb-3 px-3 font-serif text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'database'
                ? 'border-[#C8894A] text-[#4A2C20]'
                : 'border-transparent text-[#6F4534]/70 hover:text-[#4A2C20]'
            }`}
          >
            <Database className="w-4 h-4 text-[#C8894A]" />
            <span>5. Database MySQL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 pb-3 px-3 font-serif text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'faq'
                ? 'border-[#C8894A] text-[#4A2C20]'
                : 'border-transparent text-[#6F4534]/70 hover:text-[#4A2C20]'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#C8894A]" />
            <span>FAQ & Bantuan</span>
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-[#4A2C20] text-sm">
          
          {/* Quick PDF Download Announcement Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4A2C20] to-[#2B1912] text-[#FFFDF9] border border-[#6F4534] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C8894A]/25 text-[#E5B567] flex items-center justify-center border border-[#E5B567]/30 shrink-0">
                <FileDown className="w-5 h-5 text-[#E5B567]" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-white">Buku Panduan Siap Cetak & Dibagikan (Format PDF)</p>
                <p className="text-[11px] text-[#E5B567]/80">Dokumen terstruktur 5 halaman lengkap tabel hak akses akun, SOP kasir, resep BOM, tutup shift, dan FAQ.</p>
              </div>
            </div>
            <button
              id="btn-download-pdf-guide-banner"
              type="button"
              onClick={() => {
                generateUserGuidePdf({
                  storeName: branding.storeName,
                  tagline: branding.tagline,
                  address: branding.address,
                  instagram: branding.instagram,
                });
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Buku PDF</span>
            </button>
          </div>
          
          {/* TAB 1: KASIR POS */}
          {activeTab === 'pos' && (
            <div className="space-y-5">
              <div className="border-b border-[#6F4534]/15 pb-3">
                <h4 className="font-serif text-lg font-bold text-[#4A2C20] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#C8894A]" />
                  <span>Modul Kasir POS (Point of Sale)</span>
                </h4>
                <p className="text-xs text-[#6F4534] mt-0.5">
                  Digunakan oleh barista dan kasir untuk mencatat pesanan harian, kustomisasi rasa, dan memproses transaksi.
                </p>
              </div>

              {/* Step by step */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F7F2EA]/80 border border-[#6F4534]/15 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white text-xs font-bold flex items-center justify-center">1</span>
                    <h5 className="font-bold text-sm">Memilih Menu & Kustomisasi</h5>
                  </div>
                  <ul className="text-xs text-[#6F4534] space-y-1.5 list-disc pl-5">
                    <li>Gunakan tombol kategori (Signature, Classic Coffee, Non-Coffee, Food, Beans) atau bilah pencarian nama menu.</li>
                    <li>Klik pada kartu menu. Jika produk memiliki opsi kustomisasi, jendela pilihan akan muncul otomatis:
                      <ul className="list-circle pl-4 mt-1 space-y-0.5">
                        <li><strong>Suhu:</strong> Hot (Panas) atau Iced (Dingin).</li>
                        <li><strong>Gula:</strong> Normal 100%, Less Sugar 70%, Half 50%, atau Tanpa Gula 0%.</li>
                        <li><strong>Pilihan Susu:</strong> Fresh Milk Reguler atau Oatmilk (+Rp6.000).</li>
                        <li><strong>Catatan Tambahan:</strong> Misalnya "tanpa sedotan", "es dipisah", dll.</li>
                      </ul>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F2EA]/80 border border-[#6F4534]/15 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white text-xs font-bold flex items-center justify-center">2</span>
                    <h5 className="font-bold text-sm">Informasi Pelanggan & Meja</h5>
                  </div>
                  <ul className="text-xs text-[#6F4534] space-y-1.5 list-disc pl-5">
                    <li>Ketik <strong>Nama Pelanggan</strong> agar barista dapat memanggil saat pesanan siap.</li>
                    <li>Pilih tipe pesanan:
                      <ul className="list-circle pl-4 mt-1 space-y-0.5">
                        <li><strong>Dine In:</strong> Ketik nomor meja (misal: <em>Meja 04</em> / <em>Bar 02</em>).</li>
                        <li><strong>Take Away:</strong> Untuk pesanan dibawa pulang / bungkusan luar.</li>
                      </ul>
                    </li>
                    <li>Di keranjang, gunakan tombol <strong>+ / -</strong> untuk menambah atau mengurangi jumlah porsi.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F2EA]/80 border border-[#6F4534]/15 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white text-xs font-bold flex items-center justify-center">3</span>
                    <h5 className="font-bold text-sm">Diskon & Pajak Restoran (PB1)</h5>
                  </div>
                  <ul className="text-xs text-[#6F4534] space-y-1.5 list-disc pl-5">
                    <li><strong>Diskon:</strong> Klik "Tambah Diskon", masukkan nominal potongan (Rp) beserta nama voucher/promo (misal: <em>Promo Morning Kafein</em>).</li>
                    <li><strong>Pajak PB1 10%:</strong> Tersedia tombol sakelar (toggle) untuk mengaktifkan atau menonaktifkan pajak restoran 10% sesuai kebijakan kedai.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F2EA]/80 border border-[#6F4534]/15 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white text-xs font-bold flex items-center justify-center">4</span>
                    <h5 className="font-bold text-sm">Metode Pembayaran & Cetak Struk</h5>
                  </div>
                  <ul className="text-xs text-[#6F4534] space-y-1.5 list-disc pl-5">
                    <li>Klik <strong>Bayar Sekarang</strong>, pilih 1 dari 4 metode:
                      <ul className="list-circle pl-4 mt-1 space-y-0.5">
                        <li><strong>TUNAI:</strong> Tersedia tombol cepat uang pas, Rp50.000, Rp100.000, dan kalkulator kembalian otomatis.</li>
                        <li><strong>QRIS:</strong> Menampilkan kode QRIS dinamis untuk scan e-wallet (GoPay, OVO, Dana, BCA).</li>
                        <li><strong>DEBIT:</strong> Untuk pembayaran mesin EDC kartu ATM/Debit.</li>
                        <li><strong>TRANSFER:</strong> Untuk transfer bank langsung pelanggan.</li>
                      </ul>
                    </li>
                    <li>Klik <strong>Selesaikan Transaksi</strong>. Modal struk akan terbuka dan siap dicetak ke printer kasir thermal (*Ctrl+P*).</li>
                  </ul>
                </div>
              </div>

              {/* Tips Card */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Tips Operasional Barista:</span>
                  <p className="mt-0.5 text-amber-800">
                    Nama kasir yang aktif bertugas dapat diubah kapan saja dengan mengklik tombol <strong>Kasir Aktif</strong> di bilah header atas. Setiap transaksi penjualan otomatis tercatat atas nama kasir tersebut untuk akuntabilitas shift.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STOK & RESEP BOM */}
          {activeTab === 'inventory' && (
            <div className="space-y-5">
              <div className="border-b border-[#6F4534]/15 pb-3">
                <h4 className="font-serif text-lg font-bold text-[#4A2C20] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#C8894A]" />
                  <span>Modul Inventaris, Bahan Baku & Resep BOM</span>
                </h4>
                <p className="text-xs text-[#6F4534] mt-0.5">
                  Sistem otomatis menghubungkan setiap menu yang terjual dengan pengurangan stok bahan baku (*Bill of Materials*).
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#6F4534]">
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 space-y-2">
                  <h5 className="font-bold text-sm text-[#4A2C20] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8894A]" />
                    <span>A. Menu Siap Jual vs Bahan Baku (Ingredients)</span>
                  </h5>
                  <p>
                    Sistem membedakan dua entitas stok:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Menu Siap Jual (Products):</strong> Produk jadi seperti <em>Es Kopi Susu Kafein</em>, <em>Croissant Butter</em>, atau kemasan <em>Beans 250g</em> yang memiliki harga jual dan harga pokok (COGS).</li>
                    <li><strong>Bahan Baku (Ingredients):</strong> Komoditas mentah seperti biji kopi (gram), susu pasteurisasi (ml), sirup gula aren (ml), bubuk matcha (gram), dan kemasan cup 16oz / 8oz.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 space-y-2">
                  <h5 className="font-bold text-sm text-[#4A2C20] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8894A]" />
                    <span>B. Resep BOM (Pemotongan Otomatis Saat Penjualan)</span>
                  </h5>
                  <p>
                    Contoh: 1 gelas <strong>Es Kopi Susu Kafein</strong> memiliki resep:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] text-[#4A2C20] my-2">
                    <div className="p-2 rounded-xl bg-[#F7F2EA] border border-[#6F4534]/15">18g Biji Kopi Blend</div>
                    <div className="p-2 rounded-xl bg-[#F7F2EA] border border-[#6F4534]/15">140ml Susu Fresh Milk</div>
                    <div className="p-2 rounded-xl bg-[#F7F2EA] border border-[#6F4534]/15">25ml Sirup Gula Aren</div>
                    <div className="p-2 rounded-xl bg-[#F7F2EA] border border-[#6F4534]/15">1 pcs Cup Dingin 16oz</div>
                  </div>
                  <p>
                    Saat kasir menyelesaikan pesanan 2 gelas di POS, sistem secara instan memotong 36g biji kopi, 280ml susu, 50ml sirup, dan 2 cup dari inventaris tanpa perlu input manual!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 space-y-2">
                  <h5 className="font-bold text-sm text-[#4A2C20] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C8894A]" />
                    <span>C. Pencatatan Mutasi Stok Manual (Kartu Stok)</span>
                  </h5>
                  <p>
                    Di tab <strong>Kartu Mutasi</strong>, Anda dapat mencatat pergerakan barang fisik:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong className="text-emerald-700">IN (Barang Masuk / Restock):</strong> Saat kiriman susu atau biji kopi dari suplier tiba.</li>
                    <li><strong className="text-red-700">WASTE (Afkir / Rusak / Tumpah):</strong> Saat susu basi atau croissant gosong di oven agar HPP tercatat akurat.</li>
                    <li><strong className="text-amber-700">OUT (Penyesuaian Keluar):</strong> Digunakan untuk pemakaian internal (misal: kalibrasi espresso pagi hari oleh barista).</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LAPORAN & TUTUP SHIFT */}
          {activeTab === 'reports' && (
            <div className="space-y-5">
              <div className="border-b border-[#6F4534]/15 pb-3">
                <h4 className="font-serif text-lg font-bold text-[#4A2C20] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#C8894A]" />
                  <span>Modul Laporan Keuangan & Penutupan Kasir (Shift)</span>
                </h4>
                <p className="text-xs text-[#6F4534] mt-0.5">
                  Analisis laba kotor, grafik jam ramai kedai, cetak ulang nota, serta rekap penutupan laci kasir.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-[#F7F2EA]/80 border border-[#6F4534]/15 space-y-2">
                  <h5 className="font-bold text-sm text-[#4A2C20] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#C8894A]" />
                    <span>Membaca Indikator Keuangan (KPI)</span>
                  </h5>
                  <ul className="space-y-1.5 list-disc pl-4 text-[#6F4534]">
                    <li><strong>Total Omzet Penjualan:</strong> Nilai kotor keseluruhan transaksi yang berstatus COMPLETED.</li>
                    <li><strong>Estimasi Laba Kotor (Gross Profit):</strong> Total Omzet dikurangi Total HPP bahan baku (COGS). Menunjukkan margin murni produk sebelum biaya sewa/listrik.</li>
                    <li><strong>Rata-rata per Pesanan (AOV):</strong> Nilai belanja rata-rata per struk belanja pelanggan.</li>
                    <li><strong>Filter Waktu:</strong> Klik <em>Hari Ini (Live)</em>, <em>7 Hari Terakhir</em>, atau <em>Semua Data</em>.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F2EA]/80 border border-[#6F4534]/15 space-y-2">
                  <h5 className="font-bold text-sm text-[#4A2C20] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C8894A]" />
                    <span>Prosedur Tutup Kasir / Shift (Z-Report)</span>
                  </h5>
                  <ol className="space-y-1.5 list-decimal pl-4 text-[#6F4534]">
                    <li>Di akhir jam operasional, klik tombol <strong>"Tutup Kasir (Shift)"</strong>.</li>
                    <li>Sistem menampilkan rincian total transaksi tunai, QRIS, debit, dan transfer.</li>
                    <li>Hitung uang tunai fisik yang ada di dalam laci uang kasir (cash drawer).</li>
                    <li>Masukkan nominal uang fisik ke kolom penghitungan untuk mendeteksi apakah ada selisih uang lebih atau kurang (*cash over/short*).</li>
                    <li>Cetak slip ringkasan shift untuk ditandatangani kasir dan supervisor.</li>
                  </ol>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F2EA]/80 border border-[#6F4534]/15 space-y-2">
                  <h5 className="font-bold text-sm text-[#4A2C20] flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-red-600" />
                    <span>Pembatalan & Retur Transaksi (Refund)</span>
                  </h5>
                  <p className="text-[#6F4534]">
                    Jika pelanggan membatalkan pesanan setelah nota tercetak:
                  </p>
                  <ul className="space-y-1 list-disc pl-4 text-[#6F4534]">
                    <li>Cari transaksi di tabel riwayat, klik tombol <strong>Retur</strong>.</li>
                    <li>Pilih alasan pembatalan (misal: "Salah pesan", "Pelanggan buru-buru").</li>
                    <li>Status nota berubah menjadi <span className="font-bold text-red-700">REFUNDED</span> dan omzet otomatis dikoreksi.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#F7F2EA]/80 border border-[#6F4534]/15 space-y-2">
                  <h5 className="font-bold text-sm text-[#4A2C20] flex items-center gap-2">
                    <Printer className="w-4 h-4 text-[#C8894A]" />
                    <span>Cetak Ulang Nota & Ekspor CSV</span>
                  </h5>
                  <ul className="space-y-1.5 list-disc pl-4 text-[#6F4534]">
                    <li><strong>Cetak Ulang:</strong> Klik ikon struk pada baris transaksi manapun untuk melihat dan mencetak ulang nota pelanggan.</li>
                    <li><strong>Ekspor CSV:</strong> Mengunduh seluruh data penjualan ke format Excel/Spreadsheet untuk laporan akuntansi bulanan.</li>
                    <li><strong>Ekspor SQL:</strong> Mengunduh seluruh database ke format MySQL siap simpan.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADMIN & BRANDING */}
          {activeTab === 'admin' && (
            <div className="space-y-5">
              <div className="border-b border-[#6F4534]/15 pb-3">
                <h4 className="font-serif text-lg font-bold text-[#4A2C20] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#C8894A]" />
                  <span>Modul Portal Admin & Pengaturan Branding Kedai</span>
                </h4>
                <p className="text-xs text-[#6F4534] mt-0.5">
                  Konfigurasi identitas gerai kopi, akun kasir barista, dan hak akses manajemen kedai.
                </p>
              </div>

              <div className="space-y-4 text-xs text-[#6F4534]">
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 space-y-2">
                  <h5 className="font-bold text-sm text-[#4A2C20] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C8894A]" />
                    <span>Akun Pengguna & Level Keamanan</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <div className="p-3 rounded-xl bg-[#F7F2EA] border border-[#6F4534]/15">
                      <p className="font-bold text-[#4A2C20] text-xs">Akun Admin / Supervisor</p>
                      <p className="text-[11px] text-[#6F4534] mt-0.5">Username: <code className="font-mono font-bold text-[#C8894A]">admin</code> | Password: <code className="font-mono font-bold text-[#C8894A]">admin123</code></p>
                      <p className="text-[11px] text-[#6F4534] mt-1">Memiliki otoritas penuh: kelola inventaris, lihat laporan omzet, ubah logo toko, tambah akun kasir, dan unduh database.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F7F2EA] border border-[#6F4534]/15">
                      <p className="font-bold text-[#4A2C20] text-xs">Akun Kasir / Barista</p>
                      <p className="text-[11px] text-[#6F4534] mt-0.5">Username: <code className="font-mono font-bold text-[#C8894A]">arya</code>, <code className="font-mono font-bold text-[#C8894A]">maya</code>, <code className="font-mono font-bold text-[#C8894A]">budi</code> | PIN: <code className="font-mono font-bold text-[#C8894A]">1234</code></p>
                      <p className="text-[11px] text-[#6F4534] mt-1">Dapat login cepat menggunakan PIN 4 digit untuk membuka laci kasir dan memproses pesanan di POS.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 space-y-2">
                  <h5 className="font-bold text-sm text-[#4A2C20] flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-[#C8894A]" />
                    <span>Kustomisasi Identitas Toko & Logo (Branding)</span>
                  </h5>
                  <p>
                    Melalui tab <strong>Logo & Title Bar</strong> di Portal Admin:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Nama Kedai & Tagline:</strong> Mengubah nama brand yang tampil di bilah atas header, struk kasir thermal, dan judul browser.</li>
                    <li><strong>Logo Preset:</strong> Memilih ikon artisan (Cangkir Kopi, Kobaran Api, Es Soda, Kilau Sparkles, Toko, dll).</li>
                    <li><strong>Custom Logo URL:</strong> Memasukkan tautan gambar logo resmi kedai Anda.</li>
                    <li><strong>Alamat & Instagram:</strong> Otomatis tercetak di bagian footer struk belanja pembeli.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE MYSQL */}
          {activeTab === 'database' && (
            <div className="space-y-5">
              <div className="border-b border-[#6F4534]/15 pb-3">
                <h4 className="font-serif text-lg font-bold text-[#4A2C20] flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#C8894A]" />
                  <span>Modul Database SQL & Upload ke MySQL</span>
                </h4>
                <p className="text-xs text-[#6F4534] mt-0.5">
                  Cara mengunduh berkas skrip SQL dan mengunggahnya ke server database MySQL / MariaDB lokal maupun hosting.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#2B1912] text-[#FFFDF9] space-y-3 border border-[#6F4534]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#E5B567]">Nama Berkas SQL:</span>
                  <code className="text-xs bg-[#4A2C20] px-2 py-0.5 rounded text-emerald-400 font-mono">kedai_kopi_mysql.sql</code>
                </div>
                <p className="text-xs text-[#E5B567]/80 leading-relaxed">
                  Berkas ini telah berisi struktur 10 tabel InnoDB, Primary & Foreign Keys, 3 SQL Views analitik, serta data awal (seed records) lengkap dengan akun kasir, resep menu, dan mutasi stok.
                </p>
              </div>

              <div className="space-y-3 text-xs text-[#4A2C20]">
                <h5 className="font-bold text-sm">Langkah Cepat Upload di phpMyAdmin (XAMPP / cPanel):</h5>
                <ol className="list-decimal pl-5 space-y-2 text-[#6F4534]">
                  <li>Buka <strong>Admin &gt; Database MySQL</strong>, lalu klik tombol <strong>"Unduh File .SQL"</strong>.</li>
                  <li>Buka phpMyAdmin di browser Anda (<code className="font-mono text-[#C8894A]">http://localhost/phpmyadmin</code>).</li>
                  <li>Klik tab menu <strong>Import</strong> di bagian atas.</li>
                  <li>Klik tombol <strong>Choose File / Telusuri Berkas</strong> dan pilih berkas <code className="font-mono">kedai_kopi_mysql.sql</code> yang baru diunduh.</li>
                  <li>Gulir ke bawah dan klik tombol <strong>Go / Kirim</strong>. Database <code className="font-mono text-[#4A2C20] font-bold">kedai_kopi_efek_kafein</code> akan otomatis dibuat beserta seluruh isi datanya!</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 6: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="border-b border-[#6F4534]/15 pb-3">
                <h4 className="font-serif text-lg font-bold text-[#4A2C20] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#C8894A]" />
                  <span>Pertanyaan Umum & Solusi Cepat (FAQ)</span>
                </h4>
                <p className="text-xs text-[#6F4534] mt-0.5">
                  Jawaban atas hal-hal yang sering ditanyakan saat mengoperasikan aplikasi.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F7F2EA] border border-[#6F4534]/15">
                  <p className="font-bold text-[#4A2C20]">Bagaimana cara mencetak struk belanja?</p>
                  <p className="text-[#6F4534] mt-1">
                    Setelah tombol "Selesaikan Transaksi" diklik di POS, jendela pratinjau struk thermal otomatis muncul. Anda dapat langsung mengklik tombol "Cetak Struk" atau menekan tombol pintas keyboard <code>Ctrl+P</code> / <code>Cmd+P</code> untuk dikirimkan ke printer bluetooth/USB thermal kasir (ukuran 58mm atau 80mm).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F7F2EA] border border-[#6F4534]/15">
                  <p className="font-bold text-[#4A2C20]">Apa yang terjadi jika stok bahan baku menipis?</p>
                  <p className="text-[#6F4534] mt-1">
                    Ikon lonceng segitiga peringatan kuning di header atas akan menyala dengan jumlah bahan yang berada di bawah batas minimum (*minStock*). Klik ikon tersebut untuk melihat daftar belanjaan yang harus segera direstock dari roastery atau supplier.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F7F2EA] border border-[#6F4534]/15">
                  <p className="font-bold text-[#4A2C20]">Apakah data tersimpan aman jika browser ditutup?</p>
                  <p className="text-[#6F4534] mt-1">
                    Ya! Sistem menggunakan penyimpanan ganda: penyimpanan lokal browser (*localStorage*) serta sinkronisasi database cloud real-time Firebase Firestore (lihat indikator Cloud Live hijau di header). Anda juga dapat mencadangkan (*backup*) data kapan saja lewat ekspor MySQL atau CSV.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F7F2EA] border border-[#6F4534]/15">
                  <p className="font-bold text-[#4A2C20]">Bagaimana jika ingin mengembalikan ke data awal demo?</p>
                  <p className="text-[#6F4534] mt-1">
                    Tersedia tombol ikon putar balik (Reset Demo) di ujung kanan header. Tombol ini akan mengembalikan seluruh produk, bahan baku, akun, dan transaksi ke kondisi awal untuk keperluan pelatihan staf barista baru.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="p-4 bg-[#F7F2EA] border-t border-[#6F4534]/15 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-[#6F4534]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dokumentasi Sistem Kedai Kopi Efek Kafein • Versi POS 2.4</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              id="btn-download-pdf-guide-footer"
              type="button"
              onClick={() => {
                generateUserGuidePdf({
                  storeName: branding.storeName,
                  tagline: branding.tagline,
                  address: branding.address,
                  instagram: branding.instagram,
                });
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Format PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#4A2C20] hover:bg-[#351F16] text-[#FFFDF9] font-bold text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
