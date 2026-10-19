import React, { useRef } from 'react';
import { X, Printer, CheckCircle, Share2, Coffee, Copy } from 'lucide-react';
import { Transaction } from '../../types';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import { useCoffee } from '../../context/CoffeeContext';
import { renderPresetIcon } from '../Common/BrandLogo';

interface ReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { branding } = useCoffee();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      '================================',
      `     ${branding.storeName.toUpperCase()}     `,
      ` ${branding.address || 'Jl. Kafein Boulevard No. 18'} `,
      '================================',
      `No. Struk : ${transaction.id}`,
      `Waktu     : ${formatDateTime(transaction.timestamp)}`,
      `Kasir     : ${transaction.cashierName}`,
      `Pelanggan : ${transaction.customerName}`,
      `Pesanan   : ${transaction.orderType} ${transaction.tableNumber ? `(${transaction.tableNumber})` : ''}`,
      '--------------------------------',
      ...transaction.items.map(
        (i) => `${i.productName} x${i.quantity} : ${formatRupiah(i.totalPrice)}`
      ),
      '--------------------------------',
      `Subtotal  : ${formatRupiah(transaction.subtotal)}`,
      transaction.discount > 0 ? `Diskon    : -${formatRupiah(transaction.discount)}` : null,
      transaction.tax > 0 ? `PB1 10%   : ${formatRupiah(transaction.tax)}` : null,
      `TOTAL     : ${formatRupiah(transaction.totalAmount)}`,
      `Metode    : ${transaction.paymentMethod}`,
      `Bayar     : ${formatRupiah(transaction.amountPaid)}`,
      `Kembalian : ${formatRupiah(transaction.change)}`,
      '================================',
      'Terima Kasih! Semangat Harimu',
      ` Bersama ${branding.storeName} `,
      '================================',
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-sm my-auto">
        {/* Actions above the thermal receipt */}
        <div className="flex items-center justify-between mb-3 text-white">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle className="w-4 h-4" />
            <span>Transaksi Sukses</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#6F4534]/20 text-xs flex items-center gap-1 text-[#4A2C20] hover:bg-[#F7F2EA]"
              title="Salin teks struk"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Tersalin!' : 'Salin'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-[#C8894A] hover:bg-[#b3753b] text-xs flex items-center gap-1 font-bold text-white shadow-xs"
              title="Cetak Struk"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#6F4534]/20 text-[#6F4534] hover:text-[#4A2C20]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal paper look */}
        <div
          ref={receiptRef}
          className="receipt-container bg-[#FFFDF9] text-[#4A2C20] font-mono text-[11px] p-6 rounded-lg shadow-2xl border-t-8 border-[#C8894A] relative overflow-hidden"
        >
          {/* Jagged / zig-zag thermal edge simulation */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C8894A]/20 to-transparent" />

          {/* Shop Header */}
          <div className="text-center pb-3 border-b border-dashed border-[#6F4534]/20">
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
              <span className="font-serif text-sm tracking-wider uppercase">
                {branding.storeName}
              </span>
            </div>
            <p className="text-[10px] text-[#6F4534]">
              {branding.address || 'Jl. Kafein Boulevard No. 18, Jakarta'}
            </p>
            <p className="text-[10px] text-[#6F4534]/80">
              Instagram: {branding.instagram || '@efekkafein.id'}
            </p>
          </div>

          {/* Metadata */}
          <div className="py-2.5 border-b border-dashed border-[#6F4534]/20 space-y-1 text-[#6F4534] text-[10px]">
            <div className="flex justify-between">
              <span>No. Struk</span>
              <span className="font-bold text-[#4A2C20]">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu</span>
              <span>{formatDateTime(transaction.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir</span>
              <span>{transaction.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan</span>
              <span className="font-semibold">{transaction.customerName || 'Tamu'}</span>
            </div>
            <div className="flex justify-between">
              <span>Layanan</span>
              <span className="font-bold bg-[#F7F2EA] px-1 rounded text-[#4A2C20]">
                {transaction.orderType} {transaction.tableNumber ? `• ${transaction.tableNumber}` : ''}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className="py-2.5 border-b border-dashed border-[#6F4534]/20 space-y-2">
            {transaction.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold text-[#4A2C20] leading-snug">
                    {item.productName}
                  </span>
                  <span className="font-bold text-[#4A2C20] shrink-0 ml-2">
                    {formatRupiah(item.totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-[#6F4534]">
                  <span>
                    {item.quantity} x {formatRupiah(item.price)}
                    {item.customization?.temperature && ` • ${item.customization.temperature}`}
                    {item.customization?.sugarLevel && ` • Gula ${item.customization.sugarLevel}`}
                    {item.customization?.milkOption?.includes('Oat') && ' • Oatmilk'}
                    {item.customization?.extraShot && ' • Extra Shot'}
                  </span>
                </div>
                {item.customization?.notes && (
                  <p className="text-[9px] text-[#6F4534] italic">
                    Catatan: {item.customization.notes}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Totals & Calculations */}
          <div className="py-2.5 border-b border-dashed border-[#6F4534]/20 space-y-1 text-[11px]">
            <div className="flex justify-between text-[#6F4534]">
              <span>Subtotal</span>
              <span>{formatRupiah(transaction.subtotal)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Diskon {transaction.discountName ? `(${transaction.discountName})` : ''}</span>
                <span>-{formatRupiah(transaction.discount)}</span>
              </div>
            )}
            {transaction.tax > 0 && (
              <div className="flex justify-between text-[#6F4534]">
                <span>Pajak Restoran (PB1 10%)</span>
                <span>{formatRupiah(transaction.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-[#4A2C20] pt-1 border-t border-[#6F4534]/20">
              <span>TOTAL</span>
              <span>{formatRupiah(transaction.totalAmount)}</span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="py-2.5 border-b border-dashed border-[#6F4534]/20 space-y-1 text-[10px] text-[#6F4534]">
            <div className="flex justify-between">
              <span>Metode Pembayaran</span>
              <span className="font-bold text-[#4A2C20]">{transaction.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Nominal Bayar</span>
              <span>{formatRupiah(transaction.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold text-[#4A2C20]">
              <span>Kembalian</span>
              <span>{formatRupiah(transaction.change)}</span>
            </div>
          </div>

          {/* Barcode & Footer Greeting */}
          <div className="pt-4 text-center space-y-2">
            <div className="flex flex-col items-center">
              <div className="h-8 flex items-center justify-center gap-[2px] opacity-70">
                {/* Simulated thermal barcode */}
                {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 2, 1].map((w, i) => (
                  <span
                    key={i}
                    className="h-7 bg-[#4A2C20]"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
              <span className="text-[9px] text-[#6F4534] tracking-widest mt-0.5">{transaction.id}</span>
            </div>

            <p className="text-[10px] text-[#4A2C20] font-medium">
              Terima Kasih atas kunjungan Anda!
            </p>
            <p className="text-[9px] text-[#6F4534]">
              Efek Kafein: Boost Semangat Karyamu Setiap Hari ☕
            </p>
          </div>
        </div>

        {/* Close button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#4A2C20] hover:bg-[#6F4534] text-white text-xs font-semibold transition-colors shadow-md"
          >
            Tutup & Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
};
