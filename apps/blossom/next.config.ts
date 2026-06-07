import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Monorepo: trace and bundle workspace-hoisted dependencies from the repo root
  // so the standalone output includes everything (node_modules live at root).
  outputFileTracingRoot: path.join(__dirname, "../../"),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Payload media stored in Cloudflare R2 (public bucket)
        protocol: "https",
        hostname: "pub-8901f7dc70734521bb212bbabaad0187.r2.dev",
      },
      {
        // AI-generated glamour photography (shared codelabs R2 bucket)
        protocol: "https",
        hostname: "pub-95b130cd21014a42901539acb17fa9ae.r2.dev",
      },
    ],
  },
  async headers() {
    const commonHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ]

    return [
      // Sanity Studio: permissive CSP — studio needs unsafe-eval for schema compilation
      // and wss/https to all *.sanity.io domains for real-time collaboration
      {
        source: "/studio(.*)",
        headers: [
          ...commonHeaders,
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sanity.io",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.sanity.io",
              "font-src 'self' https://fonts.gstatic.com https://*.sanity.io",
              "img-src 'self' data: blob: https://cdn.sanity.io https://images.unsplash.com https://*.sanity.io https://pub-8901f7dc70734521bb212bbabaad0187.r2.dev https://pub-95b130cd21014a42901539acb17fa9ae.r2.dev",
              "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://*.sentry.io",
              "frame-src https://*.sanity.io",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
      // Storefront: stricter CSP — no unsafe-eval
      {
        source: "/((?!studio).*)",
        headers: [
          ...commonHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://cdn.sanity.io https://images.unsplash.com https://www.google-analytics.com https://pub-8901f7dc70734521bb212bbabaad0187.r2.dev https://pub-95b130cd21014a42901539acb17fa9ae.r2.dev",
              "connect-src 'self' https://*.sanity.io https://*.stripe.com https://*.sentry.io https://www.google-analytics.com https://region1.google-analytics.com",
              "frame-src https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withPayload(
  withSentryConfig(withNextIntl(nextConfig), {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.CI,
    widenClientFileUpload: true,
    disableLogger: true,
  }),
);
