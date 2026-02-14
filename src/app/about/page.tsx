import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Olha, the artisan behind Blossom Jewellery Art. Handcrafted jewelry inspired by nature.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-8">About Olha</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div className="aspect-[3/4] rounded-lg bg-cream-dark overflow-hidden">
          <div className="h-full flex items-center justify-center text-warm-gray">
            <p className="text-sm">Artisan portrait</p>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="font-heading text-2xl font-light mb-4">
            The Heart Behind Every Piece
          </h2>
          <div className="space-y-4 text-warm-gray leading-relaxed">
            <p>
              Blossom Jewellery Art was born from a deep love for nature and the
              belief that beauty can be captured in small, wearable forms. Each
              piece is handcrafted by Olha, an artisan who brings years of
              creative passion to every design.
            </p>
            <p>
              Inspired by the delicate forms of flowers, leaves, and organic
              textures found in nature, Olha creates jewelry that tells a story.
              Every curve, every texture, every detail is intentional — a
              celebration of the natural world.
            </p>
            <p>
              Working from her studio in Europe, Olha carefully selects
              high-quality materials and employs time-honored techniques to craft
              pieces that are as unique as the people who wear them.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          {
            title: "Handcrafted",
            text: "Every piece is made by hand, ensuring each one is truly unique. No mass production, no shortcuts.",
          },
          {
            title: "Nature-Inspired",
            text: "Our designs draw from the organic beauty of flowers, leaves, and natural textures found in the world around us.",
          },
          {
            title: "Made with Love",
            text: "Each creation carries the care and intention of its maker. We believe jewelry should feel personal.",
          },
        ].map((value) => (
          <div key={value.title} className="text-center">
            <h3 className="font-heading text-xl mb-3">{value.title}</h3>
            <p className="text-sm text-warm-gray leading-relaxed">
              {value.text}
            </p>
          </div>
        ))}
      </section>

      {/* Process */}
      <section>
        <h2 className="font-heading text-2xl font-light text-center mb-8">
          The Creative Process
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Inspiration",
              text: "Nature walks, seasonal changes, and botanical observations spark new ideas.",
            },
            {
              step: "02",
              title: "Design",
              text: "Sketching and experimenting with forms until the perfect design emerges.",
            },
            {
              step: "03",
              title: "Crafting",
              text: "Careful handwork using quality materials, paying attention to every detail.",
            },
            {
              step: "04",
              title: "Finishing",
              text: "Final touches, quality checks, and packaging with care for the recipient.",
            },
          ].map((item) => (
            <div key={item.step}>
              <span className="text-3xl font-heading text-sage/40">
                {item.step}
              </span>
              <h3 className="font-heading text-lg mt-2 mb-2">{item.title}</h3>
              <p className="text-sm text-warm-gray">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
