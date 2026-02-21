"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice, cn } from "@/lib/utils";
import { urlFor } from "@/lib/sanity/client";
import { useTranslations } from "next-intl";
import { PortableText } from "@portabletext/react";
import { WishlistButton } from "./WishlistButton";
import { useToast } from "@/components/Toast";
import type { Product } from "@/lib/types";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const t = useTranslations("Products");
  const tc = useTranslations("Common");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();
  const { addItem, openCart } = useCartStore();
  const { toast } = useToast();

  const sanityImages = product.images || [];
  const hasSanityImages = sanityImages.length > 0;
  const currentVariant = product.variants?.find(
    (v) => v.name === selectedVariant
  );
  const finalPrice = currentVariant?.priceModifier
    ? product.price + currentVariant.priceModifier
    : product.price;
  const isInStock = selectedVariant
    ? currentVariant?.inStock ?? product.inStock
    : product.inStock;

  const handleAddToCart = () => {
    const imageUrl = hasSanityImages
      ? urlFor(sanityImages[0]).width(200).url()
      : product.imageUrl || "";
    addItem({
      id: product._id,
      name: product.name,
      price: finalPrice,
      image: imageUrl,
      slug: product.slug.current,
      variant: selectedVariant,
    });
    toast({
      title: tc("addedToCart"),
      description: product.name,
      type: "success",
    });
    openCart();
  };

  const nextImage = () =>
    setSelectedImage((prev) => (prev + 1) % sanityImages.length);
  const prevImage = () =>
    setSelectedImage((prev) => (prev - 1 + sanityImages.length) % sanityImages.length);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-cream-dark">
          {hasSanityImages ? (
            <>
              <Image
                src={urlFor(sanityImages[selectedImage]).width(800).url()}
                alt={sanityImages[selectedImage].alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {sanityImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </>
          ) : product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-warm-gray">
              <ShoppingBag size={60} />
            </div>
          )}

          {/* Sale badge */}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="absolute top-4 left-4 bg-dusty-rose text-white text-xs px-3 py-1.5 rounded">
              {t("sale")}
            </span>
          )}
        </div>

        {/* Thumbnails (Sanity images only) */}
        {sanityImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {sanityImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors",
                  i === selectedImage
                    ? "border-charcoal"
                    : "border-transparent hover:border-cream-dark"
                )}
              >
                <Image
                  src={urlFor(img).width(100).url()}
                  alt={img.alt || `${product.name} thumbnail ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex flex-col">
        {product.collection && (
          <Link
            href={`/collections/${product.collection.slug.current}`}
            className="text-xs text-sage tracking-wide uppercase mb-2 hover:text-sage-dark transition-colors"
          >
            {product.collection.name}
          </Link>
        )}
        {!product.collection && product.category && (
          <p className="text-xs text-warm-gray tracking-wide uppercase mb-2">
            {product.category.name}
          </p>
        )}

        <div className="flex items-start justify-between gap-2">
          <h1 className="font-heading text-3xl lg:text-4xl font-light mb-4">
            {product.name}
          </h1>
          <WishlistButton productId={product._id} variant={selectedVariant} />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-xl font-medium">{formatPrice(finalPrice)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-warm-gray line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">{t("options")}</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => (
                <button
                  key={variant.name}
                  onClick={() => setSelectedVariant(variant.name)}
                  disabled={!variant.inStock}
                  className={cn(
                    "text-sm px-4 py-2 rounded border transition-colors",
                    selectedVariant === variant.name
                      ? "bg-charcoal text-cream border-charcoal"
                      : variant.inStock
                      ? "border-cream-dark hover:border-charcoal"
                      : "border-cream-dark text-warm-gray/50 cursor-not-allowed line-through"
                  )}
                >
                  {variant.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!isInStock}
          className={cn(
            "w-full py-3.5 rounded text-sm tracking-wide transition-colors flex items-center justify-center gap-2 mb-8",
            isInStock
              ? "bg-charcoal text-cream hover:bg-charcoal/90"
              : "bg-cream-dark text-warm-gray cursor-not-allowed"
          )}
        >
          <ShoppingBag size={16} />
          {isInStock ? tc("addToCart") : t("soldOut")}
        </button>

        {/* Description */}
        {product.description && Array.isArray(product.description) && product.description.length > 0 && (
          <div className="prose prose-sm text-warm-gray mb-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <PortableText value={product.description as any} />
          </div>
        )}

        {/* Details */}
        <div className="space-y-4 text-sm border-t border-cream-dark pt-6">
          {product.materials && product.materials.length > 0 && (
            <div>
              <span className="font-medium">{t("materials")}:</span>{" "}
              <span className="text-warm-gray">
                {product.materials.join(", ")}
              </span>
            </div>
          )}
          {product.dimensions && (
            <div>
              <span className="font-medium">{t("dimensions")}:</span>{" "}
              <span className="text-warm-gray">{product.dimensions}</span>
            </div>
          )}
          {product.careInstructions && (
            <div>
              <span className="font-medium">{t("care")}:</span>{" "}
              <span className="text-warm-gray">
                {product.careInstructions}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
