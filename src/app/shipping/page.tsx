import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Shipping information, delivery times, and return policy for Blossom Jewellery Art.",
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-8">
        Shipping & Returns
      </h1>

      <div className="space-y-10 text-sm text-warm-gray leading-relaxed">
        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">Shipping</h2>
          <div className="space-y-3">
            <p>
              All orders are carefully packaged and shipped from Europe. Each
              piece is wrapped in protective packaging to ensure it arrives in
              perfect condition.
            </p>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-cream-dark">
                  <th className="py-2 font-medium text-charcoal">Destination</th>
                  <th className="py-2 font-medium text-charcoal">Delivery Time</th>
                  <th className="py-2 font-medium text-charcoal">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-cream-dark/50">
                  <td className="py-2">Spain</td>
                  <td className="py-2">2-4 business days</td>
                  <td className="py-2">Free over €50</td>
                </tr>
                <tr className="border-b border-cream-dark/50">
                  <td className="py-2">EU Countries</td>
                  <td className="py-2">5-8 business days</td>
                  <td className="py-2">Free over €75</td>
                </tr>
                <tr className="border-b border-cream-dark/50">
                  <td className="py-2">UK</td>
                  <td className="py-2">7-10 business days</td>
                  <td className="py-2">€8.00</td>
                </tr>
                <tr>
                  <td className="py-2">Rest of World</td>
                  <td className="py-2">10-15 business days</td>
                  <td className="py-2">€12.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">
            Order Tracking
          </h2>
          <p>
            Once your order has been shipped, you&apos;ll receive an email with a
            tracking number. You can use this to follow your package&apos;s journey.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">Returns</h2>
          <div className="space-y-3">
            <p>
              We want you to be completely happy with your purchase. If for any
              reason you&apos;re not satisfied, you can return your item within 14
              days of receiving it.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Items must be unworn and in original condition</li>
              <li>Original packaging must be included</li>
              <li>Return shipping costs are the responsibility of the buyer</li>
              <li>Refunds are processed within 5-7 business days</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">
            Custom Orders
          </h2>
          <p>
            Custom orders are non-refundable, as they are made specifically for
            you. However, if there are any defects or issues, we will work with
            you to resolve them.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">
            Questions?
          </h2>
          <p>
            If you have any questions about shipping or returns, please don&apos;t
            hesitate to{" "}
            <a href="/contact" className="text-sage hover:text-sage-dark underline">
              contact us
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
