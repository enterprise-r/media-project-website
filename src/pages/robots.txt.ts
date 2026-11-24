// robots.txt: crawl and advertise the sitemap, or disallow all under SITE_NOINDEX.
import type { APIRoute } from "astro";
import { siteNoindex } from "../site";

export const GET: APIRoute = ({ site }) => {
  const body = siteNoindex
    ? "User-agent: *\nDisallow: /\n"
    : `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", site).href}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
