import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Olha — Blossom Jewellery Art",
  description:
    "Meet Olha Finiv-Hoshovska, the artisan behind Blossom Jewellery Art. Handcrafted polymer clay flower jewellery inspired by Ukrainian heritage and European gardens.",
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero — Meet the Artist */}
      <section className="bg-cream-dark/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Intro text first on all screens */}
          <div className="text-center mb-12">
            <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
              Meet the Artist
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl font-light mb-2">
              Olha Finiv-Hoshovska
            </h1>
            <p className="text-sage-dark text-sm italic">
              Founder &amp; Artisan behind Blossom Jewellery Art
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 items-start">
            {/* Portrait — contained, centered, shows the full face */}
            <div className="lg:col-span-2 flex justify-center">
              <div className="relative w-72 sm:w-80 lg:w-full">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/about/olha-artist-portrait.jpg"
                    alt="Olha Finiv-Hoshovska, creator of Blossom Jewellery Art, surrounded by flowers"
                    fill
                    className="object-cover object-center"
                    priority
                  />
                </div>
                <div className="absolute -bottom-3 -right-3 bg-white rounded-xl px-4 py-2 shadow-lg">
                  <p className="text-xs text-warm-gray uppercase tracking-wider">Handmade in</p>
                  <p className="font-heading text-base text-charcoal">Europe</p>
                </div>
              </div>
            </div>

            {/* Bio text */}
            <div className="lg:col-span-3 space-y-4 text-warm-gray leading-relaxed">
              <p>
                Every petal, every leaf, every tiny bud is sculpted by hand with the same love
                that nature puts into growing a flower. Olha transforms polymer clay into
                miniature botanical masterpieces — wearable art that carries the soul of
                handcraft.
              </p>
              <p>
                Born in Ukraine with a background in psychology and education, Olha discovered
                her true calling in the art of polymer clay flower sculpting. What began as a
                creative escape became a lifelong passion — each piece a meditation on beauty
                and patience.
              </p>
              <p>
                Now based in Europe, she draws inspiration from both her Ukrainian floral
                heritage — the vibrant poppies, golden sunflowers, and intricate vyshyvanka
                patterns — and the lush Mediterranean gardens that surround her.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Craft */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
                The Craft
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-light mb-6">
                Sculpted by Hand, Petal by Petal
              </h2>
              <div className="space-y-4 text-warm-gray leading-relaxed">
                <p>
                  Each flower begins as a small piece of polymer clay, carefully conditioned
                  and coloured to achieve the perfect natural shade. Using only her hands and
                  simple sculpting tools, Olha forms every petal individually — building up
                  roses, orchids, peonies, and wildflowers that look as if they were just picked
                  from a garden.
                </p>
                <p>
                  No moulds. No shortcuts. No two pieces are exactly alike. A single necklace
                  can take days to complete, with dozens of hand-sculpted flowers and leaves
                  assembled into a harmonious bouquet.
                </p>
                <p>
                  The finished flowers are carefully cured, then combined with sterling silver
                  findings, natural semi-precious stones, Swarovski crystals, and crystal beads
                  to create pieces that are both delicate and durable.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/about/crafting-process.jpg"
                  alt="Olha's crafting process — hand-sculpting polymer clay flowers"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream-dark/20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-light text-center mb-12">
            What Makes Blossom Special
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "100% Handcrafted",
                text: "Every flower is sculpted by hand from polymer clay. No moulds, no mass production — each piece is a unique work of art with its own character and personality.",
              },
              {
                title: "Nature-Inspired",
                text: "Real flowers fade, but Olha's botanical creations last forever. Inspired by roses, orchids, peonies, and wildflowers from Ukrainian fields to Mediterranean gardens.",
              },
              {
                title: "Quality Materials",
                text: "Sterling silver findings, Swarovski crystals, natural agate and amethyst stones. Every component is chosen for beauty and durability, ensuring pieces you'll treasure.",
              },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <h3 className="font-heading text-xl mb-3">{value.title}</h3>
                <p className="text-sm text-warm-gray leading-relaxed">
                  {value.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/about/workshop-atelier.jpg"
                  alt="Olha's workshop and atelier where the jewellery is created"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <p className="text-sage text-sm font-medium tracking-widest uppercase mb-3">
                The Workshop
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl font-light mb-6">
                Where Flowers Come to Life
              </h2>
              <div className="space-y-4 text-warm-gray leading-relaxed">
                <p>
                  Olha&apos;s atelier is a small, sunlit space surrounded by inspiration —
                  real flowers, colour swatches, and trays of tiny clay petals in various
                  stages of creation.
                </p>
                <p>
                  It&apos;s here that each collection is born: from the first colour experiments
                  to the final quality check before packaging. Every piece is made to order
                  with the same attention to detail, whether it&apos;s a simple pair of stud
                  earrings or an elaborate bridal necklace.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Creative Process */}
      <section className="bg-cream-dark/20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-light text-center mb-12">
            The Creative Process
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Inspiration",
                text: "Nature walks, seasonal blooms, Ukrainian folk patterns, and Mediterranean gardens spark new designs.",
              },
              {
                step: "02",
                title: "Sculpting",
                text: "Polymer clay is mixed, coloured, and hand-sculpted petal by petal into realistic miniature flowers.",
              },
              {
                step: "03",
                title: "Assembly",
                text: "Cured flowers are paired with sterling silver, natural stones, and crystals to form complete pieces.",
              },
              {
                step: "04",
                title: "Finishing",
                text: "Quality checks, final touches, and careful packaging in branded boxes ready for their new home.",
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
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage/10 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-heading text-3xl font-light mb-4">
            Discover the Collections
          </h2>
          <p className="text-warm-gray mb-8">
            Each collection tells a different story — from Ukrainian heritage to
            Mediterranean gardens. Find the piece that speaks to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 bg-charcoal text-cream px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
            >
              Shop All Pieces
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/collections"
              className="inline-flex items-center justify-center gap-2 border border-charcoal text-charcoal px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal hover:text-cream transition-colors"
            >
              Browse Collections
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
