import { MetadataRoute } from "next";

// Force static generation for static export compatibility
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
     // Use a fixed date instead of new Date() for static export
     const lastModified = new Date("2025-08-05").toISOString();

     return [
          {
               url: "https://danielyzhu.com",
               lastModified,
               changeFrequency: "weekly",
               priority: 1,
          },
          {
               url: "https://danielyzhu.com#research",
               lastModified,
               changeFrequency: "monthly",
               priority: 0.7,
          },
          {
               url: "https://danielyzhu.com#projects",
               lastModified,
               changeFrequency: "monthly",
               priority: 0.7,
          },
          {
               url: "https://danielyzhu.com#hobbies",
               lastModified,
               changeFrequency: "yearly",
               priority: 0.7,
          },
     ];
}
