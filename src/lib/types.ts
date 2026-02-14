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

export interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  description?: unknown[];
  price: number;
  compareAtPrice?: number;
  images: SanityImage[];
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
  image?: SanityImage;
}

export interface Collection {
  _id: string;
  name: string;
  slug: { current: string };
  description?: string;
  image?: SanityImage;
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
