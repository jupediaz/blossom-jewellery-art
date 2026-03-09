"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useTranslations } from "next-intl";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("Products");
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || "",
      slug: product.slug.current,
    });
    openCart();
  };

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

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
            {t("sale")}
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
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={12} strokeWidth={1.5} />
            Add to Cart
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-navy font-body leading-tight group-hover:text-terracotta transition-colors">
          {product.name}
        </p>
        <p className="text-[10px] font-semibold text-navy font-body whitespace-nowrap flex-shrink-0">
          ${product.price.toFixed(2)}
        </p>
      </div>
      {(product.collection || product.category) && (
        <p className="text-[11px] text-muted font-body">
          {product.collection?.name || product.category?.name || "handmade"}
          {" · "}
          <span>jewellery</span>
        </p>
      )}
      {isOnSale && (
        <p className="text-[10px] text-muted line-through font-body mt-0.5">
          ${product.compareAtPrice!.toFixed(2)}
        </p>
      )}
    </Link>
  );
}
