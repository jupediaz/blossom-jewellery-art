import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from '@/i18n/navigation';
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { sanityFetch } from "@/lib/sanity/client";
import { blogPostBySlugQuery, allBlogPostsQuery } from "@/lib/sanity/queries";
import { urlFor } from "@/lib/sanity/client";
import { siteConfig } from "@/lib/env";
import { PortableTextRenderer } from "@/components/PortableText";
import { BlogPostJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import type { BlogPost } from "@/lib/types";
import { mockBlogPosts } from "@/lib/mock-data";
import { getTranslations } from "next-intl/server";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const posts = await sanityFetch<BlogPost[]>(allBlogPostsQuery);
    if (posts.length > 0) {
      return posts.map((p) => ({ slug: p.slug.current }));
    }
  } catch {
    // Use mock data
  }
  return mockBlogPosts.map((p) => ({ slug: p.slug.current }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await sanityFetch<BlogPost>(blogPostBySlugQuery, {
      slug,
    });
    if (!post) return {};
    return {
      title: post.seo?.metaTitle || post.title,
      description: post.seo?.metaDescription || post.excerpt,
      authors: [{ name: siteConfig.creator }],
      openGraph: {
        title: post.seo?.metaTitle || post.title,
        description: post.seo?.metaDescription || post.excerpt,
        type: "article",
        ...(post.publishedAt && { publishedTime: post.publishedAt }),
      },
    };
  } catch {
    return {};
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslations("Blog");
  const { slug } = await params;
  let post: BlogPost | null = null;

  try {
    const sanityPost = await sanityFetch<BlogPost>(blogPostBySlugQuery, { slug });
    // Only use Sanity post if it's valid (not empty array or null)
    if (sanityPost && typeof sanityPost === 'object' && !Array.isArray(sanityPost)) {
      post = sanityPost;
    }
  } catch {
    // Sanity error - will use mock data below
  }

  // If no valid post from Sanity, use mock data
  if (!post || !post.slug) {
    post = mockBlogPosts.find(p => p.slug.current === slug) || null;
  }

  if (!post) notFound();

  const blogImages = [
    "/images/collection-rings.jpg",
    "/images/collection-earrings.jpg",
    "/images/artisan-work.jpg",
  ];
  const postIndex = mockBlogPosts.findIndex(p => p._id === post._id);
  const mockImage = blogImages[postIndex % blogImages.length];

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <BlogPostJsonLd post={post} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Blog", url: `${siteConfig.url}/blog` },
          { name: post.title, url: `${siteConfig.url}/blog/${post.slug.current}` },
        ]}
      />

      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-warm-gray hover:text-charcoal transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        {t("backToBlog")}
      </Link>

      <header className="mb-8">
        <h1 className="font-heading text-4xl font-light mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-warm-gray">
          {post.author && <span>{t("byAuthor", { author: post.author })}</span>}
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
        </div>
      </header>

      <div className="aspect-[16/9] overflow-hidden rounded-lg bg-cream-dark mb-8">
        <Image
          src={post.mainImage ? urlFor(post.mainImage).width(1200).url() : mockImage}
          alt={post.title}
          width={1200}
          height={675}
          className="w-full h-full object-cover"
          priority
        />
      </div>

      <div className="prose prose-lg max-w-none text-warm-gray">
        {post.body && post.body.length > 0 ? (
          <PortableTextRenderer value={post.body} />
        ) : (
          post.excerpt && <p className="lead">{post.excerpt}</p>
        )}
      </div>
    </article>
  );
}
