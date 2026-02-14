"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCartStore();

  const handleCheckout = async () => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-warm-gray/30 mb-6" />
        <h1 className="font-heading text-3xl font-light mb-4">
          Your Cart is Empty
        </h1>
        <p className="text-warm-gray mb-8">
          Discover our handcrafted jewelry collection.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
        >
          Shop Now
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-3xl font-light mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.id}__${item.variant || ""}`}
              className="flex gap-4 p-4 bg-white rounded-lg"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-cream-dark">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-warm-gray">
                    <ShoppingBag size={24} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-medium hover:text-sage-dark transition-colors"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-warm-gray mt-0.5">
                        {item.variant}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 border border-cream-dark rounded">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity - 1,
                          item.variant
                        )
                      }
                      className="p-1.5 text-warm-gray hover:text-charcoal"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.quantity + 1,
                          item.variant
                        )
                      }
                      className="p-1.5 text-warm-gray hover:text-charcoal"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, item.variant)}
                    className="p-1.5 text-warm-gray hover:text-dusty-rose-dark transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-xs text-warm-gray hover:text-dusty-rose-dark underline"
          >
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg p-6 h-fit sticky top-24">
          <h2 className="font-heading text-xl mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-warm-gray">Subtotal</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm-gray">Shipping</span>
              <span className="text-warm-gray">Calculated at checkout</span>
            </div>
            <div className="border-t border-cream-dark pt-3 flex justify-between font-medium">
              <span>Total</span>
              <span>{formatPrice(totalPrice())}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full mt-6 bg-charcoal text-cream py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
          >
            Proceed to Checkout
          </button>
          <p className="text-xs text-warm-gray text-center mt-3">
            Secure checkout powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
