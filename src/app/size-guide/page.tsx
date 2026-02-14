import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Find your perfect fit with our jewelry size guide for rings, bracelets, and necklaces.",
};

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-8">Size Guide</h1>

      <div className="space-y-10 text-sm text-warm-gray leading-relaxed">
        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">
            Ring Sizes
          </h2>
          <p className="mb-4">
            To find your ring size, wrap a thin strip of paper around the base
            of your finger. Mark where the paper overlaps, then measure the
            length in millimeters.
          </p>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cream-dark">
                <th className="py-2 font-medium text-charcoal">EU Size</th>
                <th className="py-2 font-medium text-charcoal">US Size</th>
                <th className="py-2 font-medium text-charcoal">Circumference (mm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["48", "4.5", "48.0"],
                ["50", "5.5", "50.0"],
                ["52", "6", "52.0"],
                ["54", "7", "54.0"],
                ["56", "7.5", "56.0"],
                ["58", "8.5", "58.0"],
              ].map(([eu, us, mm]) => (
                <tr key={eu} className="border-b border-cream-dark/50">
                  <td className="py-2">{eu}</td>
                  <td className="py-2">{us}</td>
                  <td className="py-2">{mm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">
            Bracelet Sizes
          </h2>
          <p className="mb-4">
            Measure around your wrist with a flexible tape measure. Add 1-2cm
            for a comfortable fit.
          </p>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cream-dark">
                <th className="py-2 font-medium text-charcoal">Size</th>
                <th className="py-2 font-medium text-charcoal">Wrist (cm)</th>
                <th className="py-2 font-medium text-charcoal">Bracelet Length (cm)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Small", "14-15", "16-17"],
                ["Medium", "15-16.5", "17-18.5"],
                ["Large", "16.5-18", "18.5-20"],
              ].map(([size, wrist, length]) => (
                <tr key={size} className="border-b border-cream-dark/50">
                  <td className="py-2">{size}</td>
                  <td className="py-2">{wrist}</td>
                  <td className="py-2">{length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">
            Necklace Lengths
          </h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-cream-dark">
                <th className="py-2 font-medium text-charcoal">Style</th>
                <th className="py-2 font-medium text-charcoal">Length (cm)</th>
                <th className="py-2 font-medium text-charcoal">Sits At</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Choker", "35-40", "Base of neck"],
                ["Princess", "42-48", "Collarbone"],
                ["Matinee", "50-60", "Above bust"],
                ["Opera", "70-85", "Below bust"],
              ].map(([style, length, sits]) => (
                <tr key={style} className="border-b border-cream-dark/50">
                  <td className="py-2">{style}</td>
                  <td className="py-2">{length}</td>
                  <td className="py-2">{sits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="font-heading text-xl text-charcoal mb-4">
            Need Help?
          </h2>
          <p>
            Not sure about your size?{" "}
            <a href="/contact" className="text-sage hover:text-sage-dark underline">
              Contact us
            </a>{" "}
            and we&apos;ll help you find the perfect fit.
          </p>
        </section>
      </div>
    </div>
  );
}
