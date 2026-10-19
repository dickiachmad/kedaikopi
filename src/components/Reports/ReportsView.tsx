import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Coffee,
  Calendar,
  Search,
  Printer,
  RotateCcw,
  Receipt,
  CheckCircle,
  FileText,
  Clock,
  UserCheck,
  X,
  Copy,
  FileDown,
} from 'lucide-react';
import { useCoffee } from '../../context/CoffeeContext';
import { Transaction, PaymentMethod } from '../../types';
import {
  formatRupiah,
  formatNumber,
  formatDateTime,
  formatTimeOnly,
  formatDateOnly,
} from '../../utils/formatters';
import { generateSalesReportPdf } from '../../utils/pdfSalesReportGenerator';
import { ReceiptModal } from '../POS/ReceiptModal';
import { renderPresetIcon } from '../Common/BrandLogo';

export const ReportsView: React.FC = () => {
  const {
    transactions,
    branding,
    refundTransaction,
    selectedTransactionForReceipt,
    setSelectedTransactionForReceipt,
    cashierName,
  } = useCoffee();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('today');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'REFUNDED'>('ALL');
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementCopied, setSettlementCopied] = useState(false);
  const [refundTarget, setRefundTarget] = useState<Transaction | null>(null);
  const [refundReason, setRefundReason] = useState('Pelanggan salah pesan / batal');

  const todayStr = new Date().toISOString().slice(0, 10);

  // Filter transactions based on date
  const filteredByDateTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (dateFilter === 'today') {
        return t.timestamp.startsWith(todayStr);
      }
      if (dateFilter === 'week') {
        const tDate = new Date(t.timestamp).getTime();
        const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
        return tDate >= sevenDaysAgo;
      }
      return true;
    });
  }, [transactions, dateFilter, todayStr]);

  // Filter by search & status for the table
  const displayTransactions = useMemo(() => {
    return filteredByDateTransactions.filter((t) => {
      const matchSearch =
        t.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        t.items.some((i) => i.productName.toLowerCase().includes(searchFilter.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [filteredByDateTransactions, searchFilter, statusFilter]);

  // Aggregated KPIs
  const completedTransactions = useMemo(() => {
    return filteredByDateTransactions.filter((t) => t.status === 'COMPLETED');
  }, [filteredByDateTransactions]);

  const totalRevenue = completedTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalCogs = completedTransactions.reduce((acc, t) => acc + t.totalCogs, 0);
  const grossProfit = totalRevenue - totalCogs;
  const totalItemsSold = completedTransactions.reduce(
    (acc, t) => acc + t.items.reduce((iAcc, item) => iAcc + item.quantity, 0),
    0
  );
  const averageOrderValue = completedTransactions.length > 0
    ? Math.round(totalRevenue / completedTransactions.length)
    : 0;

  // Hourly Sales Data for Chart
  const hourlyChartData = useMemo(() => {
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
    const buckets: Record<string, { hour: string; revenue: number; orders: number }> = {};
    hours.forEach((h) => {
      buckets[h] = { hour: h, revenue: 0, orders: 0 };
    });

    completedTransactions.forEach((t) => {
      const date = new Date(t.timestamp);
      const h = date.getHours();
      let slot = '08:00';
      if (h >= 21) slot = '22:00';
      else if (h >= 19) slot = '20:00';
      else if (h >= 17) slot = '18:00';
      else if (h >= 15) slot = '16:00';
      else if (h >= 13) slot = '14:00';
      else if (h >= 11) slot = '12:00';
      else if (h >= 9) slot = '10:00';
      else slot = '08:00';

      buckets[slot].revenue += t.totalAmount;
      buckets[slot].orders += 1;
    });

    return Object.values(buckets);
  }, [completedTransactions]);

  // Payment Method Breakdown for Pie Chart
  const paymentBreakdown = useMemo(() => {
    const counts: Record<PaymentMethod, { method: PaymentMethod; total: number; count: number }> = {
      TUNAI: { method: 'TUNAI', total: 0, count: 0 },
      QRIS: { method: 'QRIS', total: 0, count: 0 },
      DEBIT: { method: 'DEBIT', total: 0, count: 0 },
      TRANSFER: { method: 'TRANSFER', total: 0, count: 0 },
    };

    completedTransactions.forEach((t) => {
      counts[t.paymentMethod].total += t.totalAmount;
      counts[t.paymentMethod].count += 1;
    });

    return Object.values(counts).filter((c) => c.total > 0);
  }, [completedTransactions]);

  const PAYMENT_COLORS: Record<PaymentMethod, string> = {
    TUNAI: '#10b981', // Emerald
    QRIS: '#C8894A', // Caramel
    DEBIT: '#3b82f6', // Blue
    TRANSFER: '#8b5cf6', // Violet
  };

  // Top 5 Best Selling Products
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; revenue: number }> = {};
    completedTransactions.forEach((t) => {
      t.items.forEach((item) => {
        if (!map[item.productId]) {
          map[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
        }
        map[item.productId].quantity += item.quantity;
        map[item.productId].revenue += item.totalPrice;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [completedTransactions]);

  const handleExecuteRefund = () => {
    if (!refundTarget) return;
    refundTransaction(refundTarget.id, refundReason);
    setRefundTarget(null);
  };

  // Settlement / Z-Report calculations
  const totalSubtotal = useMemo(() => {
    return completedTransactions.reduce((acc, t) => acc + (t.subtotal || 0), 0);
  }, [completedTransactions]);

  const totalDiscount = useMemo(() => {
    return completedTransactions.reduce((acc, t) => acc + (t.discount || 0), 0);
  }, [completedTransactions]);

  const totalTax = useMemo(() => {
    return completedTransactions.reduce((acc, t) => acc + (t.tax || 0), 0);
  }, [completedTransactions]);

  const tunaiTotal = paymentBreakdown.find((p) => p.method === 'TUNAI')?.total || 0;
  const qrisTotal = paymentBreakdown.find((p) => p.method === 'QRIS')?.total || 0;
  const debitTotal = paymentBreakdown.find((p) => p.method === 'DEBIT')?.total || 0;
  const transferTotal = paymentBreakdown.find((p) => p.method === 'TRANSFER')?.total || 0;
  const totalNonTunai = qrisTotal + debitTotal + transferTotal;

  const handleCopySettlementText = () => {
    const lines = [
      '================================',
      `   ${branding.storeName.toUpperCase()}   `,
      `   ${branding.address || 'Jl. Kafein Boulevard No. 18'}   `,
      '================================',
      'LAPORAN TUTUP KASIR (Z-REPORT)',
      '--------------------------------',
      `Kasir Shift : ${cashierName}`,
      `Tanggal     : ${formatDateOnly(new Date().toISOString())}`,
      `Waktu Cetak : ${formatTimeOnly(new Date().toISOString())} WIB`,
      `Periode     : ${dateFilter === 'today' ? 'Hari Ini' : dateFilter === 'week' ? '7 Hari Terakhir' : 'Semua Transaksi'}`,
      '--------------------------------',
      `Total Struk : ${completedTransactions.length} transaksi`,
      `Item Terjual: ${totalItemsSold} porsi`,
      '--------------------------------',
      'REKONSILIASI KAS:',
      `1. Tunai (Drawer) : ${formatRupiah(tunaiTotal)}`,
      `2. QRIS           : ${formatRupiah(qrisTotal)}`,
      `3. Debit EDC      : ${formatRupiah(debitTotal)}`,
      `4. Transfer Bank  : ${formatRupiah(transferTotal)}`,
      `Subtotal Non-Tunai: ${formatRupiah(totalNonTunai)}`,
      '--------------------------------',
      `Subtotal Kotor: ${formatRupiah(totalSubtotal)}`,
      totalDiscount > 0 ? `Total Diskon  : -${formatRupiah(totalDiscount)}` : null,
      totalTax > 0 ? `PB1 (10%)     : +${formatRupiah(totalTax)}` : null,
      '================================',
      `TOTAL OMSET   : ${formatRupiah(totalRevenue)}`,
      '================================',
      `Total HPP     : ${formatRupiah(totalCogs)}`,
      `Laba Kotor    : ${formatRupiah(grossProfit)}`,
      '--------------------------------',
      'Kasir Bertugas,     Supervisor,',
      '',
      '(..............)    (..............)',
      '================================',
      `*** SISTEM POS ${branding.storeName.toUpperCase()} ***`,
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setSettlementCopied(true);
    setTimeout(() => setSettlementCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header with Date Filter & Export Button */}
      <div className="bg-[#FFFDF9] border border-[#6F4534]/20 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#C8894A]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A2C20]">
                Laporan Penjualan Real-time
              </h2>
            </div>
            <p className="text-xs text-[#6F4534] mt-1">
              Rekap omzet, laba kotor, grafik jam sibuk kedai kopi, dan mutasi kasir hari ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Date filter pills */}
            <div className="flex items-center p-1 bg-[#F7F2EA] rounded-xl border border-[#6F4534]/20">
              <button
                type="button"
                onClick={() => setDateFilter('today')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateFilter === 'today'
                    ? 'bg-[#4A2C20] text-white shadow-xs'
                    : 'text-[#6F4534] hover:text-[#4A2C20]'
                }`}
              >
                Hari Ini (Live)
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateFilter === 'week'
                    ? 'bg-[#4A2C20] text-white shadow-xs'
                    : 'text-[#6F4534] hover:text-[#4A2C20]'
                }`}
              >
                7 Hari Terakhir
              </button>
              <button
                type="button"
                onClick={() => setDateFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateFilter === 'all'
                    ? 'bg-[#4A2C20] text-white shadow-xs'
                    : 'text-[#6F4534] hover:text-[#4A2C20]'
                }`}
              >
                Semua Data
              </button>
            </div>

            {/* Z-Report / Tutup Kasir button */}
            <button
              type="button"
              onClick={() => setShowSettlementModal(true)}
              className="py-2 px-3.5 rounded-xl bg-[#F7F2EA] hover:bg-[#6F4534]/15 text-[#4A2C20] border border-[#6F4534]/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <FileText className="w-4 h-4 text-[#C8894A]" />
              <span>Tutup Kasir (Shift)</span>
            </button>

            {/* Export PDF button */}
            <button
              type="button"
              onClick={() => {
                const dateLabel =
                  dateFilter === 'today'
                    ? 'Hari Ini'
                    : dateFilter === 'week'
                    ? '7 Hari Terakhir'
                    : 'Semua Periode';
                generateSalesReportPdf({
                  transactions: filteredByDateTransactions,
                  storeName: branding.storeName,
                  tagline: branding.tagline,
                  address: branding.address,
                  instagram: branding.instagram,
                  dateFilterLabel: dateLabel,
                  cashierName,
                  totalRevenue,
                  totalCogs,
                  grossProfit,
                  totalItemsSold,
                  averageOrderValue,
                  paymentBreakdown,
                });
              }}
              className="py-2 px-3.5 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#C8894A]/20 transition-all cursor-pointer"
              title="Unduh Laporan Penjualan Lengkap dalam format PDF"
            >
              <FileDown className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F4534]">Total Omset Penjualan</span>
            <div className="w-8 h-8 rounded-xl bg-[#C8894A]/15 text-[#C8894A] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-[#4A2C20]">
              {formatRupiah(totalRevenue)}
            </p>
            <span className="text-[11px] text-[#6F4534] block mt-0.5">
              Dari {completedTransactions.length} transaksi sukses
            </span>
          </div>
        </div>

        {/* Laba Kotor / Gross Profit */}
        <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F4534]">Estimasi Laba Kotor (Profit)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-emerald-700">
              {formatRupiah(grossProfit)}
            </p>
            <span className="text-[11px] text-[#6F4534] block mt-0.5">
              HPP Bahan: {formatRupiah(totalCogs)}
            </span>
          </div>
        </div>

        {/* Total Cup/Item Terjual */}
        <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F4534]">Total Cup & Item Terjual</span>
            <div className="w-8 h-8 rounded-xl bg-[#F7F2EA] text-[#6F4534] border border-[#6F4534]/20 flex items-center justify-center">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-[#4A2C20]">
              {formatNumber(totalItemsSold)} <span className="text-xs text-[#6F4534]">cup/item</span>
            </p>
            <span className="text-[11px] text-[#6F4534] block mt-0.5">
              Rata-rata {averageOrderValue > 0 ? formatRupiah(averageOrderValue) : 'Rp 0'}/pesanan
            </span>
          </div>
        </div>

        {/* Transaksi Selesai vs Refund */}
        <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#6F4534]">Efisiensi Operasional</span>
            <div className="w-8 h-8 rounded-xl bg-[#F7F2EA] text-[#C8894A] border border-[#C8894A]/30 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold font-mono text-[#4A2C20]">
              {completedTransactions.length}{' '}
              <span className="text-xs text-emerald-700 font-normal">sukses</span>
            </p>
            <span className="text-[11px] text-rose-700 block mt-0.5">
              {filteredByDateTransactions.filter((t) => t.status === 'REFUNDED').length} transaksi dibatalkan (refund)
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly Sales Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFDF9] border border-[#6F4534]/15 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-sm font-bold text-[#4A2C20]">
                Grafik Penjualan per Jam
              </h3>
              <p className="text-xs text-[#6F4534]">
                Distribusi omzet berdasarkan jam operasional kedai kopi
              </p>
            </div>
            <span className="text-[10px] text-[#C8894A] font-semibold bg-[#F7F2EA] px-2 py-0.5 rounded border border-[#C8894A]/30">
              WIB
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ded1" />
                <XAxis dataKey="hour" stroke="#6F4534" fontSize={11} />
                <YAxis
                  stroke="#6F4534"
                  fontSize={10}
                  tickFormatter={(val) => `Rp${val / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#FFFDF9] border border-[#6F4534]/20 p-2.5 rounded-xl shadow-xl text-xs text-[#4A2C20]">
                          <p className="font-bold text-[#C8894A]">{data.hour}</p>
                          <p className="mt-1 font-mono font-semibold">Omzet: {formatRupiah(data.revenue)}</p>
                          <p className="text-[10px] text-[#6F4534]">{data.orders} pesanan</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="revenue" fill="#C8894A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods Donut Chart & Top Products (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Methods Breakdown */}
          <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-2xl p-5 shadow-xs">
            <h3 className="font-serif text-sm font-bold text-[#4A2C20] mb-1">
              Metode Pembayaran
            </h3>
            <p className="text-xs text-[#6F4534] mb-3">Porsi pembayaran non-tunai vs tunai</p>

            <div className="flex items-center justify-center h-44">
              {paymentBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentBreakdown}
                      dataKey="total"
                      nameKey="method"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {paymentBreakdown.map((entry) => (
                        <Cell key={entry.method} fill={PAYMENT_COLORS[entry.method] || '#C8894A'} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#FFFDF9] border border-[#6F4534]/20 p-2 rounded-xl text-xs text-[#4A2C20] shadow-xl">
                              <p className="font-bold">{data.method}</p>
                              <p className="font-mono font-bold text-[#C8894A]">{formatRupiah(data.total)}</p>
                              <p className="text-[10px] text-[#6F4534]">{data.count} transaksi</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-[#6F4534]">Belum ada transaksi</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#6F4534]/15">
              {paymentBreakdown.map((p) => (
                <div key={p.method} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PAYMENT_COLORS[p.method] }}
                  />
                  <div className="text-[11px]">
                    <span className="font-semibold text-[#4A2C20]">{p.method}</span>
                    <span className="text-[#6F4534] block font-mono text-[10px]">
                      {formatRupiah(p.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Products Leaderboard */}
          <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-2xl p-5 shadow-xs">
            <h3 className="font-serif text-sm font-bold text-[#4A2C20] mb-1">
              Top 5 Menu Terlaris
            </h3>
            <p className="text-xs text-[#6F4534] mb-3">Menu dengan kuantitas penjualan tertinggi</p>

            <div className="space-y-2">
              {topProducts.length > 0 ? (
                topProducts.map((prod, idx) => (
                  <div
                    key={prod.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#F7F2EA] border border-[#6F4534]/15 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#C8894A]/20 text-[#4A2C20] font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-[#4A2C20] truncate max-w-[150px]">
                        {prod.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#4A2C20] font-mono">
                        {prod.quantity} cup
                      </span>
                      <span className="text-[10px] text-[#6F4534] block">
                        {formatRupiah(prod.revenue)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6F4534] text-center py-4">Belum ada penjualan</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-2xl overflow-hidden shadow-xs space-y-3">
        <div className="p-4 border-b border-[#6F4534]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#C8894A]" />
            <h3 className="font-bold text-sm text-[#4A2C20]">Riwayat Transaksi Penjualan</h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#6F4534] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari no. struk / nama..."
                className="bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#4A2C20] placeholder-[#6F4534]/60 outline-none focus:border-[#C8894A] w-48 sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-[#F7F2EA] border border-[#6F4534]/20 text-xs text-[#4A2C20] rounded-xl px-2.5 py-1.5 outline-none focus:border-[#C8894A]"
            >
              <option value="ALL">Semua Status</option>
              <option value="COMPLETED">Selesai</option>
              <option value="REFUNDED">Refund</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#4A2C20]">
            <thead className="bg-[#F7F2EA] text-[#6F4534] font-semibold border-b border-[#6F4534]/15 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">No. Transaksi</th>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Rincian Menu</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3">Total Bayar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#6F4534]/10">
              {displayTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F7F2EA]/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#C8894A] whitespace-nowrap">
                    {tx.id}
                  </td>

                  <td className="px-4 py-3 text-[#6F4534] whitespace-nowrap">
                    <span className="block font-mono font-medium text-[#4A2C20]">{formatTimeOnly(tx.timestamp)}</span>
                    <span className="text-[10px] text-[#6F4534]">{formatDateOnly(tx.timestamp)}</span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-semibold text-[#4A2C20] block">{tx.customerName || 'Tamu'}</span>
                    <span className="text-[10px] text-[#6F4534]">
                      {tx.orderType} {tx.tableNumber ? `• ${tx.tableNumber}` : ''}
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-xs">
                    <div className="space-y-0.5">
                      {tx.items.map((i, idx) => (
                        <p key={idx} className="truncate text-[#6F4534]">
                          <span className="font-semibold text-[#4A2C20]">{i.quantity}x</span> {i.productName}
                        </p>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        backgroundColor: `${PAYMENT_COLORS[tx.paymentMethod]}15`,
                        color: PAYMENT_COLORS[tx.paymentMethod],
                        border: `1px solid ${PAYMENT_COLORS[tx.paymentMethod]}30`,
                      }}
                    >
                      {tx.paymentMethod}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-[#4A2C20] whitespace-nowrap">
                    {formatRupiah(tx.totalAmount)}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {tx.status === 'COMPLETED' ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Sukses
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                        Refund / Batal
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Print / Reprint receipt */}
                      <button
                        type="button"
                        onClick={() => setSelectedTransactionForReceipt(tx)}
                        className="p-1.5 rounded-lg bg-[#F7F2EA] hover:bg-[#6F4534]/15 text-[#4A2C20] border border-[#6F4534]/20"
                        title="Lihat & Cetak Struk"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {/* Refund transaction */}
                      {tx.status === 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => setRefundTarget(tx)}
                          className="p-1.5 rounded-lg bg-[#F7F2EA] hover:bg-rose-100 text-rose-600 border border-[#6F4534]/20"
                          title="Refund / Batalkan Transaksi"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayTransactions.length === 0 && (
          <div className="py-12 text-center text-[#6F4534]">
            <p className="text-xs">Tidak ada riwayat transaksi pada filter ini</p>
          </div>
        )}
      </div>

      {/* MODAL: Shift Settlement / Tutup Kasir (Z-Report) */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-sm my-auto">
            {/* Modal Controls (Hidden during print) */}
            <div className="no-print flex items-center justify-between mb-3 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <FileText className="w-4 h-4 text-[#E5B567]" />
                <span>Laporan Tutup Kasir (Z-Report)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySettlementText}
                  className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#6F4534]/20 text-xs flex items-center gap-1 text-[#4A2C20] hover:bg-[#F7F2EA] cursor-pointer"
                  title="Salin teks laporan"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{settlementCopied ? 'Tersalin!' : 'Salin'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg bg-[#C8894A] hover:bg-[#b3753b] text-xs flex items-center gap-1 font-bold text-white shadow-xs cursor-pointer"
                  title="Cetak Laporan Tutup Kasir"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSettlementModal(false)}
                  className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#6F4534]/20 text-[#6F4534] hover:text-[#4A2C20] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thermal Slip (PRINTABLE AREA with .receipt-container & .printable-settlement) */}
            <div className="receipt-container printable-settlement bg-[#FFFDF9] text-[#4A2C20] font-mono text-[11px] p-6 rounded-2xl shadow-2xl border-t-8 border-[#C8894A] relative overflow-hidden">
              {/* Store Header */}
              <div className="text-center pb-3 border-b border-dashed border-[#6F4534]/25">
                <div className="flex items-center justify-center gap-1.5 text-[#4A2C20] font-bold mb-1">
                  {branding.logoType === 'custom' && branding.customLogoUrl ? (
                    <img
                      src={branding.customLogoUrl}
                      alt={branding.storeName}
                      className="w-5 h-5 object-contain rounded-xs"
                    />
                  ) : (
                    renderPresetIcon(branding.presetIcon, 'w-4 h-4 text-[#C8894A]')
                  )}
                  <span className="font-serif text-sm tracking-wider uppercase font-bold">
                    {branding.storeName}
                  </span>
                </div>
                <p className="text-[10px] text-[#6F4534]">
                  {branding.address || 'Jl. Kafein Boulevard No. 18, Jakarta'}
                </p>
                {branding.instagram && (
                  <p className="text-[9px] text-[#6F4534]/80">{branding.instagram}</p>
                )}
                <div className="mt-2 pt-2 border-t border-dashed border-[#6F4534]/20">
                  <span className="font-bold text-xs uppercase tracking-wide text-[#4A2C20] block">
                    LAPORAN TUTUP KASIR (Z-REPORT)
                  </span>
                  <span className="text-[9px] text-[#6F4534]">
                    Rekonsiliasi Kas Masuk & Omzet Shift
                  </span>
                </div>
              </div>

              {/* Shift Meta */}
              <div className="py-2.5 border-b border-dashed border-[#6F4534]/25 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-[#6F4534]">Kasir Shift:</span>
                  <span className="font-bold text-[#4A2C20]">{cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F4534]">Tanggal:</span>
                  <span className="text-[#4A2C20]">{formatDateOnly(new Date().toISOString())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F4534]">Waktu Cetak:</span>
                  <span className="text-[#4A2C20]">{formatTimeOnly(new Date().toISOString())} WIB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F4534]">Filter Data:</span>
                  <span className="text-[#4A2C20] font-semibold">
                    {dateFilter === 'today'
                      ? 'Hari Ini (Shift Berjalan)'
                      : dateFilter === 'week'
                      ? '7 Hari Terakhir'
                      : 'Semua Transaksi'}
                  </span>
                </div>
              </div>

              {/* Sales Volume */}
              <div className="py-2.5 border-b border-dashed border-[#6F4534]/25 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-[#6F4534]">Total Transaksi Selesai:</span>
                  <span className="font-bold text-[#4A2C20]">{completedTransactions.length} Struk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F4534]">Total Item/Cup Terjual:</span>
                  <span className="font-bold text-[#4A2C20]">{totalItemsSold} Porsi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F4534]">Rata-rata Nota (AOV):</span>
                  <span className="font-semibold text-[#4A2C20]">{formatRupiah(averageOrderValue)}</span>
                </div>
              </div>

              {/* Cash Reconciliation */}
              <div className="py-2.5 border-b border-dashed border-[#6F4534]/25 space-y-1.5 text-[10px]">
                <span className="font-bold text-[11px] text-[#4A2C20] block pb-0.5">
                  REKONSILIASI KAS & CARA BAYAR:
                </span>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>1. TUNAI (Cash in Drawer):</span>
                  <span>{formatRupiah(tunaiTotal)}</span>
                </div>
                <div className="flex justify-between text-[#8F5528]">
                  <span>2. QRIS (GoPay/OVO/Shopee):</span>
                  <span className="font-semibold">{formatRupiah(qrisTotal)}</span>
                </div>
                <div className="flex justify-between text-[#3b82f6]">
                  <span>3. DEBIT EDC (Kartu):</span>
                  <span className="font-semibold">{formatRupiah(debitTotal)}</span>
                </div>
                <div className="flex justify-between text-[#8b5cf6]">
                  <span>4. TRANSFER BANK:</span>
                  <span className="font-semibold">{formatRupiah(transferTotal)}</span>
                </div>
                <div className="pt-1 border-t border-dotted border-[#6F4534]/20 flex justify-between text-[#6F4534] text-[9px]">
                  <span>Subtotal Non-Tunai:</span>
                  <span className="font-bold text-[#4A2C20]">{formatRupiah(totalNonTunai)}</span>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="py-2.5 border-b-2 border-dashed border-[#6F4534]/40 space-y-1 text-[10px]">
                <div className="flex justify-between text-[#6F4534]">
                  <span>Subtotal Kotor:</span>
                  <span>{formatRupiah(totalSubtotal)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-rose-700">
                    <span>Total Diskon / Promo:</span>
                    <span>-{formatRupiah(totalDiscount)}</span>
                  </div>
                )}
                {totalTax > 0 && (
                  <div className="flex justify-between text-[#6F4534]">
                    <span>Total Pajak PB1 (10%):</span>
                    <span>+{formatRupiah(totalTax)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#6F4534]/20 flex justify-between font-bold text-xs text-[#4A2C20]">
                  <span>TOTAL OMSET SHIFT:</span>
                  <span className="font-mono text-sm">{formatRupiah(totalRevenue)}</span>
                </div>
              </div>

              {/* HPP & Gross Profit */}
              <div className="py-2.5 border-b border-dashed border-[#6F4534]/25 space-y-1 text-[10px] text-[#6F4534]">
                <div className="flex justify-between">
                  <span>Biaya Pokok Bahan (HPP):</span>
                  <span>{formatRupiah(totalCogs)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#4A2C20]">
                  <span>Estimasi Laba Kotor:</span>
                  <span>{formatRupiah(grossProfit)}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-4 pb-2 text-[9px] text-[#6F4534]">
                <div className="grid grid-cols-2 text-center gap-4">
                  <div>
                    <p className="mb-8">Kasir Bertugas,</p>
                    <p className="font-bold text-[#4A2C20] border-t border-[#6F4534]/30 pt-1">
                      ( {cashierName} )
                    </p>
                  </div>
                  <div>
                    <p className="mb-8">Supervisor / Manajer,</p>
                    <p className="font-bold text-[#4A2C20] border-t border-[#6F4534]/30 pt-1">
                      ( ........................ )
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-2 text-[9px] text-[#6F4534]/80">
                <p>*** DOKUMEN RESMI TUTUP KASIR ***</p>
                <p>Dicetak otomatis dari Sistem POS {branding.storeName}</p>
              </div>
            </div>

            {/* Bottom Actions (Hidden during print) */}
            <div className="no-print mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#C8894A]/25 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Laporan Tutup Kasir</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSettlementModal(false)}
                className="py-3 px-4 rounded-xl bg-[#FFFDF9] hover:bg-[#F7F2EA] text-[#6F4534] border border-[#6F4534]/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Refund Confirmation */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF9] border border-rose-300 rounded-2xl w-full max-w-sm shadow-2xl p-5 text-[#4A2C20]">
            <div className="flex items-center justify-between pb-3 border-b border-[#6F4534]/15">
              <h3 className="font-serif text-sm font-bold text-rose-700">
                Batalkan / Refund Transaksi
              </h3>
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="p-1 text-[#6F4534] hover:text-[#4A2C20]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <p className="text-[#6F4534]">
                Apakah Anda yakin ingin membatalkan transaksi <strong className="text-[#4A2C20]">{refundTarget.id}</strong> senilai <strong className="text-[#C8894A] font-mono">{formatRupiah(refundTarget.totalAmount)}</strong>?
              </p>
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                ⚠️ Stok menu dan bahan baku terkait akan otomatis dikembalikan ke inventaris sistem.
              </p>

              <div>
                <label className="text-xs font-semibold text-[#4A2C20] block mb-1">
                  Alasan Pembatalan:
                </label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs text-[#4A2C20] outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRefundTarget(null)}
                className="py-2 px-3 rounded-xl bg-[#F7F2EA] text-xs text-[#6F4534] hover:text-[#4A2C20] border border-[#6F4534]/20"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteRefund}
                className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Ya, Batalkan & Kembalikan Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedTransactionForReceipt && (
        <ReceiptModal
          transaction={selectedTransactionForReceipt}
          onClose={() => setSelectedTransactionForReceipt(null)}
        />
      )}
    </div>
  );
};
