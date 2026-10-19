import React from 'react';
import {
  Coffee,
  Flame,
  CupSoda,
  Sparkles,
  Store,
  Heart,
  Zap,
} from 'lucide-react';
import { ShopBranding, PresetIconName } from '../../types';

interface BrandLogoProps {
  branding: ShopBranding;
  className?: string;
  iconClassName?: string;
  containerClassName?: string;
}

export const renderPresetIcon = (iconName: PresetIconName, className: string = 'w-6 h-6') => {
  switch (iconName) {
    case 'Flame':
      return <Flame className={className} />;
    case 'CupSoda':
      return <CupSoda className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Store':
      return <Store className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Coffee':
    default:
      return <Coffee className={className} />;
  }
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  branding,
  className = 'w-10 h-10 sm:w-12 sm:h-12',
  iconClassName = 'w-6 h-6 stroke-[2.2]',
  containerClassName = 'w-full h-full bg-[#4A2C20] rounded-[10px] flex items-center justify-center text-[#E5B567] overflow-hidden',
}) => {
  return (
    <div
      className={`${className} rounded-xl bg-gradient-to-br from-[#C8894A] to-[#6F4534] p-0.5 shadow-md shadow-[#4A2C20]/40 flex items-center justify-center shrink-0`}
    >
      <div className={containerClassName}>
        {branding.logoType === 'custom' && branding.customLogoUrl ? (
          <img
            src={branding.customLogoUrl}
            alt={branding.storeName}
            className="w-full h-full object-cover rounded-[8px]"
          />
        ) : (
          renderPresetIcon(branding.presetIcon, iconClassName)
        )}
      </div>
    </div>
  );
};
