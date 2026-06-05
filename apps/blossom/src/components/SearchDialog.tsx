"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SearchResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  collection: string | null;
}

export function SearchDialog() {
  const t = useTranslations("Search");
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden lg:block p-2 text-warm-gray hover:text-charcoal transition-colors"
        aria-label={t("title")}
      >
        <Search size={20} />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden mx-4">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-cream-dark">
            <Search size={18} className="text-warm-gray flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("placeholder")}
              className="flex-1 text-sm outline-none bg-transparent"
            />
            {loading && <Loader2 size={16} className="animate-spin text-warm-gray" />}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-warm-gray hover:text-charcoal"
            >
              <X size={16} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto">
            {query.length >= 2 && results.length === 0 && !loading && (
              <div className="px-4 py-8 text-center text-sm text-warm-gray">
                {t("noResults")}
              </div>
            )}

            {results.length > 0 && (
              <ul className="py-2">
                {results.map((product) => (
                  <li key={product._id}>
                    <Link
                      href={`/products/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-cream transition-colors"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-cream-dark">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="h-full w-full bg-cream-dark" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        {product.collection && (
                          <p className="text-xs text-warm-gray">{product.collection}</p>
                        )}
                      </div>
                      <span className="text-sm text-sage-dark flex-shrink-0">
                        {formatPrice(product.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-cream-dark bg-cream/50">
            <p className="text-xs text-warm-gray text-center">
              {t("hint")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
