import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://newbornkr.online",
  trailingSlash: "never",
  build: { format: "file", inlineStylesheets: "never" },
  compressHTML: true,
  // this repo contains only the tracker app: language roots open the tracker
  redirects: { "/": "/tracker", "/en": "/en/tracker", "/pt-br": "/pt-br/tracker" },
});
