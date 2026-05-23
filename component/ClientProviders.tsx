"use client";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import type { ReactNode } from "react";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
