import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/modules/docs/server/seo";
import { source } from "@/modules/docs/server/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const docs: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: absoluteUrl(page.url),
    lastModified: page.data.lastModified,
    changeFrequency: "weekly",
    priority: page.slugs.length === 0 ? 0.8 : 0.7,
  }));
  return [{ url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 }, ...docs];
}
