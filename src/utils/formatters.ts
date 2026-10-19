export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('id-ID').format(val);
};

export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeOnly = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateOnly = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const exportTransactionsToCSV = (transactions: any[], filename = 'laporan-penjualan-efek-kafein.csv') => {
  if (!transactions.length) return;

  const headers = [
    'ID Transaksi',
    'Waktu',
    'Kasir',
    'Pelanggan',
    'Tipe Pesanan',
    'Meja',
    'Daftar Item',
    'Subtotal (Rp)',
    'Diskon (Rp)',
    'PB1 10% (Rp)',
    'Total Akhir (Rp)',
    'Metode Bayar',
    'Status',
  ];

  const rows = transactions.map((t) => [
    t.id,
    new Date(t.timestamp).toLocaleString('id-ID'),
    `"${t.cashierName || 'Kasir'}"`,
    `"${t.customerName || 'Tamu'}"`,
    t.orderType,
    t.tableNumber || '-',
    `"${t.items.map((i: any) => `${i.productName} (${i.quantity}x)`).join('; ')}"`,
    t.subtotal,
    t.discount,
    t.tax,
    t.totalAmount,
    t.paymentMethod,
    t.status,
  ]);

  const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
