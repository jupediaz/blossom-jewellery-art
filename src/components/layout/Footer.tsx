"use client";

import { Instagram, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="bg-cream overflow-hidden">
      {/* Main footer grid */}
      <div className="mx-auto max-w-[1260px] px-6 lg:px-10 pt-16 pb-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <span className="font-heading text-[1.6rem] tracking-[0.22em] text-navy leading-none">
            BLOSSOM
          </span>
          <span className="text-[8px] font-body font-semibold tracking-[0.4em] uppercase text-terracotta mt-[3px]">
            by Olha
          </span>
        </div>

        {/* 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 text-center mb-12">
          {/* About */}
          <div>
            <h4 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-navy font-body mb-5">
              {t("sectionAbout")}
            </h4>
            <ul className="space-y-3 text-[13px] text-muted font-body">
              <li><Link href="/about" className="hover:text-navy transition-colors">{t("ourStory")}</Link></li>
              <li><Link href="/blog" className="hover:text-navy transition-colors">{t("journal")}</Link></li>
              <li><Link href="/about" className="hover:text-navy transition-colors">{t("ourMaterials")}</Link></li>
              <li><Link href="/contact" className="hover:text-navy transition-colors">{t("contactUs")}</Link></li>
            </ul>
          </div>

          {/* Store */}
          <div>
            <h4 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-navy font-body mb-5">
              {t("sectionStore")}
            </h4>
            <ul className="space-y-3 text-[13px] text-muted font-body">
              <li><Link href="/collections" className="hover:text-navy transition-colors">{t("collections")}</Link></li>
              <li><Link href="/products" className="hover:text-navy transition-colors">{t("allPieces")}</Link></li>
              <li><Link href="/products?sort=new" className="hover:text-navy transition-colors">{t("newArrivals")}</Link></li>
              <li><Link href="/shipping" className="hover:text-navy transition-colors">{t("shippingInfo")}</Link></li>
            </ul>
          </div>

          {/* Care */}
          <div>
            <h4 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-navy font-body mb-5">
              {t("sectionCare")}
            </h4>
            <ul className="space-y-3 text-[13px] text-muted font-body">
              <li><Link href="/shipping" className="hover:text-navy transition-colors">{t("shippingReturns")}</Link></li>
              <li><Link href="/size-guide" className="hover:text-navy transition-colors">{t("sizeGuide")}</Link></li>
              <li><Link href="/faq" className="hover:text-navy transition-colors">{t("faq")}</Link></li>
              <li><Link href="/privacy" className="hover:text-navy transition-colors">{t("privacyPolicy")}</Link></li>
              <li><Link href="/terms" className="hover:text-navy transition-colors">{t("termsOfService")}</Link></li>
            </ul>
          </div>
        </div>

        {/* Social + copyright */}
        <div className="flex flex-col items-center gap-4 text-center border-t border-cream-dark/60 pt-8">
          <div className="flex gap-5">
            <a
              href="https://instagram.com/blossombyolha"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-navy transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={17} strokeWidth={1.5} />
            </a>
            <a
              href="mailto:hello@blossombyolha.com"
              className="text-muted hover:text-navy transition-colors"
              aria-label="Email"
            >
              <Mail size={17} strokeWidth={1.5} />
            </a>
          </div>
          <p className="text-[11px] text-muted font-body">
            &copy; {new Date().getFullYear()} Blossom by Olha. {t("rights")}.
          </p>
        </div>
      </div>

      {/* Giant watermark at the very bottom */}
      <div aria-hidden="true" className="overflow-hidden leading-none select-none pointer-events-none">
        <div
          className="font-heading whitespace-nowrap"
          style={{ fontSize: "clamp(60px,11vw,160px)", color: "#EEE8E3", lineHeight: 0.95 }}
        >
          Anything less is
        </div>
        <div
          className="font-heading whitespace-nowrap"
          style={{ fontSize: "clamp(60px,11vw,160px)", color: "#EEE8E3", lineHeight: 0.95 }}
        >
          simply unacceptable.
        </div>
      </div>
    </footer>
  );
}
