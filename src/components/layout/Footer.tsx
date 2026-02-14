import Link from "next/link";
import { Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-heading text-2xl font-light tracking-wider">
              Blossom
            </h3>
            <p className="text-[10px] tracking-[0.3em] uppercase text-cream-dark -mt-1 mb-4">
              Jewellery Art
            </p>
            <p className="text-sm text-cream-dark leading-relaxed">
              Handcrafted artisan jewelry inspired by nature. Each piece is unique, made with love in Europe.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-heading text-lg mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-cream-dark">
              <li>
                <Link href="/products" className="hover:text-cream transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-cream transition-colors">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/products?category=earrings" className="hover:text-cream transition-colors">
                  Earrings
                </Link>
              </li>
              <li>
                <Link href="/products?category=necklaces" className="hover:text-cream transition-colors">
                  Necklaces
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-heading text-lg mb-4">Info</h4>
            <ul className="space-y-2 text-sm text-cream-dark">
              <li>
                <Link href="/about" className="hover:text-cream transition-colors">
                  About Olha
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-cream transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-cream transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cream transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter + Social */}
          <div>
            <h4 className="font-heading text-lg mb-4">Stay Connected</h4>
            <p className="text-sm text-cream-dark mb-4">
              Get updates on new collections and exclusive offers.
            </p>
            <form className="flex gap-2 mb-6">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-transparent border border-cream-dark/30 rounded px-3 py-2 text-sm text-cream placeholder:text-cream-dark/50 focus:outline-none focus:border-gold"
              />
              <button
                type="submit"
                className="bg-sage hover:bg-sage-dark text-white px-4 py-2 rounded text-sm transition-colors"
              >
                Join
              </button>
            </form>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream-dark hover:text-cream transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="mailto:hello@blossomjewelleryart.com"
                className="text-cream-dark hover:text-cream transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream-dark/20 text-center text-xs text-cream-dark">
          <p>&copy; {new Date().getFullYear()} Blossom Jewellery Art. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
