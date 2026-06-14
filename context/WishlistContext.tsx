"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export interface WishlistItem {
  id: number;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  badge: string | null;
  description?: string | null;
  seoSlug?: string | null;
  stock?: number;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistIds: number[];
  toggleWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  isWishlisted: (id: number) => boolean;
  wishlistCount: number;
}

const WISHLIST_STORAGE_KEY = "ecommerce-wishlist";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getInitialWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(getInitialWishlist);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const isWishlisted = useCallback(
    (id: number) => wishlistItems.some((item) => item.id === id),
    [wishlistItems]
  );

  const toggleWishlist = useCallback((product: WishlistItem) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((id: number) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const wishlistIds = wishlistItems.map((item) => item.id);
  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistIds,
        toggleWishlist,
        removeFromWishlist,
        isWishlisted,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
