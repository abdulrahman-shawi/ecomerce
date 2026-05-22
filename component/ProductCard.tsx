"use client";

import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string | null;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(255,153,204,0.2)]">
      <div className="relative overflow-hidden aspect-square bg-gray-light">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg font-tajawal">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-pink text-white text-xs font-bold px-2 py-1 rounded-lg font-tajawal">
            -{discount}%
          </span>
        )}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-pink hover:text-white"
        >
          <Heart
            size={18}
            className={isWishlisted ? 'fill-red-500 text-red-500' : ''}
          />
        </button>
      </div>

      <div className="p-4 text-center">
        <h3 className="font-medium text-gray-dark mb-2 font-tajawal text-sm truncate">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-pink-dark font-bold font-tajawal">{product.price} ريال</span>
          {product.originalPrice && (
            <span className="text-gray-400 line-through text-sm font-tajawal">
              {product.originalPrice} ريال
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          className={`w-full py-2.5 rounded-full font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 font-tajawal ${
            added
              ? 'bg-green-500 text-white'
              : 'bg-pink text-white hover:bg-pink-dark'
          }`}
        >
          <ShoppingCart size={16} />
          {added ? 'تمت الإضافة!' : 'أضف للسلة'}
        </button>
      </div>
    </div>
  );
}
