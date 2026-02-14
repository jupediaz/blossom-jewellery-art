import { Mail, Instagram, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Blossom Jewellery Art for custom orders, questions, or collaborations.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-4">Contact</h1>
      <p className="text-warm-gray mb-12">
        Have a question, want a custom piece, or just want to say hello? We&apos;d love to hear from you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full border border-cream-dark rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sage"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full border border-cream-dark rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sage"
            />
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-1">
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              className="w-full border border-cream-dark rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sage"
            >
              <option value="general">General Inquiry</option>
              <option value="custom">Custom Order</option>
              <option value="wholesale">Wholesale</option>
              <option value="collaboration">Collaboration</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              required
              className="w-full border border-cream-dark rounded px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-sage resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-charcoal text-cream py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
          >
            Send Message
          </button>
        </form>

        {/* Contact Info */}
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-xl mb-4">Get in Touch</h2>
            <div className="space-y-4">
              <a
                href="mailto:hello@blossomjewelleryart.com"
                className="flex items-center gap-3 text-sm text-warm-gray hover:text-charcoal transition-colors"
              >
                <Mail size={18} />
                hello@blossomjewelleryart.com
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-warm-gray hover:text-charcoal transition-colors"
              >
                <Instagram size={18} />
                @blossomjewelleryart
              </a>
              <div className="flex items-center gap-3 text-sm text-warm-gray">
                <MapPin size={18} />
                Europe
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-heading text-xl mb-4">Custom Orders</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              Looking for something special? Olha offers custom jewelry commissions.
              Describe your vision and she&apos;ll work with you to create a one-of-a-kind
              piece. Custom orders typically take 2-4 weeks.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl mb-4">Response Time</h2>
            <p className="text-sm text-warm-gray leading-relaxed">
              We aim to respond to all inquiries within 24-48 hours. For urgent
              matters, please reach out via Instagram direct message.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
