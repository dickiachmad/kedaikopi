import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  AlertCircle,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { useCoffee } from '../../context/CoffeeContext';
import { CashierAccount } from '../../types';
import { formatDateTime } from '../../utils/formatters';

export const CashierAccountManager: React.FC = () => {
  const {
    cashierAccounts,
    addCashierAccount,
    updateCashierAccount,
    deleteCashierAccount,
    toggleCashierStatus,
  } = useCoffee();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CashierAccount | null>(null);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  // Add Form State
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editError, setEditError] = useState<string | null>(null);

  // Filtered accounts
  const filteredAccounts = cashierAccounts.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = cashierAccounts.filter((a) => a.isActive).length;
  const inactiveCount = cashierAccounts.length - activeCount;

  const toggleRevealPin = (id: string) => {
    setRevealedPins((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenAdd = () => {
    setNewName('');
    setNewUsername('');
    setNewPin('');
    setNewIsActive(true);
    setAddError(null);
    setAddSuccess(null);
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const res = addCashierAccount({
      name: newName,
      username: newUsername,
      pin: newPin,
      isActive: newIsActive,
    });

    if (res.success) {
      setAddSuccess(`Akun untuk "${newName}" berhasil ditambahkan!`);
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess(null);
      }, 1000);
    } else {
      setAddError(res.error || 'Gagal menambahkan akun.');
    }
  };

  const handleOpenEdit = (acc: CashierAccount) => {
    setEditingAccount(acc);
    setEditName(acc.name);
    setEditUsername(acc.username);
    setEditPin(acc.pin);
    setEditIsActive(acc.isActive);
    setEditError(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setEditError(null);

    const res = updateCashierAccount(editingAccount.id, {
      name: editName,
      username: editUsername,
      pin: editPin,
      isActive: editIsActive,
    });

    if (res.success) {
      setEditingAccount(null);
    } else {
      setEditError(res.error || 'Gagal memperbarui akun.');
    }
  };

  const handleDelete = (acc: CashierAccount) => {
    if (window.confirm(`Hapus akun kasir "${acc.name}" (${acc.username})? Tindakan ini tidak dapat dibatalkan.`)) {
      const res = deleteCashierAccount(acc.id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#6F4534]/15">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-[#4A2C20]">
              Kelola Hak Akses Akun Kasir
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#C8894A]/15 text-[#C8894A] border border-[#C8894A]/30">
              {cashierAccounts.length} Akun
            </span>
          </div>
          <p className="text-xs text-[#6F4534] mt-0.5">
            Admin memiliki wewenang penuh membuat, mengubah PIN, serta mengaktifkan atau memblokir akses login barista kasir.
          </p>
        </div>

        <button
          id="btn-add-cashier-account"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold shadow-md shadow-[#C8894A]/20 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Kasir</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/15 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#4A2C20]/10 text-[#4A2C20] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#6F4534] font-medium block">Total Akun Terdaftar</span>
            <span className="text-xl font-bold font-serif text-[#4A2C20]">{cashierAccounts.length} Barista</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/15 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#6F4534] font-medium block">Akses Aktif (Bisa Login)</span>
            <span className="text-xl font-bold font-serif text-emerald-700">{activeCount} Akun</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/15 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[#6F4534] font-medium block">Akses Diblokir / Nonaktif</span>
            <span className="text-xl font-bold font-serif text-red-700">{inactiveCount} Akun</span>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#6F4534]/60 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari akun kasir berdasarkan nama atau username..."
          className="w-full bg-[#FFFDF9] border border-[#6F4534]/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#4A2C20] placeholder-[#6F4534]/60 focus:outline-none focus:border-[#C8894A] transition-colors"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3.5 top-2.5 text-xs text-[#6F4534] hover:text-[#4A2C20]"
          >
            Clear
          </button>
        )}
      </div>

      {/* Cashier List */}
      <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F2EA] border-b border-[#6F4534]/15 text-[#6F4534] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Kasir / Barista</th>
                <th className="py-3 px-4">Username Login</th>
                <th className="py-3 px-4">PIN / Kata Sandi</th>
                <th className="py-3 px-4 text-center">Status Akses</th>
                <th className="py-3 px-4">Terakhir Login</th>
                <th className="py-3 px-4 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#6F4534]/10">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#6F4534] italic">
                    Tidak ada akun kasir yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isRevealed = !!revealedPins[acc.id];
                  return (
                    <tr
                      key={acc.id}
                      className={`hover:bg-[#F7F2EA]/60 transition-colors ${
                        !acc.isActive ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              acc.isActive
                                ? 'bg-[#4A2C20] text-[#E5B567]'
                                : 'bg-red-200 text-red-800'
                            }`}
                          >
                            {acc.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#4A2C20] block text-xs">
                              {acc.name}
                            </span>
                            <span className="text-[10px] text-[#6F4534]">
                              Dibuat: {formatDateTime(acc.createdAt).split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#4A2C20]">
                        @{acc.username}
                      </td>

                      {/* PIN / Password */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-[#F7F2EA] px-2 py-1 rounded border border-[#6F4534]/15 text-[#4A2C20]">
                            {isRevealed ? acc.pin : '••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRevealPin(acc.id)}
                            title={isRevealed ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                            className="text-[#6F4534] hover:text-[#4A2C20] p-1 rounded transition-colors"
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleCashierStatus(acc.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                            acc.isActive
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
                          }`}
                          title="Klik untuk mengubah status akses login kasir"
                        >
                          {acc.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-red-600" />
                              <span>Dinonaktifkan</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-[#6F4534] text-[11px]">
                        {acc.lastLogin ? (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C8894A]" />
                            <span>{formatDateTime(acc.lastLogin)}</span>
                          </div>
                        ) : (
                          <span className="text-[#6F4534]/60 italic">Belum pernah login</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(acc)}
                            title="Edit data akun & PIN"
                            className="p-1.5 rounded-lg bg-[#F7F2EA] hover:bg-[#6F4534]/10 text-[#4A2C20] border border-[#6F4534]/15 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(acc)}
                            title="Hapus akun kasir"
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#FFFDF9] border border-[#6F4534]/20 rounded-3xl p-6 shadow-2xl text-[#4A2C20]">
            <div className="flex items-center justify-between pb-3 border-b border-[#6F4534]/15">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#C8894A]/15 text-[#C8894A] flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#4A2C20]">
                  Tambah Akun Kasir Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-[#6F4534] hover:text-[#4A2C20]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            {addSuccess && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{addSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#6F4534] block mb-1">
                  Nama Lengkap Kasir / Barista *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Barista Dimas"
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-[#4A2C20] focus:outline-none focus:border-[#C8894A]"
                />
              </div>

              <div>
                <label className="font-bold text-[#6F4534] block mb-1">
                  Username Login Kasir *
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Contoh: dimas"
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-[#4A2C20] focus:outline-none focus:border-[#C8894A] font-mono"
                />
                <span className="text-[10px] text-[#6F4534] mt-0.5 block">
                  Digunakan barista saat login ke sistem kasir POS.
                </span>
              </div>

              <div>
                <label className="font-bold text-[#6F4534] block mb-1">
                  PIN / Kata Sandi Kasir *
                </label>
                <input
                  type="text"
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Contoh: 1234 atau kopi2026"
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-[#4A2C20] focus:outline-none focus:border-[#C8894A] font-mono"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#4A2C20]">
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    className="rounded accent-[#C8894A]"
                  />
                  <span>Langsung aktifkan izin login kasir ini</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-[#6F4534]/15">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#6F4534]/20 text-[#6F4534] hover:bg-[#F7F2EA]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white font-bold"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#FFFDF9] border border-[#6F4534]/20 rounded-3xl p-6 shadow-2xl text-[#4A2C20]">
            <div className="flex items-center justify-between pb-3 border-b border-[#6F4534]/15">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#4A2C20] text-[#E5B567] flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#4A2C20]">
                  Edit Akun Kasir: {editingAccount.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="p-1 text-[#6F4534] hover:text-[#4A2C20]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[#6F4534] block mb-1">
                  Nama Kasir / Barista *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-[#4A2C20] focus:outline-none focus:border-[#C8894A]"
                />
              </div>

              <div>
                <label className="font-bold text-[#6F4534] block mb-1">
                  Username Login Kasir *
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-[#4A2C20] focus:outline-none focus:border-[#C8894A] font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#6F4534] block mb-1">
                  Ubah PIN / Kata Sandi Kasir *
                </label>
                <input
                  type="text"
                  required
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-[#4A2C20] focus:outline-none focus:border-[#C8894A] font-mono"
                />
                <span className="text-[10px] text-[#6F4534] mt-0.5 block">
                  Admin dapat mereset atau memperbarui PIN kasir sewaktu-waktu.
                </span>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#4A2C20]">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="rounded accent-[#C8894A]"
                  />
                  <span>Status akun aktif (izinkan login)</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2 justify-end border-t border-[#6F4534]/15">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2 rounded-xl border border-[#6F4534]/20 text-[#6F4534] hover:bg-[#F7F2EA]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white font-bold"
                >
                  Perbarui Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
