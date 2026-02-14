"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Shop", href: "/products" },
  { name: "Collections", href: "/collections" },
  { name: "About", href: "/about" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCart, totalItems } = useCartStore();
  const itemCount = totalItems();

  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-cream-dark">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-charcoal"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <div className="hidden lg:flex lg:gap-x-8">
            {navigation.slice(0, 2).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm tracking-wide text-warm-gray hover:text-charcoal transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Logo */}
          <Link href="/" className="flex flex-col items-center">
            <span className="font-heading text-2xl font-light tracking-wider text-charcoal">
              Blossom
            </span>
            <span className="text-[10px] tracking-[0.3em] uppercase text-warm-gray -mt-1">
              Jewellery Art
            </span>
          </Link>

          {/* Right nav + cart */}
          <div className="flex items-center gap-x-6">
            <div className="hidden lg:flex lg:gap-x-8">
              {navigation.slice(2).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm tracking-wide text-warm-gray hover:text-charcoal transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <button
              className="hidden lg:block p-2 text-warm-gray hover:text-charcoal transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button
              onClick={openCart}
              className="relative p-2 text-warm-gray hover:text-charcoal transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage text-white text-xs">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-64 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-y-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm tracking-wide text-warm-gray hover:text-charcoal transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
