import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, PaymentMethod } from '../types';
import { formatRupiah, formatDateTime, formatDateOnly, formatTimeOnly } from './formatters';

interface SalesReportPdfOptions {
  transactions: Transaction[];
  storeName?: string;
  tagline?: string;
  address?: string;
  instagram?: string;
  dateFilterLabel?: string;
  cashierName?: string;
  totalRevenue?: number;
  totalCogs?: number;
  grossProfit?: number;
  totalItemsSold?: number;
  averageOrderValue?: number;
  paymentBreakdown?: Array<{ method: PaymentMethod; total: number; count: number }>;
}

/**
 * Generates and downloads a clean, professional PDF Sales Report
 */
export function generateSalesReportPdf(options: SalesReportPdfOptions): void {
  const {
    transactions = [],
    storeName = 'Kedai Kopi Efek Kafein',
    tagline = 'Sistem POS & Inventaris Real-time',
    address = 'Jl. Kafein Boulevard No. 18, Jakarta',
    instagram = '@efekkafein.id',
    dateFilterLabel = 'Hari Ini',
    cashierName = 'Kasir Shift',
    paymentBreakdown = [],
  } = options;

  // Filter completed transactions
  const completedTx = transactions.filter((t) => t.status === 'COMPLETED');
  const refundedTx = transactions.filter((t) => t.status === 'REFUNDED');

  const totalRevenue =
    options.totalRevenue ?? completedTx.reduce((sum, t) => sum + t.totalAmount, 0);
  const totalCogs =
    options.totalCogs ?? completedTx.reduce((sum, t) => sum + (t.totalCogs || 0), 0);
  const grossProfit = options.grossProfit ?? totalRevenue - totalCogs;
  const totalItemsSold =
    options.totalItemsSold ??
    completedTx.reduce((sum, t) => sum + t.items.reduce((iSum, i) => iSum + i.quantity, 0), 0);
  const averageOrderValue =
    options.averageOrderValue ??
    (completedTx.length > 0 ? Math.round(totalRevenue / completedTx.length) : 0);
  const totalDiscount = completedTx.reduce((sum, t) => sum + (t.discount || 0), 0);
  const totalTax = completedTx.reduce((sum, t) => sum + (t.tax || 0), 0);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Palette: Coffee Artisan Theme
  const COLOR_PRIMARY = [74, 44, 32]; // #4A2C20 Deep Coffee
  const COLOR_SECONDARY = [200, 137, 74]; // #C8894A Warm Caramel
  const COLOR_BG_LIGHT = [247, 242, 234]; // #F7F2EA Cream
  const COLOR_TEXT_DARK = [40, 25, 18];
  const COLOR_TEXT_MUTED = [111, 69, 52];

  let currentY = 16;

  // Header Banner
  doc.setFillColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.roundedRect(margin, currentY, contentWidth, 26, 3, 3, 'F');

  // Gold accent line
  doc.setFillColor(COLOR_SECONDARY[0], COLOR_SECONDARY[1], COLOR_SECONDARY[2]);
  doc.rect(margin, currentY + 25, contentWidth, 1.2, 'F');

  // Brand Titles inside Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(storeName.toUpperCase(), margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(229, 181, 103); // #E5B567
  doc.text(tagline, margin + 6, currentY + 15);

  doc.setTextColor(230, 220, 210);
  doc.setFontSize(7.5);
  const contactText = `${address} • Instagram: ${instagram}`;
  doc.text(contactText, margin + 6, currentY + 21);

  // Right Badge inside Banner: LAPORAN PENJUALAN
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('LAPORAN PENJUALAN', pageWidth - margin - 6, currentY + 11, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(229, 181, 103);
  doc.text('OFFICIAL SALES REPORT', pageWidth - margin - 6, currentY + 17, { align: 'right' });

  currentY += 32;

  // Metadata Box (Period, Printed Date, Cashier)
  doc.setFillColor(COLOR_BG_LIGHT[0], COLOR_BG_LIGHT[1], COLOR_BG_LIGHT[2]);
  doc.setDrawColor(210, 190, 175);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, currentY, contentWidth, 16, 2, 2, 'FD');

  const now = new Date();
  const printTimestamp = `${formatDateOnly(now.toISOString())}, ${formatTimeOnly(now.toISOString())} WIB`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
  doc.text('Periode Laporan:', margin + 4, currentY + 6);
  doc.text('Waktu Cetak:', margin + 4, currentY + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_TEXT_DARK[0], COLOR_TEXT_DARK[1], COLOR_TEXT_DARK[2]);
  doc.text(dateFilterLabel, margin + 30, currentY + 6);
  doc.text(printTimestamp, margin + 30, currentY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);
  doc.text('Kasir Bertugas:', margin + 110, currentY + 6);
  doc.text('Status Transaksi:', margin + 110, currentY + 11.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLOR_TEXT_DARK[0], COLOR_TEXT_DARK[1], COLOR_TEXT_DARK[2]);
  doc.text(cashierName, margin + 138, currentY + 6);
  doc.text(`${completedTx.length} Selesai / ${refundedTx.length} Retur`, margin + 138, currentY + 11.5);

  currentY += 21;

  // Section 1: Ringkasan Finansial & KPI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text('1. RINGKASAN EKSEKUTIF & INDIKATOR KINERJA (KPI)', margin, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['Indikator Kinerja', 'Nilai / Nominal', 'Keterangan Analisis']],
    body: [
      ['Total Omzet Penjualan', formatRupiah(totalRevenue), 'Pendapatan kotor dari transaksi selesai'],
      ['Biaya Pokok Bahan (HPP / COGS)', formatRupiah(totalCogs), 'Total modal bahan baku terpakai'],
      ['Estimasi Laba Kotor (Gross Profit)', formatRupiah(grossProfit), 'Omzet dikurangi HPP bahan'],
      ['Rata-rata per Nota (AOV)', formatRupiah(averageOrderValue), 'Rata-rata nominal per pelanggan'],
      ['Total Transaksi Selesai', `${completedTx.length} Transaksi`, `${refundedTx.length} nota dibatalkan/refund`],
      ['Total Item / Cup Terjual', `${totalItemsSold} Porsi`, 'Volume minuman & makanan terjual'],
      ['Total Potongan Diskon / Promo', formatRupiah(totalDiscount), 'Potongan voucher & promosi kedai'],
      ['Total Pajak Restoran (PB1 10%)', formatRupiah(totalTax), 'Pajak restoran yang dipungut'],
    ],
    headStyles: {
      fillColor: [74, 44, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [40, 25, 18],
    },
    alternateRowStyles: {
      fillColor: [250, 246, 240],
    },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold' },
      1: { cellWidth: 45, fontStyle: 'bold', halign: 'right' },
      2: { cellWidth: 'auto', textColor: [111, 69, 52] },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // Section 2: Rekonsiliasi Metode Pembayaran
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text('2. REKONSILIASI METODE PEMBAYARAN', margin, currentY);
  currentY += 3;

  const paymentRows = [
    {
      method: 'TUNAI (Cash in Drawer)',
      code: 'TUNAI',
      notes: 'Uang fisik dalam laci kasir',
    },
    {
      method: 'QRIS Dinamis',
      code: 'QRIS',
      notes: 'GoPay, OVO, ShopeePay, Dana, BCA',
    },
    {
      method: 'DEBIT EDC',
      code: 'DEBIT',
      notes: 'Gesek / Kartu Chip Mesin EDC',
    },
    {
      method: 'TRANSFER BANK',
      code: 'TRANSFER',
      notes: 'Transfer langsung rekening kedai',
    },
  ].map((p) => {
    const found = paymentBreakdown.find((item) => item.method === p.code);
    const count = found?.count || completedTx.filter((t) => t.paymentMethod === p.code).length;
    const total =
      found?.total ||
      completedTx.filter((t) => t.paymentMethod === p.code).reduce((s, t) => s + t.totalAmount, 0);
    const pct = totalRevenue > 0 ? ((total / totalRevenue) * 100).toFixed(1) + '%' : '0%';
    return [p.method, `${count} transaksi`, formatRupiah(total), pct, p.notes];
  });

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['Cara Bayar', 'Jumlah Struk', 'Total Penerimaan', 'Porsi (%)', 'Keterangan']],
    body: paymentRows,
    headStyles: {
      fillColor: [200, 137, 74],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: [40, 25, 18],
    },
    alternateRowStyles: {
      fillColor: [250, 246, 240],
    },
    columnStyles: {
      0: { cellWidth: 48, fontStyle: 'bold' },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 36, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 'auto', textColor: [111, 69, 52] },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Check if we need a new page for Transaction Table
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 16;
  }

  // Section 3: Rincian Riwayat Transaksi Lengkap
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(COLOR_PRIMARY[0], COLOR_PRIMARY[1], COLOR_PRIMARY[2]);
  doc.text('3. RINCIAN RIWAYAT TRANSAKSI PENJUALAN', margin, currentY);
  currentY += 3;

  const txRows = completedTx.map((t, idx) => {
    const itemsSummary = t.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ');
    const orderInfo = `${t.orderType}${t.tableNumber ? ` - ${t.tableNumber}` : ''}`;
    return [
      (idx + 1).toString(),
      t.id,
      formatDateTime(t.timestamp),
      t.customerName,
      orderInfo,
      itemsSummary,
      t.paymentMethod,
      formatRupiah(t.totalAmount),
    ];
  });

  if (txRows.length === 0) {
    txRows.push(['-', '-', '-', '-', '-', 'Tidak ada transaksi pada periode ini', '-', 'Rp 0']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    head: [['No', 'ID Nota', 'Waktu', 'Pelanggan', 'Tipe/Meja', 'Menu Terjual', 'Bayar', 'Total']],
    body: txRows,
    headStyles: {
      fillColor: [74, 44, 32],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    styles: {
      fontSize: 7,
      cellPadding: 1.8,
      textColor: [40, 25, 18],
    },
    alternateRowStyles: {
      fillColor: [248, 244, 238],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 25 },
      3: { cellWidth: 22 },
      4: { cellWidth: 18 },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Check if signature fits on current page
  if (currentY > pageHeight - 40) {
    doc.addPage();
    currentY = 20;
  }

  // Official Signature Block
  doc.setDrawColor(200, 180, 165);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLOR_TEXT_MUTED[0], COLOR_TEXT_MUTED[1], COLOR_TEXT_MUTED[2]);

  const colWidth = contentWidth / 3;

  // Col 1: Dibuat Oleh (Kasir)
  doc.text('Dibuat oleh (Kasir):', margin + 6, currentY);
  doc.text(`( ${cashierName} )`, margin + 6, currentY + 18);
  doc.text('Staf Kasir Bertugas', margin + 6, currentY + 22);

  // Col 2: Diverifikasi (Supervisor)
  doc.text('Diverifikasi oleh:', margin + colWidth + 6, currentY);
  doc.text('( ................................. )', margin + colWidth + 6, currentY + 18);
  doc.text('Supervisor / Head Barista', margin + colWidth + 6, currentY + 22);

  // Col 3: Disetujui (Owner / Manager)
  doc.text('Disetujui oleh:', margin + colWidth * 2 + 6, currentY);
  doc.text('( ................................. )', margin + colWidth * 2 + 6, currentY + 18);
  doc.text('Owner / Store Manager', margin + colWidth * 2 + 6, currentY + 22);

  // Add Page Numbers & Footers to all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(130, 95, 75);
    doc.text(
      `${storeName} • Laporan Penjualan Resmi (${dateFilterLabel})`,
      margin,
      pageHeight - 8
    );
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth - margin,
      pageHeight - 8,
      { align: 'right' }
    );
  }

  // Generate clean filename
  const cleanStore = storeName.replace(/[^a-zA-Z0-9]/g, '_');
  const todayDate = now.toISOString().slice(0, 10);
  const filename = `Laporan_Penjualan_${cleanStore}_${todayDate}.pdf`;

  // Trigger browser download
  doc.save(filename);
}
