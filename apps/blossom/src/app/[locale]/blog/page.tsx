import type { Metadata } from "next";
import { Link } from '@/i18n/navigation';
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sanityFetch, urlFor } from "@/lib/sanity/client";
import type { BlogPost } from "@/lib/types";
import { mockBlogPosts } from "@/lib/mock-data";
import { getTranslations, getLocale } from "next-intl/server";

export const revalidate = 60;

const PAGE_SIZE = 9;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Blog");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const t = await getTranslations("Blog");
  const tCommon = await getTranslations("Common");
  const locale = await getLocale();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  let allPosts: BlogPost[] = mockBlogPosts;

  try {
    const sanityPosts = await sanityFetch<BlogPost[]>(
      `*[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
        _id, title, slug, excerpt, mainImage, publishedAt, "author": author->name
      }`
    );
    if (sanityPosts.length > 0) {
      allPosts = sanityPosts;
    }
  } catch {
    // Sanity not configured — using mock data
  }

  const totalPages = Math.max(1, Math.ceil(allPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const posts = allPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const blogImages = [
    "/images/collection-rings.jpg",
    "/images/collection-earrings.jpg",
    "/images/artisan-work.jpg",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-8">{t("title")}</h1>

      {posts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug.current}`}
                className="group"
              >
                <div className="aspect-[3/2] overflow-hidden rounded-lg bg-cream-dark mb-4">
                  <Image
                    src={post.mainImage ? urlFor(post.mainImage).width(600).url() : blogImages[((currentPage - 1) * PAGE_SIZE + idx) % blogImages.length]}
                    alt={post.title}
                    width={600}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h2 className="font-heading text-xl group-hover:text-sage-dark transition-colors mb-2">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-warm-gray line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                {post.publishedAt && (
                  <p className="text-xs text-warm-gray/60 mt-2">
                    {new Date(post.publishedAt).toLocaleDateString(locale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              {currentPage > 1 ? (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-charcoal transition-colors"
                >
                  <ChevronLeft size={16} />
                  {tCommon("previous")}
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-warm-gray/30 cursor-not-allowed">
                  <ChevronLeft size={16} />
                  {tCommon("previous")}
                </span>
              )}

              <span className="text-xs text-warm-gray">
                {t("page", { page: currentPage, total: totalPages })}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="flex items-center gap-1.5 text-sm text-warm-gray hover:text-charcoal transition-colors"
                >
                  {tCommon("next")}
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-warm-gray/30 cursor-not-allowed">
                  {tCommon("next")}
                  <ChevronRight size={16} />
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-warm-gray">{t("noPosts")}</p>
        </div>
      )}
    </div>
  );
}
