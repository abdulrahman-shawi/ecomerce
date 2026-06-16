"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import { useSettings } from "@/context/SettingsContext";
import { getCurrencySymbol } from "@/lib/currency";

export default function TopBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { siteCurrency } = useSettings();
  const currencySymbol = getCurrencySymbol(siteCurrency);

  if (!isVisible) return null;

  return (
    <div className="bg-pink text-white h-10 flex items-center justify-center relative animate-in slide-in-from-top duration-500">
      <p className="text-sm font-medium font-tajawal">
        شحن مجاني للطلبات فوق 299{currencySymbol} | توصيل سريع خلال 2-5 أيام
      </p>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
