"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface BuyNowButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
}

export default function BuyNowButton({ product }: BuyNowButtonProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    router.push("/checkout");
  };

  return (
    <button
      onClick={handleBuyNow}
      className="flex-1 py-4 rounded-full font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 font-tajawal bg-pink text-white hover:bg-pink-dark"
    >
      <ShoppingCart size={20} />
      اشتري الآن
    </button>
  );
}
