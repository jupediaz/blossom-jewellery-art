import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          The admin page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-charcoal/90"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
