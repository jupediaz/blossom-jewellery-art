"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Menu, X, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCartStore } from "@/lib/store/cart";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SearchDialog } from "@/components/SearchDialog";
import { useSession } from "next-auth/react";

function AccountButton() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const href =
    status !== "loading" && (role === "ADMIN" || role === "STORE_OWNER")
      ? "/admin"
      : "/account";

  return (
    <Link
      href={href}
      className="p-2 text-muted hover:text-navy transition-colors"
      aria-label="My account"
    >
      <User size={18} strokeWidth={1.5} />
    </Link>
  );
}

function NavLink({
  href,
  children,
  showDash,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  showDash?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href as "/"}
      onClick={onClick}
      className="relative flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-navy hover:text-terracotta transition-colors font-body after:absolute after:bottom-[-3px] after:left-0 after:h-px after:w-0 after:bg-terracotta after:transition-all after:duration-300 hover:after:w-full"
    >
      {showDash && <span className="block w-4 h-px bg-current flex-shrink-0" />}
      {children}
    </Link>
  );
}

export function Header() {
  const t = useTranslations("Nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCart, totalItems } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  const itemCount = mounted ? totalItems() : 0;

  const navLeft = [
    { name: t("shop"), href: "/products", dash: false },
    { name: t("about"), href: "/about", dash: true },
    { name: t("collections"), href: "/collections", dash: true },
  ];
  const navRight = [
    { name: t("blog"), href: "/blog", dash: false },
    { name: t("contact"), href: "/contact", dash: false },
  ];

  return (
    <header className="sticky top-0 z-50 bg-cream/96 backdrop-blur-sm border-b border-cream-dark/60">
      <nav className="mx-auto max-w-[1260px] px-6 lg:px-10">
        <div className="flex h-[78px] items-center justify-between">

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>

          {/* Desktop left nav */}
          <div className="hidden lg:flex lg:items-center lg:gap-x-8">
            {navLeft.map((item) => (
              <NavLink key={item.href} href={item.href} showDash={item.dash}>
                {item.name}
              </NavLink>
            ))}
          </div>

          {/* Logo — center */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none"
          >
            <span className="font-heading text-[1.55rem] tracking-[0.22em] text-navy leading-none">
              BLOSSOM
            </span>
            <span className="text-[8px] font-body font-semibold tracking-[0.4em] uppercase text-terracotta mt-[3px]">
              by Olha
            </span>
          </Link>

          {/* Desktop right nav + icons */}
          <div className="flex items-center gap-x-6">
            <div className="hidden lg:flex lg:items-center lg:gap-x-8">
              {navRight.map((item) => (
                <NavLink key={item.href} href={item.href} showDash={item.dash}>
                  {item.name}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-x-1">
              <LanguageSwitcher />
              <SearchDialog />
              <AccountButton />
              <button
                onClick={openCart}
                className="relative p-2 text-muted hover:text-navy transition-colors"
                aria-label={t("cart")}
              >
                <ShoppingBag size={18} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-[16px] w-[16px] items-center justify-center bg-terracotta text-cream text-[9px] font-semibold font-body leading-none">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-96 pb-5" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-y-4 pt-4 border-t border-cream-dark/60">
            {[...navLeft, ...navRight].map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                showDash={item.dash}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
            <NavLink href="/account" onClick={() => setMobileMenuOpen(false)}>
              My Account
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}
