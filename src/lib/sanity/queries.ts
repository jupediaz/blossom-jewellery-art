import { groq } from "next-sanity";

// Product queries
export const allProductsQuery = groq`
  *[_type == "product" && !(_id in path("drafts.**"))] | order(orderRank) {
    _id,
    name,
    slug,
    price,
    compareAtPrice,
    images,
    category->{_id, name, slug},
    collection->{_id, name, slug},
    materials,
    inStock,
    featured,
    "imageUrl": images[0].asset->url
  }
`;

export const featuredProductsQuery = groq`
  *[_type == "product" && featured == true && !(_id in path("drafts.**"))] | order(orderRank) [0...8] {
    _id,
    name,
    slug,
    price,
    compareAtPrice,
    images,
    category->{_id, name, slug},
    inStock,
    "imageUrl": images[0].asset->url
  }
`;

export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    name,
    slug,
    description,
    price,
    compareAtPrice,
    images,
    category->{_id, name, slug},
    collection->{_id, name, slug},
    materials,
    dimensions,
    careInstructions,
    inStock,
    variants,
    featured,
    seo,
    "relatedProducts": *[_type == "product" && category._ref == ^.category._ref && _id != ^._id && !(_id in path("drafts.**"))][0...4] {
      _id, name, slug, price, images, "imageUrl": images[0].asset->url
    }
  }
`;

export const productsByCategoryQuery = groq`
  *[_type == "product" && category->slug.current == $categorySlug && !(_id in path("drafts.**"))] | order(orderRank) {
    _id,
    name,
    slug,
    price,
    compareAtPrice,
    images,
    category->{_id, name, slug},
    inStock,
    "imageUrl": images[0].asset->url
  }
`;

// Category queries
export const allCategoriesQuery = groq`
  *[_type == "category" && !(_id in path("drafts.**"))] | order(orderRank) {
    _id,
    name,
    slug,
    description,
    image
  }
`;

// Collection queries
export const allCollectionsQuery = groq`
  *[_type == "collection" && !(_id in path("drafts.**"))] | order(orderRank) {
    _id,
    name,
    slug,
    description,
    image,
    "productCount": count(*[_type == "product" && references(^._id)])
  }
`;

export const collectionBySlugQuery = groq`
  *[_type == "collection" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    name,
    slug,
    description,
    image,
    "products": *[_type == "product" && references(^._id) && !(_id in path("drafts.**"))] | order(orderRank) {
      _id, name, slug, price, compareAtPrice, images, inStock, "imageUrl": images[0].asset->url
    }
  }
`;

// Blog queries
export const allBlogPostsQuery = groq`
  *[_type == "blogPost" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    "author": author->name
  }
`;

export const blogPostBySlugQuery = groq`
  *[_type == "blogPost" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    slug,
    body,
    excerpt,
    mainImage,
    publishedAt,
    "author": author->name,
    seo
  }
`;

// Site settings
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    title,
    description,
    logo,
    socialLinks,
    announcementBar
  }
`;
