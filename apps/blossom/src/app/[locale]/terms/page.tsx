import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Terms of Service | Blossom by Olha",
  description:
    "Terms of Service for Blossom by Olha. Read our terms and conditions for shopping at blossombyolha.com.",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-4xl font-light mb-2">Terms of Service</h1>
      <p className="text-sm text-warm-gray mb-12">Last updated: March 2026</p>

      <div className="prose prose-sm max-w-none text-warm-gray space-y-10">

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">1. About Us</h2>
          <p className="leading-relaxed">
            These Terms of Service govern your use of the website{" "}
            <strong className="text-charcoal">www.blossombyolha.com</strong> and any purchases made through it.
            The website is operated by <strong className="text-charcoal">Blossom by Olha</strong>, a handcrafted
            jewellery brand based in Marbella, Spain.
          </p>
          <p className="leading-relaxed mt-3">
            By accessing our website or placing an order, you agree to these Terms of Service.
            If you do not agree, please do not use our website.
          </p>
          <p className="leading-relaxed mt-3">
            Contact us at{" "}
            <a href="mailto:hello@blossombyolha.com" className="text-charcoal underline hover:text-dusty-rose transition-colors">
              hello@blossombyolha.com
            </a>{" "}
            for any questions regarding these terms.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">2. Products</h2>
          <p className="leading-relaxed">
            All jewellery sold on <strong className="text-charcoal">blossombyolha.com</strong> is handcrafted by
            Olha Finiv-Hoshovska using polymer clay, sterling silver, natural stones, and crystals.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li>Each piece is made by hand and may have minor natural variations from product photos — this is a feature, not a defect</li>
            <li>Limited edition and one-of-a-kind pieces are sold as-is; once sold, they cannot be replicated exactly</li>
            <li>Product descriptions and photos are provided in good faith and are as accurate as possible</li>
            <li>We reserve the right to discontinue any product at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">3. Orders and Payment</h2>
          <p className="leading-relaxed">
            By placing an order on our website, you are making an offer to purchase the selected items.
            We reserve the right to accept or decline any order.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li>Prices are displayed in EUR and are inclusive of any applicable taxes</li>
            <li>Payment is processed securely by <strong className="text-charcoal">Stripe</strong> — we do not store your card details</li>
            <li>Your order is confirmed once payment is successfully processed and you receive a confirmation email</li>
            <li>We reserve the right to cancel orders in cases of pricing errors or stock unavailability, with a full refund</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">4. Shipping</h2>
          <p className="leading-relaxed">
            We ship worldwide from Marbella, Spain. Shipping times and costs are displayed at checkout.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li>Estimated delivery times are guidelines only and not guaranteed</li>
            <li>We are not responsible for delays caused by customs, postal services, or events outside our control</li>
            <li>Risk of loss and title for products passes to you upon delivery to the carrier</li>
            <li>You are responsible for any customs duties or import taxes applicable in your country</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">5. Returns and Refunds</h2>
          <p className="leading-relaxed">
            We want you to love your purchase. If you are not completely satisfied:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li>You may return unworn items in their original condition within <strong className="text-charcoal">14 days</strong> of receipt</li>
            <li>Items must be returned with original packaging</li>
            <li>Return shipping costs are the buyer&apos;s responsibility</li>
            <li>Refunds are processed within 5–7 business days of receiving the returned item</li>
            <li>Sale items may only be exchanged, not refunded, unless faulty</li>
          </ul>
          <p className="leading-relaxed mt-3">
            To initiate a return, contact us at{" "}
            <a href="mailto:hello@blossombyolha.com" className="text-charcoal underline hover:text-dusty-rose transition-colors">
              hello@blossombyolha.com
            </a>{" "}
            with your order number.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">6. Custom Orders</h2>
          <p className="leading-relaxed">
            Custom and bespoke jewellery commissions are non-refundable, as they are made specifically to your
            requirements. However, if a custom piece arrives damaged or with a manufacturing defect, we will remake
            or repair it at no charge.
          </p>
          <p className="leading-relaxed mt-3">
            Custom orders require a deposit at the time of commissioning. Lead time is typically 2–4 weeks.
            We will communicate any delays promptly.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">7. Intellectual Property</h2>
          <p className="leading-relaxed">
            All content on <strong className="text-charcoal">blossombyolha.com</strong> — including photographs,
            designs, text, logos, and product images — is the intellectual property of Blossom by Olha and is
            protected by copyright law.
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li>You may not reproduce, distribute, or use our content for commercial purposes without written permission</li>
            <li>You may share our content on social media for personal, non-commercial purposes with credit to <strong className="text-charcoal">@blossombyolha</strong></li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">8. Limitation of Liability</h2>
          <p className="leading-relaxed">
            To the fullest extent permitted by applicable law, Blossom by Olha is not liable for any indirect,
            incidental, or consequential damages arising from the use of our website or products.
          </p>
          <p className="leading-relaxed mt-3">
            Our total liability in respect of any claim arising from these Terms shall not exceed the price paid
            for the product(s) in question.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">9. Governing Law</h2>
          <p className="leading-relaxed">
            These Terms of Service are governed by and construed in accordance with the laws of Spain.
            Any disputes shall be subject to the exclusive jurisdiction of the courts of Málaga, Spain.
          </p>
          <p className="leading-relaxed mt-3">
            As a consumer in the EU, you may also have rights under the applicable consumer protection laws of
            your country of residence.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">10. Changes to These Terms</h2>
          <p className="leading-relaxed">
            We reserve the right to update these Terms of Service at any time. Changes will be published on this
            page with an updated date. Continued use of our website after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">11. Contact</h2>
          <div className="mt-1 space-y-1">
            <p className="font-medium text-charcoal">Blossom by Olha</p>
            <p>Marbella, Spain</p>
            <p>
              <a href="mailto:hello@blossombyolha.com" className="text-charcoal underline hover:text-dusty-rose transition-colors">
                hello@blossombyolha.com
              </a>
            </p>
            <p>
              <a href="https://www.blossombyolha.com" className="text-charcoal underline hover:text-dusty-rose transition-colors">
                www.blossombyolha.com
              </a>
            </p>
          </div>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-sage/30">
        <Link href="/" className="text-sm text-warm-gray hover:text-charcoal transition-colors">
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
