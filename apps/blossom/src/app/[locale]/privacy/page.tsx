import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Privacy Policy | Blossom by Olha",
  description:
    "Privacy Policy for Blossom by Olha. Learn how we collect, use, and protect your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-4xl font-light mb-2">Privacy Policy</h1>
      <p className="text-sm text-warm-gray mb-12">Last updated: March 2026</p>

      <div className="prose prose-sm max-w-none text-warm-gray space-y-10">

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">1. Who We Are</h2>
          <p className="leading-relaxed">
            This website is operated by <strong className="text-charcoal">Blossom by Olha</strong>, a handcrafted
            jewellery brand based in Marbella, Spain. Our website address is{" "}
            <strong className="text-charcoal">www.blossombyolha.com</strong>.
          </p>
          <p className="leading-relaxed mt-3">
            For any privacy-related enquiries, you can contact us at{" "}
            <a href="mailto:hello@blossombyolha.com" className="text-charcoal underline hover:text-dusty-rose transition-colors">
              hello@blossombyolha.com
            </a>.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">2. What Data We Collect</h2>
          <p className="leading-relaxed">
            When you interact with our website or place an order, we may collect the following personal data:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li><strong className="text-charcoal">Identity data:</strong> first name, last name</li>
            <li><strong className="text-charcoal">Contact data:</strong> email address, phone number</li>
            <li><strong className="text-charcoal">Shipping data:</strong> delivery address</li>
            <li><strong className="text-charcoal">Transaction data:</strong> order details and payment confirmation (payment card data is processed directly by Stripe and never stored on our servers)</li>
            <li><strong className="text-charcoal">Usage data:</strong> how you use our website (via Google Analytics)</li>
            <li><strong className="text-charcoal">Marketing data:</strong> your preferences for receiving marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">3. How We Use Your Data</h2>
          <p className="leading-relaxed">We use your personal data to:</p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li>Process and fulfil your orders</li>
            <li>Send you order confirmations, shipping updates, and invoices</li>
            <li>Respond to customer service enquiries</li>
            <li>Send you marketing emails if you have opted in (you may unsubscribe at any time)</li>
            <li>Prevent fraud and maintain the security of our website</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">4. Legal Basis for Processing</h2>
          <p className="leading-relaxed">
            Under the GDPR (EU General Data Protection Regulation), we process your data on the following legal bases:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li><strong className="text-charcoal">Contract performance:</strong> processing your order and delivering your purchase</li>
            <li><strong className="text-charcoal">Legitimate interest:</strong> fraud prevention, website improvement</li>
            <li><strong className="text-charcoal">Consent:</strong> marketing communications and newsletter subscriptions</li>
            <li><strong className="text-charcoal">Legal obligation:</strong> tax records and financial compliance</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">5. Third-Party Services</h2>
          <p className="leading-relaxed">
            We share your data only with trusted service providers who help us operate our business:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li><strong className="text-charcoal">Stripe</strong> — payment processing (their privacy policy applies to card data)</li>
            <li><strong className="text-charcoal">Resend</strong> — transactional and marketing emails</li>
            <li><strong className="text-charcoal">Google Analytics</strong> — anonymous website usage statistics</li>
            <li><strong className="text-charcoal">Cloudflare</strong> — content delivery and DDoS protection</li>
          </ul>
          <p className="leading-relaxed mt-3">
            We do not sell your personal data to any third party.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">6. Data Retention</h2>
          <p className="leading-relaxed">
            We retain your personal data for as long as necessary to fulfil the purposes for which it was collected:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li>Order and transaction records: 7 years (legal and tax requirements)</li>
            <li>Customer account data: until you request deletion</li>
            <li>Marketing consent: until you unsubscribe</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">7. Your Rights</h2>
          <p className="leading-relaxed">Under GDPR, you have the following rights regarding your personal data:</p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li><strong className="text-charcoal">Access:</strong> request a copy of the data we hold about you</li>
            <li><strong className="text-charcoal">Rectification:</strong> ask us to correct inaccurate data</li>
            <li><strong className="text-charcoal">Erasure:</strong> request deletion of your data ("right to be forgotten")</li>
            <li><strong className="text-charcoal">Portability:</strong> receive your data in a portable format</li>
            <li><strong className="text-charcoal">Objection:</strong> object to processing based on legitimate interest</li>
            <li><strong className="text-charcoal">Withdraw consent:</strong> unsubscribe from marketing at any time</li>
          </ul>
          <p className="leading-relaxed mt-3">
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:hello@blossombyolha.com" className="text-charcoal underline hover:text-dusty-rose transition-colors">
              hello@blossombyolha.com
            </a>. We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">8. Cookies</h2>
          <p className="leading-relaxed">
            Our website uses cookies to improve your browsing experience and analyse site traffic. These include:
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1 leading-relaxed">
            <li><strong className="text-charcoal">Essential cookies:</strong> required for the shopping cart and account functionality</li>
            <li><strong className="text-charcoal">Analytics cookies:</strong> Google Analytics (anonymous usage statistics)</li>
          </ul>
          <p className="leading-relaxed mt-3">
            You can control cookies through your browser settings. Disabling cookies may affect some website functionality.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">9. Changes to This Policy</h2>
          <p className="leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an
            updated date. Continued use of our website after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-3">10. Contact</h2>
          <p className="leading-relaxed">
            For any questions about this Privacy Policy or how we handle your data:
          </p>
          <div className="mt-3 space-y-1">
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
