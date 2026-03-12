"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/types";

export interface ActiveOffer {
  id: string;
  discountType: string;
  discountValue: number;
  badgeText?: string | null;
  validUntil: string;
}

interface ProductCardProps {
  product: Product;
  offer?: ActiveOffer;
  isNew?: boolean;
}

export function ProductCard({ product, offer, isNew }: ProductCardProps) {
  const t = useTranslations("Products");
  const tc = useTranslations("Common");
  const { addItem, openCart } = useCartStore();

  // Compute offer-based discounted price
  const offerDiscountedPrice = offer
    ? offer.discountType === "PERCENTAGE"
      ? product.price * (1 - offer.discountValue / 100)
      : Math.max(0, product.price - offer.discountValue)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product._id,
      name: product.name,
      price: offerDiscountedPrice ?? product.price,
      image: product.imageUrl || "",
      slug: product.slug.current,
    });
    openCart();
  };

  const isOnSale =
    (product.compareAtPrice && product.compareAtPrice > product.price) ||
    !!offer;

  // Badge label: prefer offer.badgeText, then discount string, then generic "Sale"
  const saleBadgeLabel = offer
    ? offer.badgeText ||
      (offer.discountType === "PERCENTAGE"
        ? `-${offer.discountValue}%`
        : `-€${offer.discountValue}`)
    : t("sale");

  // Display price: offer discounted > product price
  const displayPrice = offerDiscountedPrice ?? product.price;
  // Strike-through price when an offer is active (use product.price as original)
  const strikethroughPrice = offer
    ? product.price
    : product.compareAtPrice && product.compareAtPrice > product.price
    ? product.compareAtPrice
    : null;

  return (
    <Link href={`/products/${product.slug.current}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-beige/30 mb-5">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <ShoppingBag size={36} strokeWidth={1} />
          </div>
        )}

        {/* Badges */}
        {isOnSale && (
          <span className="absolute top-3 left-3 text-[9px] font-semibold tracking-[0.12em] uppercase bg-terracotta text-cream px-2.5 py-1 font-body">
            {saleBadgeLabel}
          </span>
        )}
        {isNew && !isOnSale && (
          <span className="absolute top-3 right-3 text-[9px] font-semibold tracking-[0.12em] uppercase bg-navy text-cream px-2.5 py-1 font-body">
            {t("newBadge")}
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-cream/50 flex items-center justify-center">
            <span className="text-[9px] font-semibold tracking-[0.12em] uppercase bg-navy text-cream px-4 py-1.5 font-body">
              {t("soldOut")}
            </span>
          </div>
        )}

        {/* Quick add — full-width bar on hover */}
        {product.inStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-0 inset-x-0 bg-navy/90 text-cream text-[9px] font-semibold tracking-[0.18em] uppercase py-3 opacity-0 group-hover:opacity-100 transition-opacity font-body flex items-center justify-center gap-2"
            aria-label={`${tc("addToCart")} ${product.name}`}
          >
            <ShoppingBag size={12} strokeWidth={1.5} />
            {tc("addToCart")}
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-navy font-body leading-tight group-hover:text-terracotta transition-colors">
          {product.name}
        </p>
        <div className="flex flex-col items-end flex-shrink-0">
          <p
            className={`text-[10px] font-semibold font-body whitespace-nowrap ${
              offer ? "text-terracotta" : "text-navy"
            }`}
          >
            €{displayPrice.toFixed(2)}
          </p>
          {strikethroughPrice && (
            <p className="text-[9px] text-muted line-through font-body whitespace-nowrap">
              €{strikethroughPrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
      {(product.collection || product.category) && (
        <p className="text-[11px] text-muted font-body">
          {product.collection?.name || product.category?.name || "handmade"}
          {" · "}
          <span>jewellery</span>
        </p>
      )}
      {offer && (
        <p className="text-[9px] text-terracotta font-body mt-0.5">
          {t("saleEnds", {
            date: new Date(offer.validUntil).toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
            }),
          })}
        </p>
      )}
    </Link>
  );
}
