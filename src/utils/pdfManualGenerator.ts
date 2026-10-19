import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PdfGeneratorOptions {
  storeName?: string;
  tagline?: string;
  address?: string;
  instagram?: string;
}

/**
 * Generates and triggers download of a comprehensive, structured PDF User Guide
 */
export function generateUserGuidePdf(options: PdfGeneratorOptions = {}): void {
  const {
    storeName = 'Kedai Kopi Efek Kafein',
    tagline = 'Sistem Penjualan & Inventaris Real-time',
    address = 'Jl. Kafein Boulevard No. 18, Jakarta',
    instagram = '@efekkafein.id',
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const COLOR_PRIMARY = [74, 44, 32]; // #4A2C20 (Deep Coffee Brown)
  const COLOR_SECONDARY = [200, 137, 74]; // #C8894A (Warm Caramel)
  const COLOR_ACCENT = [111, 69, 52]; // #6F4534 (Roast Dark Brown)
  const COLOR_BG_LIGHT = [247, 242, 234]; // #F7F2EA (Cream)
  const COLOR_TEXT_DARK = [40, 25, 18];
  const COLOR_TEXT_MUTED = [95, 60, 45];

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let currentY = margin;

  // Helper to add page header & footer on content pages
  const addHeaderFooter = (pageNumber: number, totalPagesPlaceholder: boolean = false) => {
    // Header
    doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.rect(margin, 8, contentWidth, 0.6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(`${storeName.toUpperCase()} — BUKU PANDUAN PENGGUNAAN SISTEM POS`, margin, 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
    doc.text('Versi 2.4 (Terstruktur)', pageWidth - margin, 6.5, { align: 'right' });

    // Footer
    doc.setDrawColor(210, 195, 180);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
    doc.text(`Dokumentasi Resmi Kedai Kopi Efek Kafein • Dicetak: ${currentDateStr}`, margin, pageHeight - 6);

    doc.setFont('helvetica', 'bold');
    doc.text(`Halaman ${pageNumber}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  };

  // Helper for Section Titles
  const addSectionTitle = (title: string, subtitle?: string) => {
    doc.setFillColor(COLOR_BG_LIGHT[0], COLOR_BG_LIGHT[1], COLOR_BG_LIGHT[2]);
    doc.roundedRect(margin, currentY, contentWidth, subtitle ? 15 : 10, 2, 2, 'F');

    doc.setFillColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
    doc.rect(margin, currentY, 3, subtitle ? 15 : 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(title, margin + 6, currentY + 6.5);

    if (subtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
      doc.text(subtitle, margin + 6, currentY + 12);
      currentY += 18;
    } else {
      currentY += 13;
    }
  };

  // Helper for Sub-Headings
  const addSubHeading = (text: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
    doc.text(text, margin, currentY);
    currentY += 5;
  };

  // Helper for Paragraph
  const addParagraph = (text: string, indent: number = 0) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(COLOR_TEXT_DARK[0], COLOR_TEXT_DARK[1], COLOR_TEXT_DARK[2]);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    doc.text(lines, margin + indent, currentY);
    currentY += lines.length * 4.2;
  };

  // Helper for Callout Box
  const addCallout = (title: string, text: string, type: 'info' | 'alert' | 'success' = 'info') => {
    const lines = doc.splitTextToSize(text, contentWidth - 12);
    const boxHeight = lines.length * 4.2 + 9;

    let bgColor = [247, 242, 234];
    let borderColor = COLOR_SECONDARY;

    if (type === 'alert') {
      bgColor = [254, 243, 199];
      borderColor = [217, 119, 6];
    } else if (type === 'success') {
      bgColor = [236, 253, 245];
      borderColor = [16, 185, 129];
    }

    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.6);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.text(title, margin + 4, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLOR_TEXT_DARK[0], COLOR_TEXT_DARK[1], COLOR_TEXT_DARK[2]);
    doc.text(lines, margin + 4, currentY + 10);

    currentY += boxHeight + 4;
  };

  // =========================================================================
  // HALAMAN 1: COVER & PENGENALAN SISTEM
  // =========================================================================
  // Big Header Card
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.roundedRect(margin, margin, contentWidth, 54, 4, 4, 'F');

  // Badge
  doc.setFillColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
  doc.roundedRect(margin + 6, margin + 6, 68, 6.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DOKUMEN RESMI PANDUAN PENGGUNA', margin + 9, margin + 10.5);

  // Main Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('PANDUAN OPERASIONAL SISTEM POS', margin + 6, margin + 22);
  doc.setFontSize(14);
  doc.setTextColor(229, 181, 103);
  doc.text(`${storeName.toUpperCase()} & MANAJEMEN INVENTARIS`, margin + 6, margin + 28);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(240, 230, 220);
  doc.text(tagline, margin + 6, margin + 35);
  doc.text(`Lokasi: ${address} | Instagram: ${instagram}`, margin + 6, margin + 40);
  doc.text(`Tanggal Cetak: ${currentDateStr} • Panduan Komprehensif Berkas PDF`, margin + 6, margin + 45);

  currentY = margin + 60;

  // Daftar Isi Ringkas
  addSectionTitle('Daftar Isi & Struktur Panduan');
  const tocData = [
    ['Bab 1', 'Hak Akses Pengguna & Manajemen Akun Kasir', 'Peran Owner, Supervisor, Barista & PIN Kasir POS', 'Hal. 1'],
    ['Bab 2', 'Modul Kasir POS (Point of Sale)', 'Alur Pesanan, Kustomisasi Rasa, Diskon, Pajak & Cetak Struk', 'Hal. 2'],
    ['Bab 3', 'Inventaris Bahan Baku & Resep BOM', 'Pengurangan Bahan Otomatis, Kartu Mutasi Stok IN/OUT/WASTE', 'Hal. 3'],
    ['Bab 4', 'Laporan Omzet & Prosedur Tutup Kasir', 'Membaca KPI Keuangan, Tutup Shift (Z-Report) & Retur', 'Hal. 4'],
    ['Bab 5', 'Portal Admin & Ekspor Database MySQL', 'Pengaturan Branding, Skrip SQL & Impor ke phpMyAdmin', 'Hal. 5'],
    ['Bab 6', 'FAQ, Solusi Masalah & Tips Operasional', 'Penyimpanan Offline, Sinkronisasi Cloud & Reset Data Latihan', 'Hal. 5'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Bab', 'Topik Modul', 'Ringkasan Materi', 'Lokasi']],
    body: tocData,
    theme: 'grid',
    headStyles: {
      fillColor: [74, 44, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [40, 25, 18],
    },
    alternateRowStyles: {
      fillColor: [247, 242, 234],
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 96 },
      3: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Bab 1 Content
  addSectionTitle('BAB 1: Hak Akses & Manajemen Akun Pengguna', 'Menjaga keamanan operasional dan akuntabilitas uang laci kasir.');

  const roleTableData = [
    [
      'Owner / Manajer',
      'admin\n(Pass: admin123)',
      'Otoritas penuh manajemen: kelola inventaris, racik resep BOM, analisa keuangan, ubah branding logo toko, tambah akun kasir, dan ekspor SQL.',
    ],
    [
      'Supervisor',
      'supervisor\n(Pass: supervisor123)',
      'Pengawasan harian gerai: verifikasi fisik tutup kasir shift (Z-Report), persetujuan retur nota pembeli, dan kontrol batas stok minimum.',
    ],
    [
      'Kasir / Barista',
      'arya, maya, budi\n(PIN: 1234)',
      'Operasional meja kasir: menerima pesanan tamu, kustomisasi minuman, memilih metode bayar, cetak struk thermal, dan buka laci kasir.',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Peran (*Role*)', 'Kredensial Default', 'Tanggung Jawab & Hak Akses Sistem']],
    body: roleTableData,
    theme: 'grid',
    headStyles: {
      fillColor: [111, 69, 52],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [40, 25, 18],
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 110 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;
  addCallout(
    'PENTING: Pergantian Kasir Aktif Cepat',
    'Nama kasir yang bertugas dapat diubah seketika dengan mengklik tombol "Kasir Aktif" di header atas tanpa perlu logout. Setiap transaksi otomatis tercatat atas nama kasir tersebut untuk evaluasi shift.',
    'info'
  );

  addHeaderFooter(1);

  // =========================================================================
  // HALAMAN 2: MODUL KASIR POS (POINT OF SALE)
  // =========================================================================
  doc.addPage();
  currentY = margin;

  addSectionTitle('BAB 2: Modul Kasir POS (Point of Sale)', 'Langkah operasional menerima pesanan, kustomisasi rasa, hingga cetak nota struk.');

  addSubHeading('A. Langkah Menerima Pesanan & Kustomisasi Minuman');
  addParagraph(
    '1. Masuk ke tab "Kasir POS" (ikon tas belanja di bilah atas).'
  );
  addParagraph(
    '2. Pilih kategori produk (Signature, Classic Coffee, Non-Coffee, Food, Beans) atau gunakan bilah pencarian instan.'
  );
  addParagraph(
    '3. Klik kartu menu. Jika produk memiliki opsi kustomisasi rasa, modal pop-up akan muncul otomatis:'
  );

  const customData = [
    ['Pilihan Suhu', 'Hot (Panas) atau Iced (Dingin)', 'Mengatur temperatur penyajian gelas.'],
    ['Tingkat Kemanisan', 'Normal (100%), Less Sugar (70%), Half (50%), atau 0%', 'Menyesuaikan takaran sirup/gula aren.'],
    ['Opsi Susu', 'Fresh Milk Pasteurisasi atau Oatmilk Barista (+Rp 6.000)', 'Susu nabati menambah harga secara otomatis.'],
    ['Catatan Tambahan', 'Contoh: "es batu dipisah", "tanpa sedotan", "latte art panda"', 'Tercetak jelas di struk untuk barista bar.'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Opsi Kustomisasi', 'Pilihan Tersedia', 'Keterangan Operasional']],
    body: customData,
    theme: 'grid',
    headStyles: {
      fillColor: [74, 44, 32],
      textColor: [255, 255, 255],
      fontSize: 8,
      cellPadding: 2,
    },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 75 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  addSubHeading('B. Pengisian Data Tamu & Keranjang Belanja');
  addParagraph(
    '• Nama Pelanggan: Wajib diisi agar barista dapat memanggil nama tamu saat pesanan siap di counter.',
    4
  );
  addParagraph(
    '• Tipe Pesanan: Pilih "Dine In" (masukkan nomor meja, misal Meja 04) atau "Take Away" (dibungkus).',
    4
  );
  addParagraph(
    '• Kontrol Porsi: Gunakan tombol (+) dan (-) di keranjang untuk mengatur jumlah pesanan tamu.',
    4
  );

  currentY += 2;
  addSubHeading('C. Penambahan Diskon Promo & Pajak PB1');
  addParagraph(
    '• Diskon / Voucher: Klik tombol "Tambah Diskon", masukkan nominal rupiah potongan (misal: Rp 5.000) dan nama vouchernya (misal: Promo Morning). Potongan otomatis mengurangi subtotal.',
    4
  );
  addParagraph(
    '• Pajak Restoran (PB1 10%): Tersedia sakelar tombol ON/OFF. Jika diaktifkan, pajak 10% dihitung otomatis dan tertera pada rincian nota.',
    4
  );

  currentY += 2;
  addSubHeading('D. 4 Metode Pembayaran & Cetak Struk');
  addParagraph(
    'Setelah memeriksa total akhir, klik tombol hijau "Bayar Sekarang (Rp ...)". Sistem mendukung 4 opsi pembayaran:'
  );

  const payData = [
    ['TUNAI (Cash)', 'Tersedia tombol pecahan instan (Uang Pas, Rp 50.000, Rp 100.000). Sistem otomatis menghitung nominal kembalian pembeli secara presisi.'],
    ['QRIS (E-Wallet)', 'Menampilkan kode QRIS dinamis di layar untuk discan melalui GoPay, OVO, ShopeePay, Dana, LinkAja, atau Mobile Banking BCA/Mandiri.'],
    ['KARTU DEBIT', 'Digunakan untuk transaksi mesin gesek/chip EDC perbankan (BCA, Mandiri, BRI, BNI).'],
    ['TRANSFER BANK', 'Digunakan saat pelanggan melakukan transfer langsung ke rekening kedai kopi.'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Metode Pembayaran', 'Cara Penanganan di Meja Kasir']],
    body: payData,
    theme: 'grid',
    headStyles: {
      fillColor: [111, 69, 52],
      textColor: [255, 255, 255],
      fontSize: 8,
      cellPadding: 2,
    },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 138 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;
  addCallout(
    'Cetak Struk Kasir Thermal (58mm / 80mm)',
    'Klik "Selesaikan Transaksi", jendela struk akan muncul otomatis. Klik "Cetak Struk" atau gunakan tombol pintas keyboard Ctrl+P / Cmd+P untuk mengirim nota ke printer bluetooth atau USB thermal kasir.',
    'success'
  );

  addHeaderFooter(2);

  // =========================================================================
  // HALAMAN 3: MANAJEMEN INVENTARIS, BAHAN BAKU & RESEP BOM
  // =========================================================================
  doc.addPage();
  currentY = margin;

  addSectionTitle('BAB 3: Inventaris, Bahan Baku & Resep BOM', 'Sistem cerdas Bill of Materials yang otomatis memotong stok gudang saat transaksi.');

  addSubHeading('A. Konsep Menu Jadi vs Bahan Baku Mentah');
  addParagraph(
    'Sistem membedakan secara tegas antara menu yang dijual kepada tamu dengan stok bahan mentah di gudang:'
  );
  addParagraph(
    '1. Menu Jadi (Products): Memiliki harga jual, estimasi HPP pokok, dan batas stok pajangan.',
    4
  );
  addParagraph(
    '2. Bahan Baku (Ingredients): Komoditas dapur dengan satuan fisik riil: Biji Kopi (gram), Susu & Sirup (ml), Bubuk Cokelat & Matcha (gram), serta Kemasan Cup (pcs).',
    4
  );

  currentY += 2;
  addSubHeading('B. Formula Resep BOM (Bill of Materials) Otomatis');
  addParagraph(
    'Setiap produk dikaitkan dengan resep bahan baku. Saat kasir menyelesaikan pesanan di POS, sistem secara instan memotong stok bahan baku terkait tanpa perlu input manual!'
  );

  const recipeSampleData = [
    ['Es Kopi Susu Kafein', 'Biji Kopi House Blend (18g), Susu Fresh Milk (140ml), Gula Aren (25ml), Cup Dingin 16oz (1 pcs)', 'Rp 7.200', 'Rp 23.000'],
    ['Caramel Macchiato', 'Biji Kopi Blend (18g), Fresh Milk (160ml), Sirup Karamel (30ml), Cup Dingin 16oz (1 pcs)', 'Rp 9.400', 'Rp 30.000'],
    ['Cafe Latte (Hot)', 'Biji Kopi Blend (18g), Fresh Milk (180ml), Paper Cup 8oz + Sleeve (1 pcs)', 'Rp 7.800', 'Rp 26.000'],
    ['Matcha Latte Uji', 'Bubuk Pure Matcha Uji (12g), Fresh Milk (160ml), Cup Dingin 16oz (1 pcs)', 'Rp 8.200', 'Rp 26.000'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Nama Menu', 'Komposisi Resep Bahan Baku (BOM)', 'HPP Resep', 'Harga Jual']],
    body: recipeSampleData,
    theme: 'grid',
    headStyles: {
      fillColor: [74, 44, 32],
      textColor: [255, 255, 255],
      fontSize: 8,
      cellPadding: 2,
    },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 95 },
      2: { cellWidth: 22, halign: 'right' },
      3: { cellWidth: 23, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  addSubHeading('C. Kartu Mutasi Stok Manual (Audit Log)');
  addParagraph(
    'Untuk mencatat pergerakan barang fisik di luar transaksi kasir, gunakan sub-tab "Kartu Mutasi":'
  );

  const mutationTypes = [
    ['IN (Barang Masuk / Restock)', 'Penerimaan pasokan baru dari roastery atau supplier (misal: masuk 5.000 gram biji kopi).', 'Stok Bertambah (+)'],
    ['WASTE (Afkir / Rusak / Basi)', 'Pencatatan barang yang tumpah, susu basi, atau pastry gosong. Nilai kerugian tercatat di pembukuan.', 'Stok Berkurang (-)'],
    ['OUT (Penyesuaian Keluar)', 'Pemakaian internal kedai, misalnya biji kopi yang digunakan untuk kalibrasi rasa espresso pagi oleh barista.', 'Stok Berkurang (-)'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Tipe Mutasi', 'Contoh Kasus Penggunaan', 'Efek pada Sistem']],
    body: mutationTypes,
    theme: 'grid',
    headStyles: {
      fillColor: [111, 69, 52],
      textColor: [255, 255, 255],
      fontSize: 8,
      cellPadding: 2,
    },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold' },
      1: { cellWidth: 98 },
      2: { cellWidth: 36, fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;
  addCallout(
    'Peringatan Stok Menipis (Low Stock Alert)',
    'Jika ada bahan baku yang stoknya berada pada atau di bawah batas minimum (minStock), ikon lonceng kuning di header atas akan berkedip. Klik ikon tersebut untuk melihat daftar belanjaan restock darurat.',
    'alert'
  );

  addHeaderFooter(3);

  // =========================================================================
  // HALAMAN 4: LAPORAN KEUANGAN & PROSEDUR TUTUP KASIR (Z-REPORT)
  // =========================================================================
  doc.addPage();
  currentY = margin;

  addSectionTitle('BAB 4: Laporan Keuangan & Tutup Kasir', 'Rekap omzet, analisa laba kotor, grafik jam ramai kedai, dan penutupan shift kasir.');

  addSubHeading('A. 4 Indikator Keuangan Utama (KPI Cards)');
  addParagraph(
    '1. Total Omzet: Jumlah keseluruhan pendapatan kotor dari transaksi yang berstatus selesai (COMPLETED).'
  );
  addParagraph(
    '2. Estimasi Laba Kotor (Gross Profit): Total Omzet dikurangi Total HPP Bahan Baku. Menunjukkan keuntungan kotor murni produk sebelum biaya sewa & utilitas.'
  );
  addParagraph(
    '3. Total Item Terjual: Total kuantitas cup minuman dan porsi pastry yang telah disajikan.'
  );
  addParagraph(
    '4. Rata-rata per Pesanan (AOV): Rata-rata nominal belanja tiap tamu/struk (Average Order Value).'
  );

  currentY += 2;
  addSubHeading('B. Prosedur Tutup Kasir / Settlement Shift (Z-Report)');
  addParagraph(
    'Di akhir jam kerja kasir atau pergantian shift barista, wajib dilakukan penutupan laci kasir:'
  );

  const settlementSteps = [
    ['Langkah 1', 'Klik tombol "Tutup Kasir (Shift)" di bilah atas halaman Laporan.'],
    ['Langkah 2', 'Sistem menampilkan rincian total transaksi per metode bayar (Tunai, QRIS, Debit, Transfer).'],
    ['Langkah 3', 'Keluarkan dan hitung uang tunai fisik (kertas & koin) yang ada di dalam laci uang kasir.'],
    ['Langkah 4', 'Ketik jumlah uang fisik ke kolom penghitungan. Sistem mendeteksi otomatis status laci:'],
    ['Hasil Analisa', '• SEIMBANG (Balanced): Uang fisik pas sesuai pembukuan sistem.\n• SELISIH LEBIH (Over): Uang fisik lebih banyak dari nota.\n• SELISIH KURANG (Short): Uang fisik kurang dari nota kasir.'],
    ['Langkah 5', 'Klik "Cetak Ringkasan Shift" untuk dicetak dan ditandatangani oleh kasir dan supervisor.'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Tahapan', 'Instruksi Operasional Tutup Kasir']],
    body: settlementSteps,
    theme: 'grid',
    headStyles: {
      fillColor: [74, 44, 32],
      textColor: [255, 255, 255],
      fontSize: 8,
      cellPadding: 2,
    },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold' },
      1: { cellWidth: 152 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  addSubHeading('C. Prosedur Retur & Pembatalan Transaksi (Refund)');
  addParagraph(
    'Jika pelanggan salah memesan atau terjadi pembatalan pesanan:'
  );
  addParagraph(
    '1. Buka tabel riwayat nota pada halaman Laporan.',
    4
  );
  addParagraph(
    '2. Klik tombol merah "Retur" pada baris nomor struk yang bersangkutan.',
    4
  );
  addParagraph(
    '3. Pilih alasan retur (contoh: "Pelanggan salah pesan" atau "Batal buru-buru").',
    4
  );
  addParagraph(
    '4. Sistem akan mengubah status menjadi REFUNDED, omzet otomatis dikoreksi, dan stok bahan baku dikembalikan ke gudang.',
    4
  );

  currentY += 2;
  addSubHeading('D. Ekspor Data ke Excel (CSV) & Database SQL');
  addParagraph(
    '• Ekspor CSV: Klik tombol "Export CSV" untuk mengunduh rekap riwayat transaksi ke Microsoft Excel / Google Sheets untuk laporan akuntansi bulanan.',
    4
  );
  addParagraph(
    '• Ekspor SQL: Klik tombol "Ekspor SQL" untuk mengunduh dump database MySQL sewaktu-waktu.',
    4
  );

  addHeaderFooter(4);

  // =========================================================================
  // HALAMAN 5: PORTAL ADMIN, DATABASE MYSQL & FAQ
  // =========================================================================
  doc.addPage();
  currentY = margin;

  addSectionTitle('BAB 5: Portal Admin, Branding & Database MySQL', 'Personalisasi kedai kopi dan tata cara unggah database ke MySQL.');

  addSubHeading('A. Pengaturan Identitas & Logo Toko (Branding)');
  addParagraph(
    'Melalui menu Admin > Tab "Logo & Title Bar", Anda dapat mengubah:'
  );
  addParagraph(
    '• Nama Kedai & Tagline: Ditampilkan di header aplikasi, judul tab browser, dan kop nota struk.',
    4
  );
  addParagraph(
    '• Logo Preset / Kustom: Pilih ikon artisan kopi atau masukkan link URL logo resmi kedai Anda.',
    4
  );
  addParagraph(
    '• Alamat & Akun Instagram: Otomatis tercetak di bagian bawah (footer) struk belanja pembeli.',
    4
  );

  currentY += 2;
  addSubHeading('B. Panduan Upload Database ke MySQL (phpMyAdmin / cPanel)');
  addParagraph(
    'Sistem menyediakan berkas skrip SQL lengkap (kedai_kopi_mysql.sql) berisi 10 tabel InnoDB, Primary & Foreign Keys, serta 3 SQL Views laporan:'
  );

  const sqlSteps = [
    ['1. Unduh Berkas', 'Buka Admin > Tab "Database MySQL", lalu klik tombol "Unduh File .SQL".'],
    ['2. Akses phpMyAdmin', 'Buka browser dan buka phpMyAdmin (http://localhost/phpmyadmin atau lewat cPanel).'],
    ['3. Tab Import', 'Pilih tab "Import". Script sudah memiliki perintah CREATE DATABASE IF NOT EXISTS otomatis.'],
    ['4. Pilih File & Kirim', 'Pilih file kedai_kopi_mysql.sql, lalu klik tombol "Go / Kirim". Selesai!'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Langkah', 'Panduan Impor MySQL']],
    body: sqlSteps,
    theme: 'grid',
    headStyles: {
      fillColor: [74, 44, 32],
      textColor: [255, 255, 255],
      fontSize: 8,
      cellPadding: 2,
    },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 148 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  addSectionTitle('BAB 6: Pertanyaan Umum (FAQ) & Tips Operasional');

  const faqData = [
    [
      'Bagaimana jika koneksi internet terputus?',
      'Aplikasi dirancang dengan arsitektur Offline-First. Seluruh transaksi kasir tetap dapat berjalan normal menggunakan penyimpanan lokal browser (localStorage). Saat koneksi pulih, sistem otomatis menyinkronkan data ke Cloud Firestore (lihat indikator Cloud Live hijau).',
    ],
    [
      'Bagaimana cara reset data untuk latihan barista baru?',
      'Tersedia tombol ikon putar balik (Reset Demo) di ujung kanan header atas. Fitur ini akan mengembalikan seluruh produk, bahan baku, akun kasir, dan contoh nota ke kondisi awal untuk pelatihan staf.',
    ],
    [
      'Bagaimana jika hasil cetak struk terpotong?',
      'Pastikan pada dialog print browser (Ctrl+P), ukuran kertas diatur ke 58mm atau 80mm Roll, Margin diatur ke "None" atau "Minimum", dan centang opsi "Background graphics".',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Pertanyaan Operasional', 'Solusi & Petunjuk Teknis']],
    body: faqData,
    theme: 'grid',
    headStyles: {
      fillColor: [111, 69, 52],
      textColor: [255, 255, 255],
      fontSize: 8,
      cellPadding: 2,
    },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 130 },
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;
  addCallout(
    'Pusat Bantuan Cepat di Aplikasi',
    'Buku panduan ini dapat dibuka kapan saja di dalam sistem dengan mengklik tombol "Panduan" pada bilah navigasi atas (Header).',
    'info'
  );

  addHeaderFooter(5);

  // Save the PDF file
  const filename = `Buku_Panduan_Kedai_Kopi_Efek_Kafein_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
