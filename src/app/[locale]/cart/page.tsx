"use client";

import Image from "next/image";
import { Link } from '@/i18n/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Loader2, Truck } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { trackBeginCheckout } from "@/lib/analytics";
import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect, useCallback } from "react";

interface ShippingMethodOption {
  id: string;
  name: string;
  rate: number;
  originalRate: number;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  freeShipping: boolean;
}

const COUNTRIES = [
  { code: "ES", name: "Spain" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "IE", name: "Ireland" },
  { code: "PL", name: "Poland" },
  { code: "SE", name: "Sweden" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "GR", name: "Greece" },
  { code: "RO", name: "Romania" },
  { code: "HU", name: "Hungary" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "BR", name: "Brazil" },
  { code: "UA", name: "Ukraine" },
  { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" },
];

export default function CartPage() {
  const t = useTranslations("Cart");
  const tc = useTranslations("Common");
  const locale = useLocale();
  const { items, removeItem, updateQuantity, totalPrice, clearCart } =
    useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discount: number;
    freeShipping: boolean;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);

  const fetchShipping = useCallback(async (country: string, sub: number) => {
    setShippingLoading(true);
    try {
      const res = await fetch("/api/shipping/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryCode: country, subtotal: sub }),
      });
      if (res.ok) {
        const data = await res.json();
        setShippingMethods(data.methods);
        setFreeShippingThreshold(data.freeShippingThreshold);
        if (data.methods.length > 0) {
          setSelectedShipping(data.methods[0].id);
        }
      }
    } catch {
      setShippingMethods([]);
    } finally {
      setShippingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCountry && items.length > 0) {
      fetchShipping(selectedCountry, totalPrice());
    }
  }, [selectedCountry, items.length, fetchShipping, totalPrice]);

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          subtotal: totalPrice(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCouponError(data.error || t("couponInvalid"));
        setCouponApplied(null);
      } else {
        setCouponApplied({
          code: data.code,
          discount: data.discountAmount,
          freeShipping: data.freeShipping,
        });
        setCouponError("");
      }
    } catch {
      setCouponError(t("couponInvalid"));
    } finally {
      setCouponLoading(false);
    }
  }

  const handleCheckout = async () => {
    setCheckingOut(true);
    trackBeginCheckout(totalPrice());
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          couponCode: couponApplied?.code,
          locale,
          shippingMethodId: selectedShipping || undefined,
          countryCode: selectedCountry || undefined,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckingOut(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-warm-gray/30 mb-6" />
        <h1 className="font-heading text-3xl font-light mb-4">
          {t("empty")}
        </h1>
        <p className="text-warm-gray mb-8">
          {t("emptyText")}
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
        >
          {tc("continueShopping")}
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice();
  const discount = couponApplied?.discount || 0;
  const selectedShippingMethod = shippingMethods.find((m) => m.id === selectedShipping);
  const shippingCost = selectedShippingMethod?.rate || 0;
  const displayTotal = subtotal - discount + shippingCost;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-3xl font-light mb-8">{t("title")}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.id}__${item.variant || ""}`}
              className="flex gap-4 p-4 bg-white rounded-lg"
            >
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded bg-cream-dark">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-warm-gray">
                    <ShoppingBag size={24} />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="text-sm font-medium hover:text-sage-dark transition-colors"
                    >
                      {item.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs text-warm-gray mt-0.5">
                        {item.variant}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 border border-cream-dark rounded">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1, item.variant)
                      }
                      className="p-1.5 text-warm-gray hover:text-charcoal"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1, item.variant)
                      }
                      className="p-1.5 text-warm-gray hover:text-charcoal"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id, item.variant)}
                    className="p-1.5 text-warm-gray hover:text-dusty-rose-dark transition-colors"
                    aria-label={t("remove")}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-xs text-warm-gray hover:text-dusty-rose-dark underline"
          >
            {t("remove")}
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg p-6 h-fit sticky top-24">
          <h2 className="font-heading text-xl mb-4">{t("orderSummary")}</h2>

          {/* Coupon Input */}
          <div className="mb-4">
            {couponApplied ? (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">
                    {couponApplied.code}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCouponApplied(null);
                    setCouponCode("");
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-800"
                >
                  {tc("delete")}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                    placeholder={t("couponPlaceholder")}
                    className="flex-1 rounded-lg border border-cream-dark px-3 py-2 text-sm focus:border-charcoal focus:outline-none"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="rounded-lg bg-charcoal px-3 py-2 text-sm text-white hover:bg-charcoal/90 disabled:opacity-50"
                  >
                    {couponLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t("applyCoupon")
                    )}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-1 text-xs text-red-500">{couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* Shipping */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              <Truck size={14} className="inline mr-1.5" />
              {t("shippingCountry")}
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full rounded-lg border border-cream-dark px-3 py-2 text-sm focus:border-charcoal focus:outline-none bg-white"
            >
              <option value="">{t("selectCountry")}</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>

            {shippingLoading && (
              <div className="flex items-center gap-2 mt-2 text-xs text-warm-gray">
                <Loader2 size={12} className="animate-spin" />
                {tc("loading")}
              </div>
            )}

            {shippingMethods.length > 0 && !shippingLoading && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-medium text-warm-gray">{t("shippingMethod")}</p>
                {shippingMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                      selectedShipping === method.id
                        ? "border-charcoal bg-charcoal/5"
                        : "border-cream-dark hover:border-warm-gray"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={selectedShipping === method.id}
                        onChange={() => setSelectedShipping(method.id)}
                        className="accent-charcoal"
                      />
                      <div>
                        <span className="text-sm">{method.name}</span>
                        <p className="text-xs text-warm-gray">
                          {t("estimatedDays", { min: method.estimatedDaysMin, max: method.estimatedDaysMax })}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {method.freeShipping ? tc("free") : formatPrice(method.rate)}
                    </span>
                  </label>
                ))}
                {freeShippingThreshold && !shippingMethods[0]?.freeShipping && subtotal < freeShippingThreshold && (
                  <p className="text-xs text-sage-dark">
                    {t("freeShippingNote", { amount: formatPrice(freeShippingThreshold) })}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-warm-gray">{tc("subtotal")}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{tc("discount")}</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-warm-gray">{tc("shipping")}</span>
              <span>
                {selectedShippingMethod
                  ? selectedShippingMethod.freeShipping
                    ? tc("free")
                    : formatPrice(shippingCost)
                  : t("shippingNote")}
              </span>
            </div>
            <div className="border-t border-cream-dark pt-3 flex justify-between font-medium">
              <span>{tc("total")}</span>
              <span>{formatPrice(displayTotal)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkingOut}
            className="w-full mt-6 bg-charcoal text-cream py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {checkingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {t("checkout")}
          </button>
          <p className="text-xs text-warm-gray text-center mt-3">
            {t("secureCheckout")}
          </p>
        </div>
      </div>
    </div>
  );
}
