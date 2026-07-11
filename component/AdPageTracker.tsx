"use client";

import { useEffect } from "react";

interface AdPageTrackerProps {
  productId: number;
}

export default function AdPageTracker({ productId }: AdPageTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const path = window.location.pathname;
    const sessionKey = `ad-page-visit:${productId}:${path}`;

    if (window.sessionStorage.getItem(sessionKey)) {
      return;
    }

    window.sessionStorage.setItem(sessionKey, "1");

    void fetch("/api/ad/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productId, path }),
      keepalive: true,
    }).catch(() => {
      window.sessionStorage.removeItem(sessionKey);
    });
  }, [productId]);

  return null;
}