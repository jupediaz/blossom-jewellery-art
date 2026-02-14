import Link from "next/link";
import { CheckCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <CheckCircle size={48} className="mx-auto text-sage mb-6" />
      <h1 className="font-heading text-3xl font-light mb-4">
        Thank You for Your Order!
      </h1>
      <p className="text-warm-gray mb-2">
        Your order has been confirmed and will be shipped soon.
      </p>
      <p className="text-warm-gray text-sm mb-8">
        You will receive a confirmation email with your order details.
      </p>
      {sessionId && (
        <p className="text-xs text-warm-gray/60 mb-8">
          Order reference: {sessionId.slice(0, 20)}...
        </p>
      )}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
