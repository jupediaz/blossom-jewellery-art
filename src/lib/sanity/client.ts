import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { sanityConfig } from "@/lib/env";

const isConfigured = !!sanityConfig.projectId;

export const sanityClient = isConfigured
  ? createClient({
      ...sanityConfig,
      stega: { enabled: false },
    })
  : null;

const builder = isConfigured
  ? imageUrlBuilder({ projectId: sanityConfig.projectId, dataset: sanityConfig.dataset })
  : null;

export function urlFor(source: { asset: { _ref: string } }) {
  if (!builder) {
    return { width: () => ({ url: () => "" }), url: () => "" };
  }
  return builder.image(source);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sanityFetch<T>(query: string, params?: any): Promise<T> {
  if (!sanityClient) {
    return [] as unknown as T;
  }
  if (params) {
    return sanityClient.fetch<T>(query, params);
  }
  return sanityClient.fetch<T>(query);
}
