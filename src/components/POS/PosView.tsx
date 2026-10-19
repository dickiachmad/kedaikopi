import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Tag,
  Coffee,
  Sparkles,
  ShoppingBag,
  Percent,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import { useCoffee } from '../../context/CoffeeContext';
import { Product, ProductCategory, CartCustomization } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';

export const PosView: React.FC = () => {
  const {
    products,
    cart,
    cartSubtotal,
    cartTax,
    cartTotal,
    cartItemCount,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    discountAmount,
    discountName,
    setDiscount,
    includeTax,
    setIncludeTax,
    completeTransaction,
    selectedTransactionForReceipt,
    setSelectedTransactionForReceipt,
  } = useCoffee();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDiscountPicker, setShowDiscountPicker] = useState(false);

  const [showMobileCartModal, setShowMobileCartModal] = useState(false);

  // Categories list with icons
  const categories: { key: ProductCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'Semua Menu' },
    { key: 'signature', label: 'Signature Kafein' },
    { key: 'coffee', label: 'Coffee & Espresso' },
    { key: 'non-coffee', label: 'Non-Coffee' },
    { key: 'food', label: 'Pastry & Toast' },
    { key: 'beans', label: 'Biji Kopi Pack' },
  ];

  const tableOptions = ['Meja 01', 'Meja 02', 'Meja 03', 'Meja 04', 'Meja 05', 'Bar 01', 'Bar 02', 'Outdoor 01', 'Outdoor 02'];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleProductClick = (product: Product) => {
    if (product.stock <= 0) return;
    // If it's a beverage with customization options, open modal; otherwise add directly
    if (product.category === 'coffee' || product.category === 'signature' || product.category === 'non-coffee') {
      setCustomizingProduct(product);
    } else {
      addToCart(product);
    }
  };

  const handleApplyDiscount = (amount: number, name: string) => {
    setDiscount(amount, name);
    setShowDiscountPicker(false);
  };

  const handleProcessPayment = (method: any, paid: number) => {
    const res = completeTransaction(method, paid);
    if (res.success) {
      setShowPaymentModal(false);
      setShowMobileCartModal(false);
    }
  };

  // Reusable Cart Content Component for both desktop panel and mobile modal
  const renderCartContent = (isMobileModal = false) => (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="p-4 bg-[#F7F2EA] border-b border-[#6F4534]/15 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#C8894A]/15 text-[#C8894A] flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#4A2C20]">Keranjang Pesanan</h3>
            <span className="text-[11px] text-[#6F4534] font-medium">
              {cartItemCount} item dipilih
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {cart.length > 0 && (
            <button
              id={isMobileModal ? 'mobile-clear-cart-btn' : 'clear-cart-btn'}
              type="button"
              onClick={clearCart}
              className="text-xs text-red-700 hover:text-red-800 flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-red-50 border border-red-200 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
          {isMobileModal && (
            <button
              type="button"
              onClick={() => setShowMobileCartModal(false)}
              className="p-1.5 rounded-xl text-[#6F4534] hover:bg-[#6F4534]/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Dine In vs Take Away & Table Selection */}
      <div className="p-3.5 bg-[#FFFDF9] border-b border-[#6F4534]/15 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {(['Dine In', 'Take Away'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                orderType === type
                  ? 'bg-[#C8894A] text-white border-[#C8894A] shadow-xs'
                  : 'bg-[#F7F2EA] text-[#6F4534] border-[#6F4534]/20 hover:bg-[#6F4534]/10 hover:text-[#4A2C20]'
              }`}
            >
              <span>{type === 'Dine In' ? '🍽️ Dine In' : '🥡 Take Away'}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {orderType === 'Dine In' && (
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-[#F7F2EA] border border-[#6F4534]/20 text-xs text-[#4A2C20] rounded-xl px-3 py-2 outline-none focus:border-[#C8894A] font-semibold transition-colors"
            >
              {tableOptions.map((tbl) => (
                <option key={tbl} value={tbl} className="bg-[#FFFDF9] text-[#4A2C20]">
                  {tbl}
                </option>
              ))}
            </select>
          )}
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Nama Pelanggan (opsional)"
            className="flex-1 bg-[#F7F2EA] border border-[#6F4534]/20 text-xs text-[#4A2C20] rounded-xl px-3 py-2 placeholder-[#6F4534]/60 outline-none focus:border-[#C8894A] transition-colors"
          />
        </div>
      </div>

      {/* Items List in Cart */}
      <div className="p-3.5 divide-y divide-[#6F4534]/10 flex-1 max-h-[340px] overflow-y-auto space-y-2.5">
        {cart.length === 0 ? (
          <div className="py-12 text-center text-[#6F4534]/70 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F7F2EA] flex items-center justify-center mb-3 text-[#6F4534]/50">
              <Coffee className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#4A2C20]">Keranjang Masih Kosong</p>
            <p className="text-xs text-[#6F4534] mt-1 max-w-[200px]">
              Klik item menu di katalog untuk memasukkan pesanan
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.cartItemId} className="pt-2.5 first:pt-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#4A2C20] leading-snug truncate">
                    {item.product.name}
                  </p>
                  {/* Customization pills */}
                  <div className="flex flex-wrap items-center gap-1 mt-1 text-[10px] text-[#6F4534]">
                    {item.customization.temperature && (
                      <span className="bg-[#F7F2EA] px-1.5 py-0.5 rounded-md border border-[#6F4534]/20 font-medium">
                        {item.customization.temperature}
                      </span>
                    )}
                    {item.customization.sugarLevel && (
                      <span className="bg-[#F7F2EA] px-1.5 py-0.5 rounded-md border border-[#6F4534]/20 font-medium">
                        Gula: {item.customization.sugarLevel}
                      </span>
                    )}
                    {item.customization.milkOption?.includes('Oat') && (
                      <span className="bg-[#E5B567]/30 text-[#4A2C20] px-1.5 py-0.5 rounded-md border border-[#E5B567] font-semibold">
                        Oatmilk
                      </span>
                    )}
                    {item.customization.extraShot && (
                      <span className="bg-[#C8894A]/20 text-[#4A2C20] px-1.5 py-0.5 rounded-md border border-[#C8894A]/40 font-semibold">
                        +Shot
                      </span>
                    )}
                  </div>
                  {item.customization.notes && (
                    <p className="text-[10px] text-[#6F4534] italic mt-0.5 truncate">
                      "{item.customization.notes}"
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold font-mono text-[#C8894A] tabular-nums">
                    {formatRupiah(item.totalPrice)}
                  </span>
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#6F4534]/10">
                <span className="text-[10px] text-[#6F4534] font-mono tabular-nums">
                  @ {formatRupiah(item.itemPrice)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.cartItemId, -1)}
                    className="w-7 h-7 rounded-lg bg-[#F7F2EA] hover:bg-[#6F4534]/15 active:scale-95 text-[#4A2C20] border border-[#6F4534]/25 flex items-center justify-center transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-bold text-[#4A2C20] w-6 text-center font-mono tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(item.cartItemId, 1)}
                    className="w-7 h-7 rounded-lg bg-[#C8894A] hover:bg-[#b3753b] active:scale-95 text-white flex items-center justify-center transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="text-[#6F4534]/60 hover:text-red-600 p-1.5 ml-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Summary & Checkout Button */}
      <div className="p-4 bg-[#F7F2EA] border-t border-[#6F4534]/15 space-y-3 mt-auto">
        {/* Discount & Tax controls */}
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[#6F4534]/15">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDiscountPicker(!showDiscountPicker)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#C8894A] hover:underline"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>
                {discountAmount > 0
                  ? `Diskon: ${discountName} (-${formatRupiah(discountAmount)})`
                  : '+ Tambah Promo'}
              </span>
            </button>

            {showDiscountPicker && (
              <div className="absolute bottom-7 left-0 w-56 bg-[#FFFDF9] border border-[#6F4534]/20 rounded-2xl p-2.5 shadow-2xl z-30 space-y-1 text-left">
                <p className="text-[10px] font-bold text-[#6F4534] uppercase tracking-wider px-2 py-1">
                  Pilih Promo:
                </p>
                <button
                  type="button"
                  onClick={() => handleApplyDiscount(0, '')}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-[#6F4534] hover:bg-[#F7F2EA] rounded-xl font-medium"
                >
                  Tanpa Diskon (Rp 0)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDiscount(5000, 'Promo Kopi Pagi')}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-[#4A2C20] hover:bg-[#F7F2EA] rounded-xl flex justify-between items-center"
                >
                  <span>Promo Kopi Pagi</span>
                  <span className="text-[#C8894A] font-bold font-mono">-Rp 5k</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyDiscount(10000, 'Voucher Member')}
                  className="w-full text-left px-2.5 py-1.5 text-xs text-[#4A2C20] hover:bg-[#F7F2EA] rounded-xl flex justify-between items-center"
                >
                  <span>Voucher Member</span>
                  <span className="text-[#C8894A] font-bold font-mono">-Rp 10k</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyDiscount(Math.round(cartSubtotal * 0.1), 'Diskon Member 10%')
                  }
                  className="w-full text-left px-2.5 py-1.5 text-xs text-[#4A2C20] hover:bg-[#F7F2EA] rounded-xl flex justify-between items-center"
                >
                  <span>Member Kafein (10%)</span>
                  <span className="text-[#C8894A] font-bold font-mono">10%</span>
                </button>
              </div>
            )}
          </div>

          {/* PB1 10% Switch */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#6F4534] font-medium select-none">
            <input
              type="checkbox"
              checked={includeTax}
              onChange={(e) => setIncludeTax(e.target.checked)}
              className="rounded-sm accent-[#C8894A] w-3.5 h-3.5"
            />
            <span>PB1 (10%)</span>
          </label>
        </div>

        {/* Calculations Breakdown */}
        <div className="space-y-1.5 text-xs text-[#6F4534]">
          <div className="flex justify-between items-center">
            <span>Subtotal</span>
            <span className="font-mono text-[#4A2C20] font-semibold tabular-nums">
              {formatRupiah(cartSubtotal)}
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-700 font-medium">
              <span>Diskon ({discountName})</span>
              <span className="font-mono tabular-nums">-{formatRupiah(discountAmount)}</span>
            </div>
          )}
          {includeTax && (
            <div className="flex justify-between items-center">
              <span>Pajak Resto (PB1 10%)</span>
              <span className="font-mono text-[#4A2C20] font-semibold tabular-nums">
                {formatRupiah(cartTax)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-2 border-t border-[#6F4534]/15">
            <span className="text-sm font-bold text-[#4A2C20]">Total Bayar</span>
            <span className="text-xl font-bold font-mono text-[#4A2C20] tabular-nums">
              {formatRupiah(cartTotal)}
            </span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          id={isMobileModal ? 'mobile-btn-checkout-pay' : 'btn-checkout-pay'}
          type="button"
          disabled={cart.length === 0}
          onClick={() => {
            if (isMobileModal) setShowMobileCartModal(false);
            setShowPaymentModal(true);
          }}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] ${
            cart.length === 0
              ? 'bg-[#E5DEC9] text-[#6F4534]/40 cursor-not-allowed shadow-none'
              : 'bg-[#C8894A] hover:bg-[#b3753b] text-white shadow-[#C8894A]/25'
          }`}
        >
          <span>Proses Pembayaran ({formatRupiah(cartTotal)})</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Menu Grid & Search (8 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-[#FFFDF9] p-3.5 sm:p-4 rounded-2xl border border-[#6F4534]/15 shadow-xs space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#6F4534]/60 absolute left-3.5 top-3" />
              <input
                id="pos-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu kopi, latte, toast, v60..."
                className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl pl-10 pr-16 py-2.5 text-xs sm:text-sm text-[#4A2C20] placeholder-[#6F4534]/60 focus:outline-none focus:border-[#C8894A] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs font-semibold text-[#6F4534]/80 hover:text-[#4A2C20] px-1.5 py-0.5 rounded-md bg-[#FFFDF9]"
                >
                  Hapus
                </button>
              )}
            </div>

            {/* Category Pills with smooth horizontal scrolling */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  id={`cat-pill-${cat.key}`}
                  type="button"
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedCategory === cat.key
                      ? 'bg-[#C8894A] text-white border-[#C8894A] shadow-xs font-bold'
                      : 'bg-[#F7F2EA] text-[#6F4534] border-[#6F4534]/20 hover:bg-[#C8894A]/10 hover:text-[#4A2C20]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pb-20 lg:pb-0">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStock;

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  onClick={() => handleProductClick(product)}
                  className={`group relative bg-[#FFFDF9] rounded-2xl border transition-all overflow-hidden flex flex-col justify-between cursor-pointer ${
                    isOutOfStock
                      ? 'opacity-55 border-[#6F4534]/15 cursor-not-allowed'
                      : 'border-[#6F4534]/15 hover:border-[#C8894A] hover:shadow-md hover:shadow-[#C8894A]/10 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Image & Badges */}
                  <div className="relative h-32 sm:h-36 overflow-hidden bg-[#F7F2EA]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                    {/* Stock badge */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-md shadow-xs">
                          Stok Habis
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold bg-[#E5B567] text-[#4A2C20] px-2 py-0.5 rounded-md shadow-xs">
                          Sisa {product.stock}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-[#4A2C20]/80 text-[#FFFDF9] px-2 py-0.5 rounded-md backdrop-blur-xs">
                          Stok: {product.stock}
                        </span>
                      )}

                      {product.isPopular && !isOutOfStock && (
                        <span className="text-[9px] font-bold bg-[#C8894A] text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                          <Sparkles className="w-2.5 h-2.5" /> Favorit
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-[#4A2C20] line-clamp-1 group-hover:text-[#C8894A] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[11px] text-[#6F4534] line-clamp-2 mt-1 leading-snug">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-[#6F4534]/15 flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-[#4A2C20] font-mono tabular-nums">
                        {formatRupiah(product.price)}
                      </span>
                      <button
                        type="button"
                        disabled={isOutOfStock}
                        aria-label={`Tambah ${product.name}`}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isOutOfStock
                            ? 'bg-[#F7F2EA] text-[#6F4534]/40 cursor-not-allowed'
                            : 'bg-[#C8894A]/15 text-[#C8894A] hover:bg-[#C8894A] hover:text-white group-hover:scale-105 active:scale-95 shadow-xs'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-[#FFFDF9] rounded-2xl border border-[#6F4534]/15 p-12 text-center shadow-xs">
              <Coffee className="w-10 h-10 text-[#6F4534]/40 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#4A2C20]">Tidak ada menu yang sesuai</p>
              <p className="text-xs text-[#6F4534] mt-1">
                Coba ubah kata kunci pencarian atau kategori
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Cart & Bill Drawer (Desktop: 5 cols on lg, sticky) */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 bg-[#FFFDF9] border border-[#6F4534]/15 rounded-2xl shadow-md overflow-hidden flex-col sticky top-24">
          {renderCartContent(false)}
        </div>
      </div>

      {/* Floating Cart Bar for Mobile & Tablet (when cart has items) */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-3 left-3 right-3 z-40">
          <div className="bg-[#4A2C20] text-white rounded-2xl p-3 shadow-2xl border border-[#6F4534] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#C8894A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {cartItemCount}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#E5B567]">Total Pesanan</p>
                <p className="text-sm font-bold font-mono truncate tabular-nums">
                  {formatRupiah(cartTotal)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowMobileCartModal(true)}
              className="bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Lihat Pesanan</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Cart Drawer Modal */}
      {showMobileCartModal && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-[#4A2C20]/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#FFFDF9] rounded-t-3xl border-t border-[#6F4534]/20 max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {renderCartContent(true)}
          </div>
        </div>
      )}

      {/* Modals */}
      {customizingProduct && (
        <ItemCustomizerModal
          product={customizingProduct}
          onClose={() => setCustomizingProduct(null)}
          onAdd={(customization) => addToCart(customizingProduct, customization)}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          totalAmount={cartTotal}
          onClose={() => setShowPaymentModal(false)}
          onProcessPayment={handleProcessPayment}
        />
      )}

      {selectedTransactionForReceipt && (
        <ReceiptModal
          transaction={selectedTransactionForReceipt}
          onClose={() => setSelectedTransactionForReceipt(null)}
        />
      )}
    </div>
  );
};
