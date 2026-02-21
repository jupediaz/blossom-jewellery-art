import type { Metadata } from "next";
import { Link } from '@/i18n/navigation';
import Image from "next/image";
import { sanityFetch } from "@/lib/sanity/client";
import { allBlogPostsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import type { BlogPost } from "@/lib/types";
import { mockBlogPosts } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Blog");
  return {
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function BlogPage() {
  const t = await getTranslations("Blog");
  let posts: BlogPost[] = mockBlogPosts;

  try {
    const sanityPosts = await sanityFetch<BlogPost[]>(allBlogPostsQuery);
    if (sanityPosts.length > 0) {
      posts = sanityPosts;
    }
  } catch {
    // Sanity not configured - using mock data
  }

  const blogImages = [
    "/images/collection-rings.jpg",
    "/images/collection-earrings.jpg",
    "/images/artisan-work.jpg",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-heading text-4xl font-light mb-8">{t("title")}</h1>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug.current}`}
              className="group"
            >
              <div className="aspect-[3/2] overflow-hidden rounded-lg bg-cream-dark mb-4">
                <Image
                  src={post.mainImage ? urlFor(post.mainImage).width(600).url() : blogImages[idx % blogImages.length]}
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
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-warm-gray">{t("noPosts")}</p>
        </div>
      )}
    </div>
  );
}
