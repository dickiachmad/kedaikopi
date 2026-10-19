import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  RotateCcw,
  Check,
  Globe,
  Store,
  Layout,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Coffee,
  Flame,
  CupSoda,
  Heart,
  Zap,
  Database,
} from 'lucide-react';
import { useCoffee } from '../../context/CoffeeContext';
import { PresetIconName, ShopBranding } from '../../types';
import { BrandLogo, renderPresetIcon } from '../Common/BrandLogo';

const PRESET_ICONS: { id: PresetIconName; label: string; desc: string }[] = [
  { id: 'Coffee', label: 'Cangkir Kopi', desc: 'Klasik & Hangat (Default)' },
  { id: 'Flame', label: 'Api Roaster', desc: 'Aroma sangrai & fresh roast' },
  { id: 'CupSoda', label: 'Cup & Es', desc: 'Minuman dingin & takeaway' },
  { id: 'Sparkles', label: 'Spesialti', desc: 'Kopi premium & artisan' },
  { id: 'Store', label: 'Kedai Fisik', desc: 'Kafe & outlet kedai' },
  { id: 'Heart', label: 'Favorit', desc: 'Dibuat dengan sepenuh hati' },
  { id: 'Zap', label: 'Energi Kafein', desc: 'Semangat booster berenergi' },
];

export const BrandingSettingsManager: React.FC = () => {
  const { branding, updateBranding, resetBranding, dbSyncStatus, lastSyncedAt } = useCoffee();

  // Form State
  const [storeName, setStoreName] = useState(branding.storeName);
  const [tagline, setTagline] = useState(branding.tagline);
  const [titleBarText, setTitleBarText] = useState(branding.titleBarText);
  const [address, setAddress] = useState(branding.address || '');
  const [instagram, setInstagram] = useState(branding.instagram || '');
  const [logoType, setLogoType] = useState<'preset' | 'custom'>(branding.logoType);
  const [presetIcon, setPresetIcon] = useState<PresetIconName>(branding.presetIcon);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>(branding.customLogoUrl || '');

  // Keep form in sync if remote database changes arrived
  useEffect(() => {
    setStoreName(branding.storeName);
    setTagline(branding.tagline);
    setTitleBarText(branding.titleBarText);
    setAddress(branding.address || '');
    setInstagram(branding.instagram || '');
    setLogoType(branding.logoType);
    setPresetIcon(branding.presetIcon);
    setCustomLogoUrl(branding.customLogoUrl || '');
  }, [branding]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Temporary preview object
  const previewBranding: ShopBranding = {
    storeName: storeName.trim() || 'Efek Kafein',
    tagline: tagline.trim() || 'Sistem Penjualan & Inventaris Real-time',
    titleBarText: titleBarText.trim() || 'Kedai Kopi Efek Kafein',
    logoType,
    presetIcon,
    customLogoUrl,
    address: address.trim(),
    instagram: instagram.trim(),
  };

  const handleFileUpload = (file: File) => {
    setFileError(null);
    if (!file.type.startsWith('image/')) {
      setFileError('Format file harus berupa gambar (PNG, JPG, SVG, WebP).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFileError('Ukuran file gambar maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setCustomLogoUrl(result);
        setLogoType('custom');
      }
    };
    reader.onerror = () => {
      setFileError('Gagal membaca file gambar. Silakan coba file lain.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding({
      storeName: storeName.trim() || 'Efek Kafein',
      tagline: tagline.trim() || 'Sistem Penjualan & Inventaris Real-time',
      titleBarText: titleBarText.trim() || 'Kedai Kopi Efek Kafein',
      address: address.trim(),
      instagram: instagram.trim(),
      logoType,
      presetIcon,
      customLogoUrl,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Kembalikan pengaturan logo, nama kedai, dan title bar ke setelan default awal?'
      )
    ) {
      resetBranding();
      setStoreName('Efek Kafein');
      setTagline('Sistem Penjualan & Inventaris Real-time');
      setTitleBarText('Kedai Kopi Efek Kafein');
      setAddress('Jl. Kafein Boulevard No. 18, Jakarta');
      setInstagram('@efekkafein.id');
      setLogoType('preset');
      setPresetIcon('Coffee');
      setCustomLogoUrl('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#6F4534]/15">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-[#4A2C20]">
              Pengaturan Logo & Title Bar Sistem
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#C8894A]/15 text-[#C8894A] border border-[#C8894A]/30">
              Branding
            </span>
          </div>
          <p className="text-xs text-[#6F4534] mt-0.5">
            Admin dapat mengubah logo sistem (ikon preset atau upload gambar), judul title bar tab browser, nama kedai, dan tagline.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#6F4534]/20 hover:bg-[#F7F2EA] text-[#6F4534] text-xs font-semibold transition-colors"
          title="Kembalikan ke logo dan nama bawaan"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset ke Default</span>
        </button>
      </div>

      {/* Cloud Database Status Card */}
      <div className="p-3.5 rounded-2xl bg-[#FFFDF9] border border-[#C8894A]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C8894A]/15 text-[#C8894A] flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4A2C20]">
                Terkoneksi ke Cloud Database Firestore
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time Aktif
              </span>
            </div>
            <p className="text-[11px] text-[#6F4534]">
              Setiap perubahan logo, title bar, atau identitas kedai otomatis tersimpan ke database cloud dan langsung sinkron di seluruh perangkat kasir & pelanggan secara langsung tanpa perlu refresh.
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right text-[10px] text-[#6F4534]/80 font-mono shrink-0">
          Status: <span className="text-emerald-700 font-semibold uppercase">{dbSyncStatus}</span>
          <br />
          Update Terakhir: {lastSyncedAt ? lastSyncedAt.toLocaleTimeString('id-ID') : '-'}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pengaturan logo dan title bar berhasil diperbarui dan disimpan!</span>
          </div>
          <span className="text-[10px] text-emerald-600 uppercase font-bold">Tersimpan</span>
        </div>
      )}

      {/* Live Previews Container */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#6F4534] flex items-center gap-1.5">
          <Layout className="w-4 h-4 text-[#C8894A]" />
          <span>Pratinjau Langsung (Live Preview):</span>
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Browser Tab Mockup Preview */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#6F4534]">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#C8894A]" />
                <span>Title Bar Tab Browser</span>
              </span>
              <span className="text-[10px] font-mono text-[#6F4534]/70">document.title</span>
            </div>

            {/* Browser Top Bar Representation */}
            <div className="bg-[#2D1B13] rounded-xl p-2.5 shadow-inner">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>

                {/* Tab Simulation */}
                <div className="flex-1 max-w-xs flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4A2C20] text-[#FFFDF9] border border-[#6F4534]/60 text-xs shadow-xs truncate">
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center text-[#E5B567]">
                    {previewBranding.logoType === 'custom' && previewBranding.customLogoUrl ? (
                      <img
                        src={previewBranding.customLogoUrl}
                        alt="favicon"
                        className="w-4 h-4 object-cover rounded-xs"
                      />
                    ) : (
                      renderPresetIcon(previewBranding.presetIcon, 'w-3.5 h-3.5')
                    )}
                  </div>
                  <span className="truncate font-medium text-xs">
                    {previewBranding.titleBarText}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#6F4534]/80">
              Teks ini langsung mengubah judul yang tampil pada tab browser saat ini.
            </p>
          </div>

          {/* 2. Header Navbar Mockup Preview */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#6F4534]">
              <span className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#C8894A]" />
                <span>Header Navbar Kedai</span>
              </span>
              <span className="text-[10px] font-mono text-[#6F4534]/70">Header.tsx</span>
            </div>

            {/* Navbar snippet */}
            <div className="bg-[#4A2C20] p-3 rounded-xl border border-[#6F4534] flex items-center gap-3">
              <BrandLogo branding={previewBranding} className="w-10 h-10" iconClassName="w-5 h-5 stroke-[2.2]" />
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-base font-bold text-[#FFFDF9] truncate">
                    {previewBranding.storeName}
                  </span>
                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded-full bg-[#C8894A]/20 text-[#E5B567] border border-[#E5B567]/40">
                    POS & Stok
                  </span>
                </div>
                <p className="text-[10px] text-[#E5B567]/75 truncate">
                  {previewBranding.tagline}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-[#6F4534]/80">
              Tampilan logo dan nama brand yang dilihat oleh kasir dan barista di bagian atas layar.
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Logo Settings */}
        <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#6F4534]/15">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#C8894A]/15 text-[#C8894A] flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#4A2C20]">
                  1. Pilih Jenis Logo Sistem
                </h4>
                <p className="text-[11px] text-[#6F4534]">
                  Gunakan ikon preset bertema kopi atau unggah logo gambar asli kedai Anda.
                </p>
              </div>
            </div>

            {/* Switch Mode Tabs */}
            <div className="flex p-1 bg-[#F7F2EA] rounded-xl border border-[#6F4534]/15 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLogoType('preset')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  logoType === 'preset'
                    ? 'bg-[#4A2C20] text-[#E5B567] shadow-xs'
                    : 'text-[#6F4534] hover:text-[#4A2C20]'
                }`}
              >
                Ikon Preset
              </button>
              <button
                type="button"
                onClick={() => setLogoType('custom')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  logoType === 'custom'
                    ? 'bg-[#4A2C20] text-[#E5B567] shadow-xs'
                    : 'text-[#6F4534] hover:text-[#4A2C20]'
                }`}
              >
                Unggah Logo Sendiri
              </button>
            </div>
          </div>

          {/* Preset Icons Selection */}
          {logoType === 'preset' ? (
            <div>
              <label className="text-xs font-bold text-[#6F4534] block mb-2.5">
                Pilih Ikon Preset Kedai:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {PRESET_ICONS.map((icon) => {
                  const isSelected = presetIcon === icon.id;
                  return (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => setPresetIcon(icon.id)}
                      className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-[#4A2C20] text-[#E5B567] border-[#C8894A] ring-2 ring-[#C8894A]/40 shadow-sm'
                          : 'bg-[#F7F2EA] border-[#6F4534]/20 text-[#4A2C20] hover:border-[#C8894A]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                        {renderPresetIcon(icon.id, 'w-5 h-5 stroke-[2]')}
                      </div>
                      <span className="text-xs font-bold block">{icon.label}</span>
                      <span
                        className={`text-[9px] line-clamp-1 ${
                          isSelected ? 'text-[#E5B567]/70' : 'text-[#6F4534]'
                        }`}
                      >
                        {icon.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Custom Image Upload */
            <div className="space-y-3">
              <label className="text-xs font-bold text-[#6F4534] block">
                Unggah Gambar Logo Kedai (PNG, JPG, SVG, WebP):
              </label>

              {customLogoUrl ? (
                <div className="p-4 rounded-xl bg-[#F7F2EA] border border-[#6F4534]/20 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#4A2C20] p-1 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={customLogoUrl}
                      alt="Logo Pratinjau"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <span className="text-xs font-bold text-[#4A2C20] block">
                      Logo Kustom Terpasang
                    </span>
                    <p className="text-[11px] text-[#6F4534]">
                      Gambar ini aktif digunakan sebagai logo sistem pada header dan title bar.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-semibold transition-colors"
                      >
                        Ganti Gambar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomLogoUrl('');
                          setLogoType('preset');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus & Gunakan Ikon Preset</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#C8894A]/50 hover:border-[#C8894A] rounded-2xl p-6 text-center cursor-pointer bg-[#F7F2EA]/60 hover:bg-[#F7F2EA] transition-all"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#C8894A]/15 text-[#C8894A] flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#4A2C20] block">
                    Klik untuk memilih file logo atau seret gambar ke sini
                  </span>
                  <span className="text-[11px] text-[#6F4534] mt-0.5 block">
                    Format: PNG transparan, JPG, SVG, atau WebP (Maks. 2 MB)
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {fileError && (
                <p className="text-xs text-red-600 font-medium">{fileError}</p>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Title Bar & Text Branding */}
        <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#6F4534]/20 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#6F4534]/15">
            <div className="w-7 h-7 rounded-lg bg-[#C8894A]/15 text-[#C8894A] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#4A2C20]">
                2. Judul Title Bar & Teks Identitas Kedai
              </h4>
              <p className="text-[11px] text-[#6F4534]">
                Konfigurasi nama toko yang muncul di tab browser, navbar sistem, dan nota cetak.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Title Bar Input */}
            <div className="md:col-span-2">
              <label className="font-bold text-[#6F4534] block mb-1">
                Teks Title Bar Tab Browser (`&lt;title&gt;`) *
              </label>
              <input
                type="text"
                required
                value={titleBarText}
                onChange={(e) => setTitleBarText(e.target.value)}
                placeholder="Contoh: Kedai Kopi Efek Kafein - POS & Inventaris"
                className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3.5 py-2.5 text-[#4A2C20] focus:outline-none focus:border-[#C8894A] font-medium"
              />
              <span className="text-[10px] text-[#6F4534] mt-1 block">
                Teks ini akan langsung muncul di tab browser pengguna saat membuka aplikasi.
              </span>
            </div>

            {/* Store Name Input */}
            <div>
              <label className="font-bold text-[#6F4534] block mb-1">
                Nama Utama Kedai / Brand *
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Contoh: Efek Kafein"
                className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3.5 py-2.5 text-[#4A2C20] focus:outline-none focus:border-[#C8894A] font-bold font-serif text-sm"
              />
              <span className="text-[10px] text-[#6F4534] mt-1 block">
                Tampil di header navigasi dan struk transaksi.
              </span>
            </div>

            {/* Tagline */}
            <div>
              <label className="font-bold text-[#6F4534] block mb-1">
                Tagline / Keterangan Singkat
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Contoh: Sistem Penjualan & Inventaris Real-time"
                className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3.5 py-2.5 text-[#4A2C20] focus:outline-none focus:border-[#C8894A]"
              />
              <span className="text-[10px] text-[#6F4534] mt-1 block">
                Tampil di bawah nama toko pada header navbar.
              </span>
            </div>

            {/* Address */}
            <div>
              <label className="font-bold text-[#6F4534] block mb-1">
                Alamat Fisik Kedai (Dicetak di Struk)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: Jl. Kafein Boulevard No. 18, Jakarta"
                className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3.5 py-2.5 text-[#4A2C20] focus:outline-none focus:border-[#C8894A]"
              />
            </div>

            {/* Instagram / Social */}
            <div>
              <label className="font-bold text-[#6F4534] block mb-1">
                Akun Sosial / Kontak Kedai
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Contoh: @efekkafein.id"
                className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3.5 py-2.5 text-[#4A2C20] focus:outline-none focus:border-[#C8894A]"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            id="btn-save-branding-settings"
            type="submit"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#C8894A]/25 transition-all"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Simpan Perubahan Branding & Title Bar</span>
          </button>
        </div>
      </form>
    </div>
  );
};
