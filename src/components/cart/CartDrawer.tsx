"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-cream z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark">
          <h2 className="font-heading text-xl">Your Cart</h2>
          <button
            onClick={closeCart}
            className="p-1 text-warm-gray hover:text-charcoal transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-warm-gray">
              <ShoppingBag size={48} className="mb-4 opacity-30" />
              <p className="text-sm">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="mt-4 text-sm text-sage hover:text-sage-dark underline transition-colors"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.id}__${item.variant || ""}`}
                  className="flex gap-4 py-3 border-b border-cream-dark/50"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded bg-cream-dark">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-warm-gray">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-medium">{item.name}</h3>
                      {item.variant && (
                        <p className="text-xs text-warm-gray">{item.variant}</p>
                      )}
                      <p className="text-sm text-sage-dark mt-0.5">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1,
                              item.variant
                            )
                          }
                          className="p-1 text-warm-gray hover:text-charcoal"
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
                          className="p-1 text-warm-gray hover:text-charcoal"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.variant)}
                        className="text-xs text-warm-gray hover:text-dusty-rose-dark underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-cream-dark px-6 py-4 space-y-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span className="font-medium">{formatPrice(totalPrice())}</span>
            </div>
            <p className="text-xs text-warm-gray">
              Shipping calculated at checkout
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-charcoal text-cream text-center py-3 rounded hover:bg-charcoal/90 transition-colors text-sm tracking-wide"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </Fragment>
  );
}
