import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import { site } from "./src/site";

export default defineConfig({
  site: site.origin,
  output: "static",
  integrations: [mdx()],
});
