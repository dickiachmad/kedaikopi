import React, { useState } from 'react';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  History,
  Coffee,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { useCoffee } from '../../context/CoffeeContext';
import { Product, Ingredient, ProductCategory } from '../../types';
import { formatRupiah, formatNumber, formatDateTime } from '../../utils/formatters';

export const StockView: React.FC = () => {
  const {
    products,
    ingredients,
    mutations,
    updateProductStock,
    updateIngredientStock,
    saveProduct,
    deleteProduct,
    saveIngredient,
    deleteIngredient,
    lowStockItems,
  } = useCoffee();

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'ingredients' | 'mutations'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStockStatus, setFilterStockStatus] = useState<'all' | 'low' | 'empty'>('all');

  // Modal States
  const [stockAdjustmentModal, setStockAdjustmentModal] = useState<{
    isOpen: boolean;
    itemType: 'product' | 'ingredient';
    id: string;
    name: string;
    currentStock: number;
    unit: string;
    actionType: 'IN' | 'OUT' | 'WASTE';
  } | null>(null);

  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  const [editProductModal, setEditProductModal] = useState<{
    isOpen: boolean;
    product?: Product;
  } | null>(null);

  const [editIngredientModal, setEditIngredientModal] = useState<{
    isOpen: boolean;
    ingredient?: Ingredient;
  } | null>(null);

  // Form states for Product Add/Edit
  const [prodForm, setProdForm] = useState<Partial<Product>>({
    name: '',
    category: 'coffee',
    price: 25000,
    cogs: 8000,
    stock: 50,
    minStock: 10,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    description: '',
  });

  // Form states for Ingredient Add/Edit
  const [ingForm, setIngForm] = useState<Partial<Ingredient>>({
    name: '',
    unit: 'gram',
    stock: 5000,
    minStock: 1000,
    costPerUnit: 200,
    category: 'beans',
  });

  const handleOpenAdjustment = (
    itemType: 'product' | 'ingredient',
    id: string,
    name: string,
    currentStock: number,
    unit: string,
    actionType: 'IN' | 'OUT' | 'WASTE'
  ) => {
    setStockAdjustmentModal({
      isOpen: true,
      itemType,
      id,
      name,
      currentStock,
      unit,
      actionType,
    });
    setAdjustAmount(actionType === 'IN' ? (unit === 'gram' || unit === 'ml' ? 1000 : 10) : 1);
    setAdjustNotes(actionType === 'IN' ? 'Restock pasokan baru' : 'Afkir / bahan tumpah');
  };

  const handleConfirmAdjustment = () => {
    if (!stockAdjustmentModal) return;
    if (adjustAmount <= 0) return;

    if (stockAdjustmentModal.itemType === 'product') {
      updateProductStock(
        stockAdjustmentModal.id,
        adjustAmount,
        stockAdjustmentModal.actionType,
        adjustNotes
      );
    } else {
      updateIngredientStock(
        stockAdjustmentModal.id,
        adjustAmount,
        stockAdjustmentModal.actionType,
        adjustNotes
      );
    }
    setStockAdjustmentModal(null);
  };

  // Open Product Modal
  const openProductForm = (product?: Product) => {
    if (product) {
      setProdForm({ ...product });
    } else {
      setProdForm({
        id: `prod-${Date.now()}`,
        name: '',
        category: 'coffee',
        price: 25000,
        cogs: 8000,
        stock: 50,
        minStock: 10,
        image: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&auto=format&fit=crop&q=80',
        description: 'Menu kopi seduhan segar khas Efek Kafein',
      });
    }
    setEditProductModal({ isOpen: true, product });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name?.trim()) return;

    const finalProduct: Product = {
      id: prodForm.id || `prod-${Date.now()}`,
      name: prodForm.name.trim(),
      category: (prodForm.category as ProductCategory) || 'coffee',
      price: Number(prodForm.price) || 0,
      cogs: Number(prodForm.cogs) || 0,
      stock: Number(prodForm.stock) || 0,
      minStock: Number(prodForm.minStock) || 0,
      image: prodForm.image || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
      description: prodForm.description || '',
    };

    saveProduct(finalProduct);
    setEditProductModal(null);
  };

  // Open Ingredient Modal
  const openIngredientForm = (ingredient?: Ingredient) => {
    if (ingredient) {
      setIngForm({ ...ingredient });
    } else {
      setIngForm({
        id: `ing-${Date.now()}`,
        name: '',
        unit: 'gram',
        stock: 5000,
        minStock: 1000,
        costPerUnit: 200,
        category: 'beans',
      });
    }
    setEditIngredientModal({ isOpen: true, ingredient });
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingForm.name?.trim()) return;

    const finalIng: Ingredient = {
      id: ingForm.id || `ing-${Date.now()}`,
      name: ingForm.name.trim(),
      unit: ingForm.unit || 'gram',
      stock: Number(ingForm.stock) || 0,
      minStock: Number(ingForm.minStock) || 0,
      costPerUnit: Number(ingForm.costPerUnit) || 0,
      category: ingForm.category || 'beans',
    };

    saveIngredient(finalIng);
    setEditIngredientModal(null);
  };

  // Filter Products
  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStockStatus === 'empty') return matchSearch && p.stock <= 0;
    if (filterStockStatus === 'low') return matchSearch && p.stock > 0 && p.stock <= p.minStock;
    return matchSearch;
  });

  // Filter Ingredients
  const filteredIngredients = ingredients.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStockStatus === 'empty') return matchSearch && i.stock <= 0;
    if (filterStockStatus === 'low') return matchSearch && i.stock > 0 && i.stock <= i.minStock;
    return matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Summary */}
      <div className="bg-[#FFFDF9] border border-[#6F4534]/20 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-[#C8894A]" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A2C20]">
                Kelola Stok & Inventaris Kedai
              </h2>
            </div>
            <p className="text-xs text-[#6F4534] mt-1">
              Pantau ketersediaan menu siap jual, bahan baku (biji kopi, susu, sirup), dan log mutasi stok real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {lowStockItems.length > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>{lowStockItems.length} Item Menipis!</span>
              </div>
            )}
            {activeSubTab === 'products' && (
              <button
                type="button"
                onClick={() => openProductForm()}
                className="py-2 px-3.5 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#C8894A]/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>
            )}
            {activeSubTab === 'ingredients' && (
              <button
                type="button"
                onClick={() => openIngredientForm()}
                className="py-2 px-3.5 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#C8894A]/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Bahan Baku</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-tab switcher with responsive scrolling/wrap */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#6F4534]/15 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveSubTab('products')}
            className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeSubTab === 'products'
                ? 'bg-[#4A2C20] text-white border-[#4A2C20] shadow-xs'
                : 'bg-[#F7F2EA] text-[#6F4534] border-[#6F4534]/20 hover:bg-[#6F4534]/10'
            }`}
          >
            Menu Siap Jual ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('ingredients')}
            className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeSubTab === 'ingredients'
                ? 'bg-[#4A2C20] text-white border-[#4A2C20] shadow-xs'
                : 'bg-[#F7F2EA] text-[#6F4534] border-[#6F4534]/20 hover:bg-[#6F4534]/10'
            }`}
          >
            Bahan Baku & Kemasan ({ingredients.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('mutations')}
            className={`py-2 px-3.5 sm:px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              activeSubTab === 'mutations'
                ? 'bg-[#4A2C20] text-white border-[#4A2C20] shadow-xs'
                : 'bg-[#F7F2EA] text-[#6F4534] border-[#6F4534]/20 hover:bg-[#6F4534]/10'
            }`}
          >
            Riwayat Mutasi Stok ({mutations.length})
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      {activeSubTab !== 'mutations' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FFFDF9] p-3.5 rounded-2xl border border-[#6F4534]/15 shadow-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#6F4534]/60 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama item atau bahan..."
              className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl pl-9 pr-3 py-2 text-xs text-[#4A2C20] placeholder-[#6F4534]/60 outline-none focus:border-[#C8894A] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-[#6F4534]/70 hidden sm:block shrink-0" />
            <button
              type="button"
              onClick={() => setFilterStockStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                filterStockStatus === 'all'
                  ? 'bg-[#4A2C20] text-white border-[#4A2C20]'
                  : 'bg-[#F7F2EA] text-[#6F4534] border-[#6F4534]/20 hover:bg-[#6F4534]/10'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterStockStatus('low')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                filterStockStatus === 'low'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                  : 'bg-[#F7F2EA] text-[#6F4534] border-[#6F4534]/20 hover:bg-[#6F4534]/10'
              }`}
            >
              Stok Menipis
            </button>
            <button
              type="button"
              onClick={() => setFilterStockStatus('empty')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                filterStockStatus === 'empty'
                  ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold'
                  : 'bg-[#F7F2EA] text-[#6F4534] border-[#6F4534]/20 hover:bg-[#6F4534]/10'
              }`}
            >
              Habis (0)
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 1: PRODUK / MENU SIAP JUAL */}
      {activeSubTab === 'products' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#6F4534]/15 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#4A2C20]">
              <thead className="bg-[#F7F2EA] text-[#6F4534] font-semibold border-b border-[#6F4534]/15 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Produk Menu</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Harga Jual</th>
                  <th className="px-4 py-3">HPP (COGS)</th>
                  <th className="px-4 py-3">Margin Laba</th>
                  <th className="px-4 py-3">Stok Saat Ini</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6F4534]/10">
                {filteredProducts.map((p) => {
                  const marginRp = p.price - p.cogs;
                  const marginPct = p.price > 0 ? Math.round((marginRp / p.price) * 100) : 0;
                  const isLow = p.stock <= p.minStock && p.stock > 0;
                  const isEmpty = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#F7F2EA]/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-[#6F4534]/20"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <p className="font-bold text-[#4A2C20] text-xs sm:text-sm">{p.name}</p>
                            <span className="text-[10px] text-[#6F4534] line-clamp-1">
                              {p.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-[#F7F2EA] text-[#C8894A] border border-[#C8894A]/30 text-[10px] font-bold capitalize">
                          {p.category}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-[#4A2C20]">
                        {formatRupiah(p.price)}
                      </td>

                      <td className="px-4 py-3 font-mono text-[#6F4534]">
                        {formatRupiah(p.cogs)}
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-emerald-700 font-mono font-semibold">
                          +{marginPct}%
                        </span>
                        <span className="text-[10px] text-[#6F4534] block">
                          ({formatRupiah(marginRp)})
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-sm font-bold ${
                              isEmpty ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-[#4A2C20]'
                            }`}
                          >
                            {p.stock}
                          </span>
                          <span className="text-[10px] text-[#6F4534]">cup/porsi</span>
                        </div>
                        <span className="text-[9px] text-[#6F4534]">Batas Min: {p.minStock}</span>
                      </td>

                      <td className="px-4 py-3">
                        {isEmpty ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            Habis
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            Menipis
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            Tersedia
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Restock Button */}
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenAdjustment('product', p.id, p.name, p.stock, 'cup', 'IN')
                            }
                            className="p-1.5 rounded-lg bg-[#F7F2EA] hover:bg-[#6F4534]/15 text-emerald-700 border border-[#6F4534]/20 text-xs font-bold"
                            title="Tambah Stok (Restock)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          {/* Waste Button */}
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenAdjustment('product', p.id, p.name, p.stock, 'cup', 'WASTE')
                            }
                            className="p-1.5 rounded-lg bg-[#F7F2EA] hover:bg-[#6F4534]/15 text-amber-700 border border-[#6F4534]/20 text-xs font-bold"
                            title="Kurangi Stok (Afkir / Rusak)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Product */}
                          <button
                            type="button"
                            onClick={() => openProductForm(p)}
                            className="p-1.5 rounded-lg bg-[#F7F2EA] hover:bg-[#6F4534]/15 text-[#6F4534] border border-[#6F4534]/20 text-xs"
                            title="Edit Data Produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Product */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Hapus produk "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-[#F7F2EA] hover:bg-rose-100 text-rose-700 border border-[#6F4534]/20 text-xs"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BAHAN BAKU & PACKAGING */}
      {activeSubTab === 'ingredients' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIngredients.map((ing) => {
            const isLow = ing.stock <= ing.minStock && ing.stock > 0;
            const isEmpty = ing.stock <= 0;
            // capacity percentage assuming safe baseline is 3x minStock
            const safeMax = Math.max(ing.stock, ing.minStock * 3);
            const percentage = Math.min(100, Math.round((ing.stock / safeMax) * 100));

            return (
              <div
                key={ing.id}
                className="bg-[#FFFDF9] rounded-2xl border border-[#6F4534]/15 p-4 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#C8894A] bg-[#F7F2EA] px-2 py-0.5 rounded border border-[#C8894A]/30">
                        {ing.category}
                      </span>
                      <h4 className="font-serif text-sm font-bold text-[#4A2C20] mt-1.5 leading-snug">
                        {ing.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openIngredientForm(ing)}
                        className="p-1 text-[#6F4534] hover:text-[#4A2C20]"
                        title="Edit Bahan Baku"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus bahan baku "${ing.name}"?`)) {
                            deleteIngredient(ing.id);
                          }
                        }}
                        className="p-1 text-[#6F4534] hover:text-rose-700"
                        title="Hapus Bahan Baku"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stock Quantity & Level Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#6F4534]">Sisa Stok:</span>
                      <span
                        className={`text-lg font-mono font-bold ${
                          isEmpty ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {formatNumber(ing.stock)} {ing.unit}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-[#F7F2EA] overflow-hidden border border-[#6F4534]/15">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isEmpty
                            ? 'w-0'
                            : isLow
                            ? 'bg-amber-600'
                            : 'bg-[#C8894A]'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[#6F4534]">
                      <span>Batas Kritis: {formatNumber(ing.minStock)} {ing.unit}</span>
                      <span>Biaya: {formatRupiah(ing.costPerUnit)}/{ing.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Quick Restock & Waste */}
                <div className="pt-3 border-t border-[#6F4534]/15 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenAdjustment('ingredient', ing.id, ing.name, ing.stock, ing.unit, 'IN')
                    }
                    className="py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Restock</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleOpenAdjustment('ingredient', ing.id, ing.name, ing.stock, ing.unit, 'WASTE')
                    }
                    className="py-1.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>Afkir / Waste</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 3: RIWAYAT MUTASI STOK */}
      {activeSubTab === 'mutations' && (
        <div className="bg-[#FFFDF9] rounded-2xl border border-[#6F4534]/15 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[#6F4534]/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#C8894A]" />
              <h3 className="font-bold text-sm text-[#4A2C20]">Log Aktivitas & Mutasi Stok Real-time</h3>
            </div>
            <span className="text-xs text-[#6F4534]">{mutations.length} catatan tercatat</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#4A2C20]">
              <thead className="bg-[#F7F2EA] text-[#6F4534] font-semibold border-b border-[#6F4534]/15 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Item / Bahan</th>
                  <th className="px-4 py-3">Jenis Mutasi</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Keterangan / Referensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#6F4534]/10">
                {mutations.map((m) => (
                  <tr key={m.id} className="hover:bg-[#F7F2EA]/60">
                    <td className="px-4 py-3 text-[#6F4534] font-mono text-[11px]">
                      {formatDateTime(m.timestamp)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#4A2C20]">{m.itemName}</td>
                    <td className="px-4 py-3">
                      {m.type === 'IN' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <ArrowDownRight className="w-3 h-3" /> MASUK / RESTOCK
                        </span>
                      )}
                      {m.type === 'SALE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          <ArrowUpRight className="w-3 h-3" /> TERJUAL KASIR
                        </span>
                      )}
                      {m.type === 'WASTE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          <Minus className="w-3 h-3" /> AFKIR / WASTE
                        </span>
                      )}
                      {m.type === 'REFUND' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                          <Plus className="w-3 h-3" /> PENGEMBALIAN REFUND
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">
                      <span className={m.type === 'IN' || m.type === 'REFUND' ? 'text-emerald-700' : 'text-rose-700'}>
                        {m.type === 'IN' || m.type === 'REFUND' ? '+' : '-'}
                        {formatNumber(m.quantity)} {m.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#6F4534]">
                      {m.notes}
                      {m.referenceId && (
                        <span className="block text-[10px] font-mono text-[#C8894A]">
                          Ref: {m.referenceId}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Penyesuaian Stok (Restock / Waste) */}
      {stockAdjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#FFFDF9] border border-[#6F4534]/20 rounded-2xl w-full max-w-sm shadow-2xl p-5 text-[#4A2C20]">
            <div className="flex items-center justify-between pb-3 border-b border-[#6F4534]/15">
              <h3 className="font-serif text-sm font-bold text-[#4A2C20]">
                {stockAdjustmentModal.actionType === 'IN' ? 'Restock Masuk' : 'Catat Bahan Terbuang / Waste'}
              </h3>
              <button
                type="button"
                onClick={() => setStockAdjustmentModal(null)}
                className="p-1 text-[#6F4534] hover:text-[#4A2C20]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <span className="text-[10px] text-[#6F4534]">Item:</span>
                <p className="font-bold text-[#4A2C20] text-sm">{stockAdjustmentModal.name}</p>
                <span className="text-xs text-[#C8894A] font-mono font-bold">
                  Stok Sekarang: {formatNumber(stockAdjustmentModal.currentStock)} {stockAdjustmentModal.unit}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">
                  Jumlah {stockAdjustmentModal.actionType === 'IN' ? 'Ditambahkan' : 'Dikurangi'} ({stockAdjustmentModal.unit})
                </label>
                <input
                  type="number"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#4A2C20] outline-none focus:border-[#C8894A]"
                  min="1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">
                  Keterangan / Alasan
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="Misal: Pasokan supplier baru, susu tumpah, dsb."
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs text-[#4A2C20] placeholder-[#6F4534]/60 outline-none focus:border-[#C8894A]"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStockAdjustmentModal(null)}
                className="py-2 px-3 rounded-xl bg-[#F7F2EA] text-xs text-[#6F4534] hover:bg-[#6F4534]/15"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjustment}
                className="py-2 px-4 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold shadow-sm"
              >
                Konfirmasi Mutasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Tambah / Edit Produk */}
      {editProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveProduct}
            className="bg-[#FFFDF9] border border-[#6F4534]/20 rounded-2xl w-full max-w-md shadow-2xl p-5 text-[#4A2C20] my-auto space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#6F4534]/15">
              <h3 className="font-serif text-sm font-bold text-[#4A2C20]">
                {editProductModal.product ? 'Edit Menu Produk' : 'Tambah Menu Produk Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setEditProductModal(null)}
                className="p-1 text-[#6F4534] hover:text-[#4A2C20]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6F4534] block mb-1">Nama Menu</label>
              <input
                type="text"
                required
                value={prodForm.name || ''}
                onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                placeholder="Misal: Caramel Hazelnut Latte"
                className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs text-[#4A2C20] placeholder-[#6F4534]/60 outline-none focus:border-[#C8894A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">Kategori</label>
                <select
                  value={prodForm.category || 'coffee'}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, category: e.target.value as ProductCategory })
                  }
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs text-[#4A2C20] outline-none focus:border-[#C8894A]"
                >
                  <option value="signature">Signature Kafein</option>
                  <option value="coffee">Coffee & Espresso</option>
                  <option value="non-coffee">Non-Coffee</option>
                  <option value="food">Pastry & Food</option>
                  <option value="beans">Biji Kopi (Retail)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">Harga Jual (Rp)</label>
                <input
                  type="number"
                  required
                  value={prodForm.price || ''}
                  onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#4A2C20] outline-none focus:border-[#C8894A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">HPP / COGS (Rp)</label>
                <input
                  type="number"
                  required
                  value={prodForm.cogs || ''}
                  onChange={(e) => setProdForm({ ...prodForm, cogs: Number(e.target.value) })}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#4A2C20] outline-none focus:border-[#C8894A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">Stok Awal</label>
                <input
                  type="number"
                  required
                  value={prodForm.stock ?? 30}
                  onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#4A2C20] outline-none focus:border-[#C8894A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">Batas Min</label>
                <input
                  type="number"
                  required
                  value={prodForm.minStock ?? 10}
                  onChange={(e) => setProdForm({ ...prodForm, minStock: Number(e.target.value) })}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#4A2C20] outline-none focus:border-[#C8894A]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6F4534] block mb-1">Deskripsi Singkat</label>
              <textarea
                rows={2}
                value={prodForm.description || ''}
                onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                placeholder="Rasa, aroma, bahan..."
                className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs text-[#4A2C20] placeholder-[#6F4534]/60 outline-none focus:border-[#C8894A]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6F4534] block mb-1">URL Foto Produk</label>
              <input
                type="text"
                value={prodForm.image || ''}
                onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                placeholder="https://..."
                className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs text-[#4A2C20] placeholder-[#6F4534]/60 outline-none focus:border-[#C8894A]"
              />
            </div>

            <div className="pt-3 border-t border-[#6F4534]/15 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditProductModal(null)}
                className="py-2 px-3 rounded-xl bg-[#F7F2EA] text-xs text-[#6F4534] hover:bg-[#6F4534]/15"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold shadow-sm"
              >
                Simpan Produk
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Tambah / Edit Bahan Baku */}
      {editIngredientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSaveIngredient}
            className="bg-[#FFFDF9] border border-[#6F4534]/20 rounded-2xl w-full max-w-sm shadow-2xl p-5 text-[#4A2C20] space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#6F4534]/15">
              <h3 className="font-serif text-sm font-bold text-[#4A2C20]">
                {editIngredientModal.ingredient ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setEditIngredientModal(null)}
                className="p-1 text-[#6F4534] hover:text-[#4A2C20]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#6F4534] block mb-1">Nama Bahan Baku</label>
              <input
                type="text"
                required
                value={ingForm.name || ''}
                onChange={(e) => setIngForm({ ...ingForm, name: e.target.value })}
                placeholder="Misal: Biji Kopi Gayo 1000g"
                className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs text-[#4A2C20] placeholder-[#6F4534]/60 outline-none focus:border-[#C8894A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">Kategori</label>
                <select
                  value={ingForm.category || 'beans'}
                  onChange={(e) =>
                    setIngForm({ ...ingForm, category: e.target.value as any })
                  }
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs text-[#4A2C20] outline-none focus:border-[#C8894A]"
                >
                  <option value="beans">Biji Kopi (Beans)</option>
                  <option value="dairy">Susu & Dairy</option>
                  <option value="syrup">Sirup & Gula</option>
                  <option value="powder">Powder / Bubuk</option>
                  <option value="packaging">Cup & Packaging</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">Satuan</label>
                <select
                  value={ingForm.unit || 'gram'}
                  onChange={(e) => setIngForm({ ...ingForm, unit: e.target.value as any })}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs text-[#4A2C20] outline-none focus:border-[#C8894A]"
                >
                  <option value="gram">gram (g)</option>
                  <option value="ml">mililiter (ml)</option>
                  <option value="pcs">pieces (pcs)</option>
                  <option value="liter">liter (L)</option>
                  <option value="kg">kilogram (kg)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">Stok Awal</label>
                <input
                  type="number"
                  required
                  value={ingForm.stock ?? 1000}
                  onChange={(e) => setIngForm({ ...ingForm, stock: Number(e.target.value) })}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#4A2C20] outline-none focus:border-[#C8894A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">Batas Min</label>
                <input
                  type="number"
                  required
                  value={ingForm.minStock ?? 200}
                  onChange={(e) => setIngForm({ ...ingForm, minStock: Number(e.target.value) })}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#4A2C20] outline-none focus:border-[#C8894A]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#6F4534] block mb-1">Harga/Unit (Rp)</label>
                <input
                  type="number"
                  required
                  value={ingForm.costPerUnit ?? 100}
                  onChange={(e) => setIngForm({ ...ingForm, costPerUnit: Number(e.target.value) })}
                  className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs font-mono text-[#4A2C20] outline-none focus:border-[#C8894A]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#6F4534]/15 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditIngredientModal(null)}
                className="py-2 px-3 rounded-xl bg-[#F7F2EA] text-xs text-[#6F4534] hover:bg-[#6F4534]/15"
              >
                Batal
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold shadow-sm"
              >
                Simpan Bahan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
