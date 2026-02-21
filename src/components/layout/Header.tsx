"use client";

import { useState } from "react";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchDialog } from "@/components/SearchDialog";

export function Header() {
  const t = useTranslations("Nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCart, totalItems } = useCartStore();
  const itemCount = totalItems();

  const navigation = [
    { name: t("shop"), href: "/products" as const },
    { name: t("collections"), href: "/collections" as const },
    { name: t("about"), href: "/about" as const },
    { name: t("blog"), href: "/blog" as const },
    { name: t("contact"), href: "/contact" as const },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sage/40">
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
          <div className="flex items-center gap-x-4">
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

            <LanguageSwitcher />

            <SearchDialog />

            <button
              onClick={openCart}
              className="relative p-2 text-warm-gray hover:text-charcoal transition-colors"
              aria-label={t("cart")}
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-dusty-rose text-white text-xs">
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
