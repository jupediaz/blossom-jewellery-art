"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html>
      <body>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 300, marginBottom: "1rem" }}>
              Something went wrong
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              We encountered an unexpected error. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#2d2d2d",
                color: "#faf8f5",
                padding: "0.625rem 1.5rem",
                borderRadius: "0.25rem",
                fontSize: "0.875rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
