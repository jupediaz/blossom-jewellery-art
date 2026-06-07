export interface SanityImage {
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

// Payload media (R2-backed upload). Replaces SanityImage for products/catalog.
export interface CmsMedia {
  id?: string | number;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
  thumbnailURL?: string;
  sizes?: Record<string, { url?: string; width?: number; height?: number }>;
}

export interface Product {
  _id: string;
  _createdAt?: string;
  name: string;
  slug: { current: string };
  description?: unknown;
  price: number;
  compareAtPrice?: number;
  images: CmsMedia[];
  category?: {
    _id: string;
    name: string;
    slug: { current: string };
  };
  collection?: {
    _id: string;
    name: string;
    slug: { current: string };
  };
  materials?: string[];
  dimensions?: string;
  careInstructions?: string;
  inStock: boolean;
  variants?: {
    name: string;
    priceModifier?: number;
    inStock: boolean;
  }[];
  featured?: boolean;
  imageUrl?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
  relatedProducts?: Product[];
}

export interface Category {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  image?: CmsMedia;
}

export interface Collection {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  image?: CmsMedia;
  productCount?: number;
  products?: Product[];
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: SanityImage;
  body?: unknown[];
  publishedAt?: string;
  author?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export interface SiteSettings {
  title?: string;
  description?: string;
  logo?: SanityImage;
  announcementBar?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    etsy?: string;
  };
}
