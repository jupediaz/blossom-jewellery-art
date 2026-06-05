"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/analytics";
import { useCartStore } from "@/lib/store/cart";

export function PurchaseTracker({
  orderId,
  total,
  shipping,
  coupon,
}: {
  orderId: string;
  total: number;
  shipping?: number;
  coupon?: string;
}) {
  const tracked = useRef(false);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      clearCart();
      trackPurchase({
        id: orderId,
        value: total,
        shipping,
        coupon,
      });
    }
  }, [orderId, total, shipping, coupon, clearCart]);

  return null;
}
