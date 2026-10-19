/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CoffeeProvider, useCoffee } from './context/CoffeeContext';
import { Header } from './components/Header';
import { PosView } from './components/POS/PosView';
import { StockView } from './components/Inventory/StockView';
import { ReportsView } from './components/Reports/ReportsView';
import { AdminLoginView } from './components/Admin/AdminLoginView';

const MainLayout: React.FC = () => {
  const { activeTab, isLoggedIn, isAdminLoggedIn } = useCoffee();

  // If not logged in, display the System Entry Login Gate
  if (!isLoggedIn) {
    return <AdminLoginView isEntryGate={true} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F2EA] text-[#4A2C20] flex flex-col selection:bg-[#C8894A] selection:text-white">
      {/* Top sticky navigation header */}
      <Header />

      {/* Main content container */}
      <main className="flex-1 pb-16">
        {activeTab === 'pos' && <PosView />}
        {activeTab === 'inventory' &&
          (isAdminLoggedIn ? (
            <StockView />
          ) : (
            <AdminLoginView
              redirectTo="inventory"
              message="Akses Kelola Stok & Bahan Baku membutuhkan autentikasi Admin / Manajer."
            />
          ))}
        {activeTab === 'reports' &&
          (isAdminLoggedIn ? (
            <ReportsView />
          ) : (
            <AdminLoginView
              redirectTo="reports"
              message="Akses Laporan Omzet & Keuangan membutuhkan autentikasi Admin / Manajer."
            />
          ))}
        {activeTab === 'admin-login' && <AdminLoginView />}
      </main>

      {/* Footer bar */}
      <footer className="bg-[#FFFDF9] border-t border-[#6F4534]/15 py-3.5 text-center text-xs text-[#6F4534] mt-auto shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-serif font-medium text-[#4A2C20]">
            Kedai Kopi Efek Kafein © 2026 • Sistem POS, Kelola Stok & Laporan Real-time
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Sistem Aktif & Terhubung
            </span>
            <span className="text-[#6F4534]/30">|</span>
            <span className="font-semibold text-[#C8894A]">v1.0.0 Real-time POS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CoffeeProvider>
      <MainLayout />
    </CoffeeProvider>
  );
}
