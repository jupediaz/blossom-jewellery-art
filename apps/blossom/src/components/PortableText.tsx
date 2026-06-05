/**
 * PortableText - Renders Sanity portable text (rich text) content
 */

import { PortableText as SanityPortableText } from "@portabletext/react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { urlFor } from "@/lib/sanity/client";

const components = {
  types: {
    image: ({ value }: { value: { asset: { _ref: string }; alt?: string } }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(960).url()}
            alt={value.alt || ""}
            width={960}
            height={540}
            className="rounded-lg w-full"
          />
          {value.alt && (
            <figcaption className="text-center text-sm text-warm-gray mt-2">
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  marks: {
    link: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value?: { href?: string };
    }) => {
      const href = value?.href || "#";
      const isExternal = href.startsWith("http");
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sage-dark underline underline-offset-2 hover:text-sage"
          >
            {children}
          </a>
        );
      }
      return (
        <Link href={href} className="text-sage-dark underline underline-offset-2 hover:text-sage">
          {children}
        </Link>
      );
    },
  },
  block: {
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="font-heading text-2xl font-light mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="font-heading text-xl font-light mt-6 mb-3">{children}</h3>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-2 border-sage pl-4 italic text-warm-gray my-6">
        {children}
      </blockquote>
    ),
  },
};

interface Props {
  value: unknown[];
}

export function PortableTextRenderer({ value }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <SanityPortableText value={value as any} components={components as any} />;
}
