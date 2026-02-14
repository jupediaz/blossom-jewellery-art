"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
    <Link
      href={`/products/${product.slug.current}`}
      className="group block"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-cream-dark">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-warm-gray">
            <ShoppingBag size={40} />
          </div>
        )}

        {/* Sale badge */}
        {isOnSale && (
          <span className="absolute top-3 left-3 bg-dusty-rose text-white text-xs px-2 py-1 rounded">
            Sale
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-cream/60 flex items-center justify-center">
            <span className="bg-charcoal text-cream text-xs px-3 py-1.5 rounded">
              Sold Out
            </span>
          </div>
        )}

        {/* Quick add button */}
        {product.inStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={16} className="text-charcoal" />
          </button>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-medium text-charcoal group-hover:text-sage-dark transition-colors">
          {product.name}
        </h3>
        {product.category && (
          <p className="text-xs text-warm-gray">{product.category.name}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {formatPrice(product.price)}
          </span>
          {isOnSale && (
            <span className="text-xs text-warm-gray line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
