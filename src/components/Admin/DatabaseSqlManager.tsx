import React, { useState } from 'react';
import {
  Database,
  Download,
  Copy,
  Check,
  Server,
  FileCode,
  Table,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCoffee } from '../../context/CoffeeContext';
import { generateMySqlDump, downloadSqlFile } from '../../utils/sqlExporter';

export const DatabaseSqlManager: React.FC = () => {
  const {
    products,
    ingredients,
    transactions,
    mutations,
    cashierAccounts,
    branding,
  } = useCoffee();

  const [copied, setCopied] = useState(false);
  const [exportMode, setExportMode] = useState<'live' | 'standard'>('live');
  const [showPreview, setShowPreview] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'phpmyadmin' | 'workbench' | 'terminal'>('phpmyadmin');

  // Generate SQL string based on selected mode
  const currentSql = React.useMemo(() => {
    return generateMySqlDump({
      products,
      ingredients,
      transactions,
      mutations,
      cashierAccounts,
      branding,
    });
  }, [products, ingredients, transactions, mutations, cashierAccounts, branding]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadSql = () => {
    const today = new Date().toISOString().slice(0, 10);
    const filename =
      exportMode === 'live'
        ? `kedai_kopi_efek_kafein_live_${today}.sql`
        : `kedai_kopi_mysql.sql`;
    downloadSqlFile(currentSql, filename);
  };

  // Recipe rows count
  const totalRecipeRows = products.reduce((acc, p) => acc + (p.recipe?.length || 0), 0);
  const totalTxItems = transactions.reduce((acc, t) => acc + t.items.length, 0);

  const tableList = [
    {
      name: 'shop_branding',
      desc: 'Pengaturan nama toko, tagline, preset logo & media sosial',
      count: 1,
      tag: 'Konfigurasi',
      keys: 'id (PK)',
    },
    {
      name: 'categories',
      desc: 'Kategori produk (signature, coffee, non-coffee, food, beans)',
      count: 5,
      tag: 'Master Data',
      keys: 'code (PK)',
    },
    {
      name: 'products',
      desc: 'Katalog minuman & makanan, harga jual, HPP, & stok jadi',
      count: products.length,
      tag: 'Katalog',
      keys: 'id (PK), FK ke categories',
    },
    {
      name: 'product_recipes',
      desc: 'Resep BOM pemakaian bahan baku per porsi minuman',
      count: totalRecipeRows,
      tag: 'Relasi',
      keys: 'id (PK), FK products & ingredients',
    },
    {
      name: 'ingredients',
      desc: 'Bahan baku (biji kopi, susu, sirup, cup 16oz, bubuk matcha)',
      count: ingredients.length,
      tag: 'Inventaris',
      keys: 'id (PK)',
    },
    {
      name: 'transactions',
      desc: 'Header faktur transaksi kasir, total, diskon, pajak & cara bayar',
      count: transactions.length,
      tag: 'Transaksi',
      keys: 'id (PK), FK cashier_id',
    },
    {
      name: 'transaction_items',
      desc: 'Rincian pesanan pelanggan, suhu, gula, extra shot, susu',
      count: totalTxItems,
      tag: 'Detail',
      keys: 'id (PK), FK transactions & products',
    },
    {
      name: 'stock_mutations',
      desc: 'Riwayat kartu mutasi stok (masuk, keluar, penjualan, waste)',
      count: mutations.length,
      tag: 'Log Audit',
      keys: 'id (PK)',
    },
    {
      name: 'cashier_accounts',
      desc: 'Akun kasir dan barista beserta PIN untuk login kasir POS',
      count: cashierAccounts.length,
      tag: 'Keamanan',
      keys: 'id (PK), username (UNIQUE)',
    },
    {
      name: 'admin_users',
      desc: 'Data login pemilik kedai dan supervisor operasional',
      count: 2,
      tag: 'Akses Admin',
      keys: 'id (PK), username (UNIQUE)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#4A2C20] to-[#2B1912] rounded-3xl p-6 sm:p-8 text-[#FFFDF9] shadow-xl relative overflow-hidden border border-[#6F4534]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8894A]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8894A]/20 border border-[#E5B567]/30 text-[#E5B567] text-xs font-semibold">
              <Server className="w-3.5 h-3.5" />
              <span>Database SQL Relasional (MySQL 5.7+ / 8.0+ / MariaDB)</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ekspor Database MySQL
            </h2>
            <p className="text-xs sm:text-sm text-[#E5B567]/80 leading-relaxed">
              Berkas skrip SQL lengkap siap pakai untuk diunggah ke hosting, phpMyAdmin (cPanel / XAMPP / Laragon), MySQL Workbench, atau server cloud VPS Anda.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <button
              id="download-mysql-sql-btn"
              type="button"
              onClick={handleDownloadSql}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-[#C8894A] hover:bg-[#b3753b] text-white font-bold text-sm shadow-lg shadow-[#C8894A]/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File .SQL</span>
            </button>

            <button
              id="copy-mysql-sql-btn"
              type="button"
              onClick={handleCopySql}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#351F16] hover:bg-[#43271c] border border-[#6F4534] text-[#E5B567] font-semibold text-sm transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Script SQL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-6 pt-5 border-t border-[#6F4534]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#E5B567]/90 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Charset utf8mb4 & InnoDB</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Foreign Keys & Cascade ON</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>10 Tabel Relasional Lengkap</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>3 View Laporan & Analitik</span>
          </div>
        </div>
      </div>

      {/* Mode Selector & Quick Summary */}
      <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#6F4534]/15">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#4A2C20] flex items-center gap-2">
              <Table className="w-5 h-5 text-[#C8894A]" />
              <span>Struktur Tabel & Jumlah Data Tersedia</span>
            </h3>
            <p className="text-xs text-[#6F4534] mt-0.5">
              Skrip SQL berisi pembuatan skema DDL (CREATE DATABASE, TABLE, VIEW) serta data record (INSERT)
            </p>
          </div>

          <div className="flex items-center p-1 bg-[#F7F2EA] rounded-xl border border-[#6F4534]/20 text-xs">
            <button
              type="button"
              onClick={() => setExportMode('live')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                exportMode === 'live'
                  ? 'bg-[#4A2C20] text-white shadow-xs'
                  : 'text-[#6F4534] hover:text-[#4A2C20]'
              }`}
            >
              Data Terkini (Live: {products.length} Menu)
            </button>
            <button
              type="button"
              onClick={() => setExportMode('standard')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                exportMode === 'standard'
                  ? 'bg-[#4A2C20] text-white shadow-xs'
                  : 'text-[#6F4534] hover:text-[#4A2C20]'
              }`}
            >
              Skema Standar
            </button>
          </div>
        </div>

        {/* Table Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
          {tableList.map((tbl) => (
            <div
              key={tbl.name}
              className="p-3.5 rounded-2xl bg-[#F7F2EA]/70 border border-[#6F4534]/15 hover:border-[#C8894A]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono font-bold text-xs text-[#4A2C20] bg-[#FFFDF9] px-2 py-0.5 rounded-md border border-[#6F4534]/20">
                    `{tbl.name}`
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C8894A]/15 text-[#8F5528]">
                    {tbl.tag}
                  </span>
                </div>
                <p className="text-xs text-[#6F4534] leading-relaxed">
                  {tbl.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#6F4534]/10 flex items-center justify-between text-[11px]">
                <span className="text-[#6F4534]/80 font-mono text-[10px]">
                  {tbl.keys}
                </span>
                <span className="font-bold text-[#4A2C20]">
                  {tbl.count} Baris
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Built-in Views Highlight */}
        <div className="mt-5 p-4 rounded-2xl bg-[#4A2C20]/5 border border-[#C8894A]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#4A2C20]">
            <Sparkles className="w-5 h-5 text-[#C8894A] shrink-0" />
            <div>
              <span className="font-bold text-[#4A2C20] block">Dilengkapi 3 SQL Views Otomatis:</span>
              <span className="text-[#6F4534]">
                <code className="font-mono font-semibold">v_daily_sales_summary</code>,{' '}
                <code className="font-mono font-semibold">v_low_stock_alerts</code>, dan{' '}
                <code className="font-mono font-semibold">v_top_selling_products</code>
              </span>
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#C8894A] bg-[#FFFDF9] px-3 py-1 rounded-xl border border-[#C8894A]/30">
            Siap Query Laporan
          </span>
        </div>
      </div>

      {/* Step by Step Import Guide */}
      <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-[#6F4534]/15">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-[#C8894A]" />
            <h3 className="font-serif text-lg font-bold text-[#4A2C20]">
              Panduan Cara Upload ke Database MySQL
            </h3>
          </div>

          <div className="flex items-center p-1 bg-[#F7F2EA] rounded-xl border border-[#6F4534]/20 text-xs">
            <button
              type="button"
              onClick={() => setActiveGuideTab('phpmyadmin')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeGuideTab === 'phpmyadmin'
                  ? 'bg-[#4A2C20] text-white'
                  : 'text-[#6F4534] hover:text-[#4A2C20]'
              }`}
            >
              phpMyAdmin (cPanel / XAMPP)
            </button>
            <button
              type="button"
              onClick={() => setActiveGuideTab('workbench')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeGuideTab === 'workbench'
                  ? 'bg-[#4A2C20] text-white'
                  : 'text-[#6F4534] hover:text-[#4A2C20]'
              }`}
            >
              MySQL Workbench / DBeaver
            </button>
            <button
              type="button"
              onClick={() => setActiveGuideTab('terminal')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeGuideTab === 'terminal'
                  ? 'bg-[#4A2C20] text-white'
                  : 'text-[#6F4534] hover:text-[#4A2C20]'
              }`}
            >
              Terminal / CLI
            </button>
          </div>
        </div>

        {/* Tab Content: phpMyAdmin */}
        {activeGuideTab === 'phpmyadmin' && (
          <div className="mt-5 space-y-3.5 text-xs text-[#4A2C20]">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7F2EA]">
              <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <p className="font-bold text-sm">Unduh File SQL</p>
                <p className="text-[#6F4534] mt-0.5">
                  Klik tombol <strong>"Unduh File .SQL"</strong> di atas. File bernama <code className="bg-[#FFFDF9] px-1.5 py-0.5 rounded border border-[#6F4534]/20 font-mono text-[#C8894A]">kedai_kopi_mysql.sql</code> akan tersimpan di komputer Anda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7F2EA]">
              <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <p className="font-bold text-sm">Buka phpMyAdmin</p>
                <p className="text-[#6F4534] mt-0.5">
                  Buka browser dan akses phpMyAdmin di <code className="bg-[#FFFDF9] px-1.5 py-0.5 rounded border border-[#6F4534]/20 font-mono">http://localhost/phpmyadmin</code> (jika menggunakan XAMPP/Laragon) atau buka menu <strong>phpMyAdmin</strong> di cPanel hosting Anda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7F2EA]">
              <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <p className="font-bold text-sm">Pilih Tab Impor (Import)</p>
                <p className="text-[#6F4534] mt-0.5">
                  Klik tab <strong>"Import"</strong> pada menu atas phpMyAdmin. Script sudah berisi perintah otomatis <code className="bg-[#FFFDF9] px-1.5 py-0.5 rounded border border-[#6F4534]/20 font-mono">CREATE DATABASE IF NOT EXISTS kedai_kopi_efek_kafein;</code> sehingga Anda tidak perlu membuat database kosong terlebih dahulu.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7F2EA]">
              <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                4
              </span>
              <div>
                <p className="font-bold text-sm">Pilih Berkas & Klik Kirim (Go)</p>
                <p className="text-[#6F4534] mt-0.5">
                  Klik <strong>Choose File / Telusuri</strong>, pilih file <code className="font-mono">kedai_kopi_mysql.sql</code> yang telah diunduh, lalu scroll ke bawah dan klik tombol <strong>Go / Kirim</strong>. Semua 10 tabel, resep, relasi, dan data transaksi akan langsung aktif!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: MySQL Workbench */}
        {activeGuideTab === 'workbench' && (
          <div className="mt-5 space-y-3.5 text-xs text-[#4A2C20]">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7F2EA]">
              <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <p className="font-bold text-sm">Buka MySQL Workbench / DBeaver / Navicat</p>
                <p className="text-[#6F4534] mt-0.5">
                  Buka aplikasi dan hubungkan ke koneksi MySQL lokal atau server remote Anda.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7F2EA]">
              <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <p className="font-bold text-sm">Buka File Script</p>
                <p className="text-[#6F4534] mt-0.5">
                  Pilih menu <strong>File</strong> &gt; <strong>Open SQL Script...</strong> (atau tekan tombol kombinasi <kbd className="px-1.5 py-0.5 bg-[#FFFDF9] rounded border border-[#6F4534]/20 font-mono">Ctrl+O</kbd> / <kbd className="px-1.5 py-0.5 bg-[#FFFDF9] rounded border border-[#6F4534]/20 font-mono">Cmd+O</kbd>) lalu pilih berkas <code className="font-mono font-bold">kedai_kopi_mysql.sql</code>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-[#F7F2EA]">
              <span className="w-6 h-6 rounded-full bg-[#C8894A] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <p className="font-bold text-sm">Eksekusi Seluruh Skrip (Execute)</p>
                <p className="text-[#6F4534] mt-0.5">
                  Klik ikon Petir (<span className="font-semibold text-amber-600">⚡ Execute All</span>) pada toolbar untuk menjalankan seluruh baris SQL. Database <code className="font-mono">kedai_kopi_efek_kafein</code> akan terbuat seketika.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Terminal CLI */}
        {activeGuideTab === 'terminal' && (
          <div className="mt-5 space-y-3.5 text-xs text-[#4A2C20]">
            <p className="text-[#6F4534]">
              Jika Anda mengelola server VPS Linux (Ubuntu, Debian, CentOS) atau menyukai command line:
            </p>
            <div className="p-4 rounded-2xl bg-[#2B1912] text-[#FFFDF9] font-mono text-xs overflow-x-auto space-y-2 border border-[#6F4534]">
              <div className="text-[#E5B567]/70"># 1. Pindah ke direktori tempat file SQL berada</div>
              <div className="text-white">cd ~/Downloads</div>
              <div className="text-[#E5B567]/70 mt-2"># 2. Impor langsung ke MySQL server</div>
              <div className="text-emerald-400 font-bold">mysql -u root -p &lt; kedai_kopi_mysql.sql</div>
              <div className="text-[#E5B567]/70 mt-2"># 3. Verifikasi tabel yang telah terbuat</div>
              <div className="text-white">mysql -u root -p -e "SHOW TABLES FROM kedai_kopi_efek_kafein;"</div>
            </div>
          </div>
        )}
      </div>

      {/* SQL Script Viewer Accordion */}
      <div className="bg-[#FFFDF9] border border-[#6F4534]/15 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileCode className="w-5 h-5 text-[#C8894A]" />
            <div>
              <h3 className="font-serif text-base font-bold text-[#4A2C20]">
                Pratinjau Kode SQL (SQL Preview)
              </h3>
              <p className="text-xs text-[#6F4534]">
                Lihat langsung sintaks DDL, relasi tabel, dan query INSERT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-xl bg-[#F7F2EA] hover:bg-[#6F4534]/10 text-[#4A2C20] border border-[#6F4534]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C8894A]" />
                  <span>Salin</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1.5 rounded-xl bg-[#4A2C20] hover:bg-[#351F16] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>{showPreview ? 'Sembunyikan' : 'Buka Preview'}</span>
              {showPreview ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="mt-4 pt-4 border-t border-[#6F4534]/15">
            <div className="relative">
              <pre className="p-4 rounded-2xl bg-[#1E140F] text-[#E5B567] text-xs font-mono max-h-96 overflow-y-auto overflow-x-auto whitespace-pre leading-relaxed border border-[#6F4534]/40 selection:bg-[#C8894A] selection:text-white">
                {currentSql}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
