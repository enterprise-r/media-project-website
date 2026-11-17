import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.enterprise-r.com",
  redirects: {
    "/login": "/r/",
  },
  // localhost resolves to ::1 first, so the default bind is IPv6 only.
  // ra.hq.enterprise-r.com proxies here and sends its own Host header.
  server: {
    host: "127.0.0.1",
    allowedHosts: ["ra.hq.enterprise-r.com"],
  },
  // Keep the built HTML readable.
  compressHTML: false,
  // Stylesheets stay files. Auto would inline about.css into the HTML.
  build: { inlineStylesheets: "never" },
  vite: {
    build: {
      // wait.svg is under Vite's 4kb inline limit; keep theme icons as files
      // so the waiting icon's CSS animation runs in <img>.
      assetsInlineLimit: (id, buf) => {
        if (String(id).includes("theme/icons/")) return false;
        return buf.length < 4096;
      },
    },
  },
});
