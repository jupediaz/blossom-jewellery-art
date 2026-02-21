"use client";

import { Instagram, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NewsletterForm } from "@/components/NewsletterForm";

export function Footer() {
  const t = useTranslations("Footer");

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
              {t("tagline")}
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-heading text-lg mb-4">{t("shop")}</h4>
            <ul className="space-y-2 text-sm text-cream-dark">
              <li>
                <Link href="/products" className="hover:text-cream transition-colors">
                  {t("shop")}
                </Link>
              </li>
              <li>
                <Link href="/collections" className="hover:text-cream transition-colors">
                  {t("collections")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-heading text-lg mb-4">{t("help")}</h4>
            <ul className="space-y-2 text-sm text-cream-dark">
              <li>
                <Link href="/about" className="hover:text-cream transition-colors">
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-cream transition-colors">
                  {t("shippingReturns")}
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-cream transition-colors">
                  {t("sizeGuide")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cream transition-colors">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter + Social */}
          <div>
            <h4 className="font-heading text-lg mb-4">{t("connect")}</h4>
            <div className="mb-6">
              <NewsletterForm variant="dark" />
            </div>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/blossomjewelleryart"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream-dark hover:text-cream transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="mailto:hello@blossomjewellery.art"
                className="text-cream-dark hover:text-cream transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-cream-dark/20 text-center text-xs text-cream-dark">
          <p>
            &copy; {new Date().getFullYear()} Blossom Jewellery Art. {t("rights")}.
          </p>
          <p className="mt-1">{t("madeWith")}</p>
        </div>
      </div>
    </footer>
  );
}
