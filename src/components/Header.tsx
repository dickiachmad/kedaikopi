import React, { useState, useEffect } from 'react';
import {
  Coffee,
  ShoppingBag,
  Package,
  BarChart3,
  AlertTriangle,
  Clock,
  User,
  RotateCcw,
  Sparkles,
  X,
  Lock,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';
import { BrandLogo } from './Common/BrandLogo';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    cartItemCount,
    lowStockItems,
    cashierName,
    setCashierName,
    resetToSampleData,
    transactions,
    isAdminLoggedIn,
    adminUser,
    logoutAdmin,
    branding,
    dbSyncStatus,
  } = useCoffee();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isEditingCashier, setIsEditingCashier] = useState(false);
  const [tempCashier, setTempCashier] = useState(cashierName);

  // Live real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTransactionsCount = transactions.filter(
    (t) => t.timestamp.startsWith(todayStr) && t.status === 'COMPLETED'
  ).length;

  return (
    <>
      <header className="bg-[#4A2C20] border-b border-[#6F4534] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <BrandLogo
                branding={branding}
                className="w-9 h-9 sm:w-11 sm:h-11 shrink-0"
                iconClassName="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-[#FFFDF9] truncate">
                    {branding.storeName}
                  </span>
                  <span className="hidden xl:inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#C8894A]/25 text-[#E5B567] border border-[#E5B567]/40">
                    POS & Stok
                  </span>
                </div>
                <p className="text-[11px] text-[#E5B567]/80 truncate hidden md:block">
                  {branding.tagline}
                </p>
              </div>
            </div>

            {/* Center Navigation Tabs (Desktop / Tablet) */}
            <nav className="hidden md:flex items-center p-1 bg-[#351F16] rounded-xl border border-[#6F4534] shadow-inner">
              <button
                id="tab-pos-button"
                type="button"
                onClick={() => setActiveTab('pos')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                  activeTab === 'pos'
                    ? 'bg-[#C8894A] text-white shadow-sm font-bold'
                    : 'text-[#E5B567]/80 hover:text-white hover:bg-[#4A2C20]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Kasir POS</span>
                {cartItemCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {cartItemCount}
                  </span>
                )}
              </button>

              <button
                id="tab-inventory-button"
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                  activeTab === 'inventory'
                    ? 'bg-[#C8894A] text-white shadow-sm font-bold'
                    : 'text-[#E5B567]/80 hover:text-white hover:bg-[#4A2C20]'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Kelola Stok</span>
                {!isAdminLoggedIn && (
                  <Lock className="w-3 h-3 text-[#E5B567]/60" />
                )}
                {lowStockItems.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[#E5B567] animate-ping absolute top-2 right-2" />
                )}
              </button>

              <button
                id="tab-reports-button"
                type="button"
                onClick={() => setActiveTab('reports')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'reports'
                    ? 'bg-[#C8894A] text-white shadow-sm font-bold'
                    : 'text-[#E5B567]/80 hover:text-white hover:bg-[#4A2C20]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Laporan</span>
                {!isAdminLoggedIn && (
                  <Lock className="w-3 h-3 text-[#E5B567]/60" />
                )}
                {todayTransactionsCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#2B1912] text-[#E5B567] font-mono font-bold border border-[#6F4534]">
                    {todayTransactionsCount}
                  </span>
                )}
              </button>
            </nav>

            {/* Right Controls: Live Clock, Status, Cashier, Admin */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              {/* Live Clock (Desktop) */}
              <div className="hidden lg:flex flex-col items-end text-right border-r border-[#6F4534]/80 pr-3">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#E5B567] tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-[#C8894A]" />
                  <span>{currentTime || '00:00:00'}</span>
                </div>
                <span className="text-[10px] text-[#E5B567]/75 font-medium">{currentDate}</span>
              </div>

              {/* Cloud Real-time Status Badge */}
              <div
                title={
                  dbSyncStatus === 'connected'
                    ? 'Database Cloud Terhubung Real-Time (Firestore)'
                    : dbSyncStatus === 'syncing'
                    ? 'Menyinkronkan ke Database Cloud...'
                    : 'Mode Offline'
                }
                className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#351F16] border border-[#6F4534] text-[11px] text-[#E5B567] shadow-xs"
              >
                <span
                  className={`w-2 h-2 rounded-full transition-all shrink-0 ${
                    dbSyncStatus === 'connected'
                      ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse'
                      : dbSyncStatus === 'syncing'
                      ? 'bg-amber-400 animate-spin'
                      : 'bg-stone-500'
                  }`}
                />
                <span className="font-semibold tracking-wide hidden sm:inline">
                  {dbSyncStatus === 'connected'
                    ? 'Cloud Live'
                    : dbSyncStatus === 'syncing'
                    ? 'Syncing'
                    : 'Offline'}
                </span>
              </div>

              {/* Low stock alert badge */}
              {lowStockItems.length > 0 && (
                <button
                  id="alert-low-stock-btn"
                  type="button"
                  onClick={() => setShowAlertModal(true)}
                  title={`${lowStockItems.length} bahan/produk stok menipis!`}
                  className="relative p-2 rounded-xl bg-[#E5B567]/20 border border-[#E5B567]/50 text-[#E5B567] hover:bg-[#E5B567]/30 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-[#E5B567]" />
                  <span className="absolute -top-1 -right-1 bg-[#E5B567] text-[#4A2C20] font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {lowStockItems.length}
                  </span>
                </button>
              )}

              {/* Cashier pill */}
              <div className="relative">
                {isEditingCashier ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (tempCashier.trim()) {
                        setCashierName(tempCashier.trim());
                        setIsEditingCashier(false);
                      }
                    }}
                    className="flex items-center gap-1 bg-[#351F16] p-1 rounded-xl border border-[#C8894A]"
                  >
                    <input
                      type="text"
                      value={tempCashier}
                      onChange={(e) => setTempCashier(e.target.value)}
                      className="bg-transparent text-xs text-[#FFFDF9] px-2 py-1 outline-none w-24 font-medium"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-[#C8894A] hover:bg-[#b3753b] text-white text-[10px] font-bold px-2 py-1 rounded-lg transition-colors"
                    >
                      OK
                    </button>
                  </form>
                ) : (
                  <button
                    id="cashier-profile-button"
                    type="button"
                    onClick={() => setIsEditingCashier(true)}
                    title="Klik untuk ubah nama kasir"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#351F16] border border-[#6F4534] hover:border-[#C8894A] transition-colors shadow-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#C8894A]/25 text-[#E5B567] flex items-center justify-center text-xs font-bold">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-[9px] text-[#E5B567]/75 leading-none">Kasir Aktif</p>
                      <p className="text-xs font-semibold text-[#FFFDF9] truncate max-w-[90px] leading-snug">
                        {cashierName}
                      </p>
                    </div>
                  </button>
                )}
              </div>

              {/* Admin Portal Button */}
              <button
                id="header-admin-portal-btn"
                type="button"
                onClick={() => setActiveTab('admin-login')}
                title={isAdminLoggedIn ? `Admin: ${adminUser?.name}` : 'Portal Admin'}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
                  activeTab === 'admin-login'
                    ? 'bg-[#C8894A] text-white border-[#C8894A]'
                    : isAdminLoggedIn
                    ? 'bg-[#C8894A]/25 text-[#E5B567] border-[#E5B567]/50 hover:bg-[#C8894A]/40'
                    : 'bg-[#351F16] text-[#E5B567] border-[#6F4534] hover:border-[#C8894A] hover:text-white'
                }`}
              >
                {isAdminLoggedIn ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-[#E5B567]" />
                    <span className="hidden sm:inline">Admin</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#E5B567]" />
                    <span className="hidden sm:inline">Admin</span>
                  </>
                )}
              </button>

              {/* Logout button */}
              <button
                id="header-logout-btn"
                type="button"
                onClick={logoutAdmin}
                title="Keluar dari sistem (Logout)"
                className="flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-red-950/40 text-red-300 hover:text-white hover:bg-red-900/60 border border-red-800/40 text-xs font-medium transition-colors shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Keluar</span>
              </button>

              {/* Reset sample button */}
              <button
                id="reset-sample-btn"
                type="button"
                onClick={resetToSampleData}
                title="Reset data demo ke awal"
                className="p-2 rounded-xl text-[#E5B567]/70 hover:text-white hover:bg-[#6F4534]/50 border border-transparent hover:border-[#6F4534] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Tab Bar (Below header on mobile screens) */}
        <div className="md:hidden bg-[#351F16] border-t border-[#6F4534] px-2 py-1.5 flex items-center justify-around">
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold relative transition-all ${
              activeTab === 'pos'
                ? 'bg-[#C8894A] text-white shadow-xs'
                : 'text-[#E5B567]/80 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Kasir</span>
            {cartItemCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold relative transition-all ${
              activeTab === 'inventory'
                ? 'bg-[#C8894A] text-white shadow-xs'
                : 'text-[#E5B567]/80 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Stok</span>
            {!isAdminLoggedIn && <Lock className="w-2.5 h-2.5 text-[#E5B567]/60" />}
            {lowStockItems.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#E5B567] absolute top-1 right-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold relative transition-all ${
              activeTab === 'reports'
                ? 'bg-[#C8894A] text-white shadow-xs'
                : 'text-[#E5B567]/80 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Laporan</span>
            {!isAdminLoggedIn && <Lock className="w-2.5 h-2.5 text-[#E5B567]/60" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin-login')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold relative transition-all ${
              activeTab === 'admin-login'
                ? 'bg-[#C8894A] text-white shadow-xs'
                : 'text-[#E5B567]/80 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </header>

      {/* Low Stock Warning Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4A2C20]/70 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF9] border border-[#6F4534]/20 rounded-2xl w-full max-w-md shadow-2xl p-6 text-[#4A2C20]">
            <div className="flex items-start justify-between pb-3 border-b border-[#6F4534]/15">
              <div className="flex items-center gap-2 text-[#C8894A]">
                <AlertTriangle className="w-5 h-5 text-[#C8894A]" />
                <h3 className="font-serif font-bold text-base text-[#4A2C20]">Peringatan Stok Menipis!</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="text-[#6F4534] hover:text-[#4A2C20] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#6F4534] mt-3 mb-4">
              Item berikut telah mencapai atau berada di bawah batas minimum stok. Segera lakukan
              restock agar proses operasional kedai kopi tidak terganggu.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F7F2EA] border border-[#6F4534]/15"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#4A2C20]">{item.name}</p>
                    <span className="text-[10px] text-[#C8894A] font-medium">
                      {item.type === 'product' ? 'Produk Menu' : 'Bahan Baku'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-red-600">
                      {item.current} {item.unit}
                    </span>
                    <p className="text-[10px] text-[#6F4534]">Min: {item.min}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAlertModal(false);
                  setActiveTab('inventory');
                }}
                className="w-full py-2.5 rounded-xl bg-[#C8894A] hover:bg-[#6F4534] text-white text-xs font-bold transition-colors shadow-sm"
              >
                Buka Kelola Stok Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
