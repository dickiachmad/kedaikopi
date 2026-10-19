import React, { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Product, CartCustomization } from '../../types';
import { formatRupiah } from '../../utils/formatters';

interface ItemCustomizerModalProps {
  product: Product;
  onClose: () => void;
  onAdd: (customization: CartCustomization) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  product,
  onClose,
  onAdd,
}) => {
  const isDrink = product.category === 'coffee' || product.category === 'signature' || product.category === 'non-coffee';
  
  const [temperature, setTemperature] = useState<'Hot' | 'Iced'>(
    product.name.toLowerCase().includes('es') ? 'Iced' : 'Hot'
  );
  const [sugarLevel, setSugarLevel] = useState<'100%' | '70%' | '50%' | '0%'>('100%');
  const [extraShot, setExtraShot] = useState(false);
  const [milkOption, setMilkOption] = useState<'Reguler' | 'Oatmilk (+Rp6k)'>('Reguler');
  const [notes, setNotes] = useState('');

  const calculateItemPrice = () => {
    let price = product.price;
    if (extraShot) price += 5000;
    if (milkOption === 'Oatmilk (+Rp6k)') price += 6000;
    return price;
  };

  const handleConfirm = () => {
    onAdd({
      temperature: isDrink ? temperature : undefined,
      sugarLevel: isDrink ? sugarLevel : undefined,
      extraShot: isDrink ? extraShot : undefined,
      milkOption: isDrink && product.category !== 'beans' ? milkOption : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#FFFDF9] border border-[#6F4534]/20 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-[#4A2C20]">
        {/* Header */}
        <div className="relative h-32 bg-[#4A2C20] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover opacity-70"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="font-serif text-lg font-bold text-white leading-tight">{product.name}</h3>
            <p className="text-xs text-[#E5B567] font-semibold">{formatRupiah(product.price)}</p>
          </div>
        </div>

        {/* Options */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Temperature */}
          {isDrink && (
            <div>
              <label className="text-xs font-bold text-[#6F4534] block mb-2">Suhu Penyajian</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Hot', 'Iced'] as const).map((temp) => (
                  <button
                    key={temp}
                    type="button"
                    onClick={() => setTemperature(temp)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                      temperature === temp
                        ? 'bg-[#C8894A] text-white border-[#C8894A] shadow-xs'
                        : 'bg-[#F7F2EA] text-[#6F4534] border-[#6F4534]/20 hover:bg-[#6F4534]/10'
                    }`}
                  >
                    <span>{temp === 'Hot' ? 'Panas (Hot)' : 'Dingin (Iced)'}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugar Level */}
          {isDrink && product.category !== 'beans' && (
            <div>
              <label className="text-xs font-bold text-[#6F4534] block mb-2">Level Manis / Gula</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['100%', '70%', '50%', '0%'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSugarLevel(lvl)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                      sugarLevel === lvl
                        ? 'bg-[#C8894A] text-white border-[#C8894A]'
                        : 'bg-[#F7F2EA] text-[#6F4534] border-[#6F4534]/20 hover:bg-[#6F4534]/10'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extra Shot & Oat Milk */}
          {isDrink && product.category !== 'beans' && (
            <div className="space-y-2 pt-1 border-t border-[#6F4534]/15">
              <label className="text-xs font-bold text-[#6F4534] block mb-1">Pilihan Tambahan (Add-ons)</label>
              
              {/* Extra shot */}
              <button
                type="button"
                onClick={() => setExtraShot(!extraShot)}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  extraShot
                    ? 'bg-[#E5B567]/25 border-[#C8894A] text-[#4A2C20]'
                    : 'bg-[#F7F2EA] border-[#6F4534]/20 text-[#6F4534]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${extraShot ? 'bg-[#C8894A] border-[#C8894A] text-white' : 'border-[#6F4534]/40'}`}>
                    {extraShot && <Check className="w-3 h-3" />}
                  </div>
                  <span className="font-medium">Extra Espresso Shot</span>
                </div>
                <span className="font-semibold text-[#C8894A]">+Rp 5.000</span>
              </button>

              {/* Milk Option */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(['Reguler', 'Oatmilk (+Rp6k)'] as const).map((milk) => (
                  <button
                    key={milk}
                    type="button"
                    onClick={() => setMilkOption(milk)}
                    className={`p-2 rounded-xl border text-xs text-left transition-all ${
                      milkOption === milk
                        ? 'bg-[#E5B567]/30 border-[#C8894A] text-[#4A2C20]'
                        : 'bg-[#F7F2EA] border-[#6F4534]/20 text-[#6F4534]'
                    }`}
                  >
                    <p className="font-semibold">{milk === 'Reguler' ? 'Susu Fresh Milk' : 'Oatmilk Barista'}</p>
                    <p className="text-[10px] text-[#6F4534]/80">{milk === 'Reguler' ? 'Standar' : '+Rp 6.000'}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-[#6F4534] block mb-1">Catatan Pesanan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Es sedikit, bawa cup sendiri, dsb."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#F7F2EA] border border-[#6F4534]/20 rounded-xl px-3 py-2 text-xs text-[#4A2C20] placeholder-[#6F4534]/60 focus:outline-none focus:border-[#C8894A]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F7F2EA] border-t border-[#6F4534]/15 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#6F4534] block">Total Item</span>
            <span className="text-base font-bold text-[#4A2C20] font-mono">
              {formatRupiah(calculateItemPrice())}
            </span>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#C8894A] hover:bg-[#b3753b] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#C8894A]/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Masukkan Keranjang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
