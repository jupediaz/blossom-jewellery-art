"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <h2 className="font-heading text-2xl font-light mb-4">
          Something went wrong
        </h2>
        <p className="text-warm-gray text-sm mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-charcoal text-cream px-6 py-2.5 rounded text-sm hover:bg-charcoal/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
