import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-heading text-6xl font-light text-sage/30 mb-4">
        404
      </h1>
      <h2 className="font-heading text-2xl font-light mb-4">Page Not Found</h2>
      <p className="text-warm-gray text-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-charcoal text-cream px-8 py-3 rounded text-sm tracking-wide hover:bg-charcoal/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
