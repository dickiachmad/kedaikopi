import React, { useState } from 'react';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { PaymentMethod } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface PaymentModalProps {
  totalAmount: number;
  onClose: () => void;
  onProcessPayment: (method: PaymentMethod, paid: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  totalAmount,
  onClose,
  onProcessPayment,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('TUNAI');
  const [paidInput, setPaidInput] = useState<string>(totalAmount.toString());
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [qrisVerified, setQrisVerified] = useState(false);

  const amountPaid = parseFloat(paidInput) || 0;
  const change = Math.max(0, amountPaid - totalAmount);

  const handleQuickCash = (amount: number) => {
    setPaidInput(amount.toString());
    setErrorMessage('');
  };

  const handleConfirm = () => {
    if (method === 'TUNAI' && amountPaid < totalAmount) {
      setErrorMessage(`Uang pembayaran kurang ${formatRupiah(totalAmount - amountPaid)}`);
      return;
    }

    const finalPaid = method === 'TUNAI' ? amountPaid : totalAmount;
    onProcessPayment(method, finalPaid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#FFFDF9] border border-[#6F4534]/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-[#4A2C20]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#6F4534]/15 bg-[#F7F2EA]">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#4A2C20]">Pembayaran Kasir</h3>
            <p className="text-xs text-[#6F4534]">Pilih metode dan selesaikan transaksi</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#6F4534]/20 text-[#6F4534] hover:text-[#4A2C20] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Total Banner */}
        <div className="p-5 bg-gradient-to-r from-[#4A2C20] via-[#6F4534] to-[#4A2C20] text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#E5B567]">
              Total Tagihan
            </span>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-[#FFFDF9] mt-0.5">
              {formatRupiah(totalAmount)}
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#C8894A]/30 text-[#FFFDF9] border border-[#E5B567]/50 font-medium">
            Siap Bayar
          </span>
        </div>

        {/* Payment Method Tabs */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#6F4534] block mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod('TUNAI');
                  setPaidInput(totalAmount.toString());
                  setErrorMessage('');
                }}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'TUNAI'
                    ? 'bg-[#C8894A] text-white border-[#C8894A] shadow-md'
                    : 'bg-[#F7F2EA] border-[#6F4534]/20 text-[#6F4534] hover:bg-[#6F4534]/10 hover:text-[#4A2C20]'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-xs font-bold">Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('QRIS');
                  setPaidInput(totalAmount.toString());
                  setErrorMessage('');
                }}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'QRIS'
                    ? 'bg-[#C8894A] text-white border-[#C8894A] shadow-md'
                    : 'bg-[#F7F2EA] border-[#6F4534]/20 text-[#6F4534] hover:bg-[#6F4534]/10 hover:text-[#4A2C20]'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-bold">QRIS Instant</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('DEBIT');
                  setPaidInput(totalAmount.toString());
                  setErrorMessage('');
                }}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'DEBIT'
                    ? 'bg-[#C8894A] text-white border-[#C8894A] shadow-md'
                    : 'bg-[#F7F2EA] border-[#6F4534]/20 text-[#6F4534] hover:bg-[#6F4534]/10 hover:text-[#4A2C20]'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-bold">Debit / EDC</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('TRANSFER');
                  setPaidInput(totalAmount.toString());
                  setErrorMessage('');
                }}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  method === 'TRANSFER'
                    ? 'bg-[#C8894A] text-white border-[#C8894A] shadow-md'
                    : 'bg-[#F7F2EA] border-[#6F4534]/20 text-[#6F4534] hover:bg-[#6F4534]/10 hover:text-[#4A2C20]'
                }`}
              >
                <Building2 className="w-5 h-5" />
                <span className="text-xs font-bold">Transfer / VA</span>
              </button>
            </div>
          </div>

          {/* Conditional Content based on method */}
          {method === 'TUNAI' && (
            <div className="space-y-3 bg-[#F7F2EA] p-4 rounded-xl border border-[#6F4534]/20">
              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">
                  Uang Diterima dari Pelanggan
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-[#6F4534]/70 font-mono font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={paidInput}
                    onChange={(e) => {
                      setPaidInput(e.target.value);
                      setErrorMessage('');
                    }}
                    className="w-full bg-[#FFFDF9] border border-[#6F4534]/25 rounded-xl pl-10 pr-3 py-2 text-base font-mono font-bold text-[#4A2C20] focus:outline-none focus:border-[#C8894A]"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="space-y-1">
                <span className="text-[11px] text-[#6F4534]">Pilihan Cepat:</span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickCash(totalAmount)}
                    className="py-1.5 px-2 bg-[#C8894A] hover:bg-[#b3753b] text-xs font-semibold rounded-lg text-white shadow-xs"
                  >
                    Uang Pas
                  </button>
                  {totalAmount <= 50000 && (
                    <button
                      type="button"
                      onClick={() => handleQuickCash(50000)}
                      className="py-1.5 px-2 bg-[#FFFDF9] hover:bg-[#F7F2EA] text-xs font-semibold rounded-lg text-[#4A2C20] border border-[#6F4534]/25"
                    >
                      50.000
                    </button>
                  )}
                  {totalAmount <= 100000 && (
                    <button
                      type="button"
                      onClick={() => handleQuickCash(100000)}
                      className="py-1.5 px-2 bg-[#FFFDF9] hover:bg-[#F7F2EA] text-xs font-semibold rounded-lg text-[#4A2C20] border border-[#6F4534]/25"
                    >
                      100.000
                    </button>
                  )}
                  {totalAmount <= 200000 && (
                    <button
                      type="button"
                      onClick={() => handleQuickCash(200000)}
                      className="py-1.5 px-2 bg-[#FFFDF9] hover:bg-[#F7F2EA] text-xs font-semibold rounded-lg text-[#4A2C20] border border-[#6F4534]/25"
                    >
                      200.000
                    </button>
                  )}
                </div>
              </div>

              {/* Change Calculation Box */}
              <div className="pt-2 border-t border-[#6F4534]/15 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#6F4534]">Uang Kembalian:</span>
                  <p
                    className={`text-lg font-bold font-mono ${
                      amountPaid < totalAmount ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {amountPaid < totalAmount ? 'Nominal Kurang' : formatRupiah(change)}
                  </p>
                </div>
                {amountPaid >= totalAmount && (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Siap Diserahkan
                  </span>
                )}
              </div>
            </div>
          )}

          {method === 'QRIS' && (
            <div className="bg-[#F7F2EA] p-4 rounded-xl border border-[#6F4534]/20 flex flex-col items-center text-center">
              <div className="bg-white p-3 rounded-2xl shadow-md border border-stone-200 w-44 h-44 flex flex-col items-center justify-center">
                {/* Visual authentic QRIS simulation with QR matrix */}
                <div className="w-full flex items-center justify-between px-1 mb-1">
                  <span className="text-[9px] font-bold text-red-600 tracking-wider">QRIS</span>
                  <span className="text-[8px] font-bold text-stone-700">NMID: ID10294829</span>
                </div>
                <div className="w-32 h-32 bg-stone-900 rounded-lg p-2 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-2 border-white rounded-xs flex items-center justify-center">
                      <div className="w-3 h-3 bg-white" />
                    </div>
                    <div className="w-6 h-6 border-2 border-white rounded-xs flex items-center justify-center">
                      <div className="w-3 h-3 bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center text-[#C8894A]">
                    <QrCode className="w-8 h-8 text-[#E5B567] animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-6 h-6 border-2 border-white rounded-xs flex items-center justify-center">
                      <div className="w-3 h-3 bg-white" />
                    </div>
                    <div className="w-6 h-6 border-2 border-white rounded-xs flex items-center justify-center">
                      <div className="w-2 h-2 bg-white" />
                    </div>
                  </div>
                </div>
              </div>

              <p className="font-semibold text-xs text-[#4A2C20] mt-3">
                KEDAI KOPI EFEK KAFEIN
              </p>
              <p className="text-[11px] text-[#6F4534]">
                Scan dengan GoPay, OVO, Dana, BCA Mobile, Livin', ShopeePay
              </p>

              <button
                type="button"
                onClick={() => setQrisVerified(true)}
                className={`mt-3 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  qrisVerified
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-[#C8894A]/20 text-[#4A2C20] border-[#C8894A]/40 hover:bg-[#C8894A]/30'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{qrisVerified ? 'Pembayaran QRIS Terverifikasi' : 'Simulasi Pembayaran Berhasil'}</span>
              </button>
            </div>
          )}

          {method === 'DEBIT' && (
            <div className="bg-[#F7F2EA] p-4 rounded-xl border border-[#6F4534]/20 space-y-3">
              <label className="text-xs font-semibold text-[#6F4534] block">Pilih Mesin EDC / Kartu Bank</label>
              <div className="grid grid-cols-4 gap-2">
                {['BCA', 'Mandiri', 'BRI', 'BNI'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    className="py-2 px-1 rounded-lg bg-[#FFFDF9] hover:bg-[#C8894A]/10 text-xs font-bold text-[#4A2C20] border border-[#6F4534]/20 text-center"
                  >
                    {bank}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="4 Digit Terakhir Kartu (Opsional)"
                maxLength={4}
                className="w-full bg-[#FFFDF9] border border-[#6F4534]/25 rounded-xl px-3 py-2 text-xs text-[#4A2C20] placeholder-[#6F4534]/60 focus:outline-none focus:border-[#C8894A]"
              />
            </div>
          )}

          {method === 'TRANSFER' && (
            <div className="bg-[#F7F2EA] p-4 rounded-xl border border-[#6F4534]/20 space-y-2 text-xs">
              <p className="text-[#6F4534]">Transfer ke Rekening Resmi Kedai Kopi Efek Kafein:</p>
              <div className="p-3 bg-[#FFFDF9] rounded-lg border border-[#6F4534]/20 flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#4A2C20] block">Bank Central Asia (BCA)</span>
                  <span className="font-mono text-[#C8894A] text-sm font-bold">8830-1928-3341</span>
                  <p className="text-[10px] text-[#6F4534]">a.n. PT EFEK KAFEIN NUSANTARA</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message if any */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#F7F2EA] border-t border-[#6F4534]/15 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#FFFDF9] hover:bg-[#F7F2EA] border border-[#6F4534]/20 text-[#6F4534] hover:text-[#4A2C20] text-xs font-semibold transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="py-2.5 px-6 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#C8894A]/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Selesaikan Transaksi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
