type GtagEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent({ action, ...params }: GtagEvent) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, params);
  }
}

export function trackAddToCart(item: {
  id: string;
  name: string;
  price: number;
  currency?: string;
  quantity?: number;
}) {
  trackEvent({
    action: "add_to_cart",
    currency: item.currency || "EUR",
    value: item.price * (item.quantity || 1),
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      },
    ],
  });
}

export function trackBeginCheckout(value: number, currency = "EUR") {
  trackEvent({
    action: "begin_checkout",
    currency,
    value,
  });
}

export function trackPurchase(order: {
  id: string;
  value: number;
  currency?: string;
  coupon?: string;
  shipping?: number;
}) {
  trackEvent({
    action: "purchase",
    transaction_id: order.id,
    value: order.value,
    currency: order.currency || "EUR",
    coupon: order.coupon,
    shipping: order.shipping || 0,
  });
}

export function trackViewItem(item: {
  id: string;
  name: string;
  price: number;
  currency?: string;
  category?: string;
}) {
  trackEvent({
    action: "view_item",
    currency: item.currency || "EUR",
    value: item.price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        item_category: item.category,
      },
    ],
  });
}
