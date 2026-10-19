import React, { useState } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  AlertCircle,
  LogOut,
  Package,
  BarChart3,
  ShoppingBag,
  Coffee,
  Users,
  Settings,
  Palette,
  Database,
  FileDown,
} from 'lucide-react';
import { useCoffee } from '../../context/CoffeeContext';
import { formatDateTime } from '../../utils/formatters';
import { CashierAccountManager } from './CashierAccountManager';
import { BrandingSettingsManager } from './BrandingSettingsManager';
import { DatabaseSqlManager } from './DatabaseSqlManager';
import { generateUserGuidePdf } from '../../utils/pdfManualGenerator';
import { BrandLogo } from '../Common/BrandLogo';

interface AdminLoginViewProps {
  redirectTo?: 'inventory' | 'reports';
  message?: string;
  isEntryGate?: boolean;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  redirectTo,
  message,
  isEntryGate = false,
}) => {
  const {
    isLoggedIn,
    isAdminLoggedIn,
    adminUser,
    loginAdmin,
    loginCashier,
    logoutAdmin,
    setActiveTab,
    cashierAccounts,
    branding,
  } = useCoffee();

  const [activeMode, setActiveMode] = useState<'admin' | 'cashier'>('admin');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [cashierUsername, setCashierUsername] = useState('');
  const [cashierPin, setCashierPin] = useState('');
  const [showCashierPin, setShowCashierPin] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Sub-tab inside authenticated Admin Portal
  const [adminPortalTab, setAdminPortalTab] = useState<'cashiers' | 'branding' | 'menu' | 'database'>('branding');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = loginAdmin(adminUsername, adminPassword);
    if (result.success) {
      if (redirectTo) {
        setActiveTab(redirectTo);
      } else {
        setActiveTab('pos');
      }
    } else {
      setError(result.error || 'Autentikasi admin gagal. Periksa kembali username dan kata sandi.');
    }
  };

  const handleCashierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = loginCashier(cashierUsername, cashierPin);
    if (result.success) {
      setActiveTab('pos');
    } else {
      setError(result.error || 'Login kasir gagal. Periksa kembali username dan PIN.');
    }
  };

  // If already logged in and not an elevation prompt, show authenticated management portal
  if (isLoggedIn && adminUser && !redirectTo && !isEntryGate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-3xl p-6 sm:p-8 shadow-xl text-[#4A2C20]">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#6F4534]/15">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-[#4A2C20] text-[#E5B567] flex items-center justify-center shadow-md shrink-0">
                {isAdminLoggedIn ? (
                  <ShieldCheck className="w-8 h-8" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="font-serif text-xl font-bold text-[#4A2C20]">
                    {isAdminLoggedIn ? 'Pengaturan Dashboard Admin' : 'Sesi Kasir Aktif'}
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Online
                  </span>
                </div>
                <p className="text-xs text-[#6F4534] mt-0.5">
                  {isAdminLoggedIn
                    ? 'Kelola akun kasir, kontrol stok, resep, dan laporan omzet kedai'
                    : 'Masuk dalam mode operasional kasir POS'}
                </p>
              </div>
            </div>

            <button
              id="admin-logout-btn"
              type="button"
              onClick={logoutAdmin}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Sistem</span>
            </button>
          </div>

          {/* User Profile Details */}
          <div className="mt-6 p-4 rounded-2xl bg-[#F7F2EA] border border-[#6F4534]/15 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-[11px] text-[#6F4534] block font-medium">Pengguna Aktif</span>
              <span className="font-bold text-[#4A2C20] text-sm">{adminUser.name}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#6F4534] block font-medium">Hak Akses</span>
              <span className="font-semibold text-[#C8894A]">{adminUser.role}</span>
            </div>
            <div>
              <span className="text-[11px] text-[#6F4534] block font-medium">Waktu Masuk</span>
              <span className="font-mono text-[#4A2C20]">
                {formatDateTime(adminUser.loginTime)}
              </span>
            </div>
          </div>

          {/* Admin Navigation Sub-tabs */}
          {isAdminLoggedIn ? (
            <div className="mt-8 space-y-6">
              <div className="flex border-b border-[#6F4534]/15 gap-2 overflow-x-auto pb-0.5">
                <button
                  type="button"
                  onClick={() => setAdminPortalTab('branding')}
                  className={`flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold border-b-2 transition-colors shrink-0 ${
                    adminPortalTab === 'branding'
                      ? 'border-[#C8894A] text-[#4A2C20]'
                      : 'border-transparent text-[#6F4534]/70 hover:text-[#4A2C20]'
                  }`}
                >
                  <Palette className="w-4 h-4 text-[#C8894A]" />
                  <span>Logo & Title Bar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminPortalTab('cashiers')}
                  className={`flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold border-b-2 transition-colors shrink-0 ${
                    adminPortalTab === 'cashiers'
                      ? 'border-[#C8894A] text-[#4A2C20]'
                      : 'border-transparent text-[#6F4534]/70 hover:text-[#4A2C20]'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#C8894A]" />
                  <span>Pengaturan & Akun Kasir</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C8894A]/15 text-[#C8894A] font-sans font-bold">
                    {cashierAccounts.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminPortalTab('menu')}
                  className={`flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold border-b-2 transition-colors shrink-0 ${
                    adminPortalTab === 'menu'
                      ? 'border-[#C8894A] text-[#4A2C20]'
                      : 'border-transparent text-[#6F4534]/70 hover:text-[#4A2C20]'
                  }`}
                >
                  <Settings className="w-4 h-4 text-[#C8894A]" />
                  <span>Menu & Operasional Kedai</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminPortalTab('database')}
                  className={`flex items-center gap-2 pb-3 px-4 font-serif text-sm font-bold border-b-2 transition-colors shrink-0 ${
                    adminPortalTab === 'database'
                      ? 'border-[#C8894A] text-[#4A2C20]'
                      : 'border-transparent text-[#6F4534]/70 hover:text-[#4A2C20]'
                  }`}
                >
                  <Database className="w-4 h-4 text-[#C8894A]" />
                  <span>Database MySQL</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-sans font-bold">
                    .SQL
                  </span>
                </button>
              </div>

              {/* Tab 1: Branding & Title Bar */}
              {adminPortalTab === 'branding' && (
                <div className="pt-1">
                  <BrandingSettingsManager />
                </div>
              )}

              {/* Tab 2: Cashier Management */}
              {adminPortalTab === 'cashiers' && (
                <div className="pt-1">
                  <CashierAccountManager />
                </div>
              )}

              {/* Tab 2: System Navigation Links */}
              {adminPortalTab === 'menu' && (
                <div className="space-y-4 pt-1">
                  <h3 className="font-serif text-sm font-bold text-[#4A2C20]">
                    Pintasan Modul Operasional:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('pos')}
                      className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 hover:border-[#C8894A] hover:shadow-md transition-all text-left flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <ShoppingBag className="w-5 h-5 text-[#C8894A] group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Siap
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#4A2C20]">Kasir POS</h4>
                        <p className="text-[11px] text-[#6F4534] mt-0.5">
                          Pemesanan, diskon & cetak struk
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('inventory')}
                      className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 hover:border-[#C8894A] hover:shadow-md transition-all text-left flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Package className="w-5 h-5 text-[#C8894A] group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-[#C8894A] bg-[#C8894A]/10 px-1.5 py-0.5 rounded border border-[#C8894A]/30">
                          Akses Penuh
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#4A2C20]">Kelola Stok</h4>
                        <p className="text-[11px] text-[#6F4534] mt-0.5">
                          Resep, bahan baku & mutasi stok
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('reports')}
                      className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 hover:border-[#C8894A] hover:shadow-md transition-all text-left flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-5 h-5 text-[#C8894A] group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-[#C8894A] bg-[#C8894A]/10 px-1.5 py-0.5 rounded border border-[#C8894A]/30">
                          Keuangan
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#4A2C20]">Laporan Omzet</h4>
                        <p className="text-[11px] text-[#6F4534] mt-0.5">
                          Laba bersih, HPP & riwayat nota
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminPortalTab('database')}
                      className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 hover:border-[#C8894A] hover:shadow-md transition-all text-left flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Database className="w-5 h-5 text-[#C8894A] group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          MySQL .SQL
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#4A2C20]">Database SQL</h4>
                        <p className="text-[11px] text-[#6F4534] mt-0.5">
                          Unduh skrip .SQL & panduan phpMyAdmin
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        generateUserGuidePdf({
                          storeName: branding.storeName,
                          tagline: branding.tagline,
                          address: branding.address,
                          instagram: branding.instagram,
                        });
                      }}
                      className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 hover:border-[#C8894A] hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <FileDown className="w-5 h-5 text-[#C8894A] group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                          Format PDF
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#4A2C20]">Buku Panduan PDF</h4>
                        <p className="text-[11px] text-[#6F4534] mt-0.5">
                          Unduh manual lengkap 5 halaman untuk barista
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 4: Database MySQL */}
              {adminPortalTab === 'database' && (
                <div className="pt-1">
                  <DatabaseSqlManager />
                </div>
              )}
            </div>
          ) : (
            /* Cashier simple links */
            <div className="mt-8 space-y-3">
              <h3 className="font-serif text-sm font-bold text-[#4A2C20]">Sesi Kerja Kasir:</h3>
              <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#4A2C20]">Kasir POS Aktif</h4>
                  <p className="text-xs text-[#6F4534] mt-0.5">
                    Silakan lanjut melayani transaksi pemesanan kopi pelanggan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('pos')}
                  className="px-4 py-2 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold transition-colors"
                >
                  Buka Kasir POS
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-[#6F4534]/15 flex items-center justify-between text-xs text-[#6F4534]">
            <button
              type="button"
              onClick={() => setActiveTab('pos')}
              className="flex items-center gap-1.5 text-[#C8894A] font-semibold hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Kasir POS</span>
            </button>
            <span>Kedai Kopi Efek Kafein • Sistem Operasional</span>
          </div>
        </div>
      </div>
    );
  }

  // Login Form (Entry Gate or Elevation Prompt)
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isEntryGate ? 'bg-[#F7F2EA]' : 'py-8'}`}>
      <div className="w-full max-w-md bg-[#FFFDF9] border border-[#6F4534]/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-[#4A2C20]">
        {/* Brand Header */}
        <div className="text-center pb-6 border-b border-[#6F4534]/15">
          <div className="flex justify-center mb-3">
            <BrandLogo
              branding={branding}
              className="w-16 h-16"
              iconClassName="w-8 h-8 stroke-[2]"
            />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#C8894A] block mb-1">
            {branding.storeName}
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#4A2C20]">
            {isEntryGate ? 'Masuk ke Sistem' : 'Autentikasi Akses'}
          </h2>
          <p className="text-xs text-[#6F4534] mt-1">
            {message || 'Silakan autentikasi untuk mengakses operasional kedai kopi'}
          </p>
        </div>

        {/* Mode Selector (Admin vs Cashier) */}
        {isEntryGate && (
          <div className="mt-5 grid grid-cols-2 p-1 rounded-xl bg-[#F7F2EA] border border-[#6F4534]/15 gap-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveMode('admin');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'admin'
                  ? 'bg-[#4A2C20] text-[#E5B567] shadow-sm'
                  : 'text-[#6F4534] hover:text-[#4A2C20]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin / Manajer</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveMode('cashier');
                setError(null);
              }}
              className={`py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'cashier'
                  ? 'bg-[#4A2C20] text-[#E5B567] shadow-sm'
                  : 'text-[#6F4534] hover:text-[#4A2C20]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Kasir (POS)</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Admin Login Form */}
        {activeMode === 'admin' ? (
          <form onSubmit={handleAdminSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-[#6F4534] block mb-1.5" htmlFor="admin-username">
                Username / ID Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6F4534]/60 absolute left-3.5 top-3" />
                <input
                  id="admin-username"
                  type="text"
                  required
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="admin atau owner"
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#4A2C20] placeholder-[#6F4534]/60 focus:outline-none focus:border-[#C8894A] transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6F4534] block mb-1.5" htmlFor="admin-password">
                Kata Sandi Admin
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#6F4534]/60 absolute left-3.5 top-3" />
                <input
                  id="admin-password"
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#4A2C20] placeholder-[#6F4534]/60 focus:outline-none focus:border-[#C8894A] transition-colors font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-2.5 text-[#6F4534]/60 hover:text-[#4A2C20] transition-colors"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-[#6F4534] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-[#C8894A]"
                />
                <span>Ingat sesi masuk</span>
              </label>
            </div>

            <button
              id="btn-admin-login-submit"
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#C8894A]/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk sebagai Admin</span>
            </button>
          </form>
        ) : (
          /* Cashier Login Form (Controlled by Admin) */
          <form onSubmit={handleCashierSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-[#6F4534] block mb-1.5" htmlFor="cashier-username">
                Username / ID Kasir
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#6F4534]/60 absolute left-3.5 top-3" />
                <input
                  id="cashier-username"
                  type="text"
                  required
                  value={cashierUsername}
                  onChange={(e) => setCashierUsername(e.target.value)}
                  placeholder="Username kasir yang terdaftar"
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#4A2C20] placeholder-[#6F4534]/60 focus:outline-none focus:border-[#C8894A] transition-colors font-medium font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6F4534] block mb-1.5" htmlFor="cashier-pin">
                PIN / Kata Sandi Kasir
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6F4534]/60 absolute left-3.5 top-3" />
                <input
                  id="cashier-pin"
                  type={showCashierPin ? 'text' : 'password'}
                  required
                  value={cashierPin}
                  onChange={(e) => setCashierPin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#4A2C20] placeholder-[#6F4534]/60 focus:outline-none focus:border-[#C8894A] transition-colors font-medium font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCashierPin(!showCashierPin)}
                  className="absolute right-3 top-2.5 text-[#6F4534]/60 hover:text-[#4A2C20] transition-colors"
                >
                  {showCashierPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-cashier-login-submit"
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#4A2C20] hover:bg-[#3A2218] text-[#E5B567] text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Masuk Shift Kasir (POS)</span>
            </button>
          </form>
        )}

        {/* Bottom cancellation if inside system */}
        {!isEntryGate && (
          <div className="mt-6 pt-4 border-t border-[#6F4534]/15 text-center">
            <button
              type="button"
              onClick={() => setActiveTab('pos')}
              className="inline-flex items-center gap-1.5 text-xs text-[#6F4534] hover:text-[#4A2C20] font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Batal & Kembali ke Kasir POS</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
