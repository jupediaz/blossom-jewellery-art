"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email }),
    })
      .then((res) => {
        setStatus(res.ok ? "success" : "error");
        if (res.ok) {
          setTimeout(() => router.push("/account"), 3000);
        }
      })
      .catch(() => setStatus("error"));
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 py-16">
      {status === "loading" && (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-warm-gray mb-4" />
          <p className="text-sm text-warm-gray">Verifying your email…</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="text-xl font-medium mb-2">Email verified!</h2>
          <p className="text-sm text-warm-gray mb-6">
            Your account is now fully activated. Redirecting to your account…
          </p>
          <Link
            href="/account"
            className="rounded-lg bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90"
          >
            Go to my account
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle className="h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">Verification failed</h2>
          <p className="text-sm text-warm-gray mb-6">
            This link is invalid or has expired. Please register again or contact us.
          </p>
          <Link
            href="/register"
            className="rounded-lg bg-charcoal px-6 py-2.5 text-sm font-medium text-white hover:bg-charcoal/90"
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
}
