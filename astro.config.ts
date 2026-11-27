import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import { rehypeExternalLinks } from "./src/plugins/rehype-external-links";
import { rehypeTableScroll } from "./src/plugins/rehype-table-scroll";
import { codeBlockTransformer } from "./src/plugins/shiki-code-block";
import { site } from "./src/site";

export default defineConfig({
  site: site.origin,
  output: "static",
  integrations: [mdx()],
  markdown: {
    // Light and dark themes are emitted as CSS variables, so the page's own
    // colour scheme (system setting or the manual toggle) picks between them.
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
      transformers: [codeBlockTransformer],
    },
    // The rehype plugins need the remark/rehype pipeline rather than Astro's
    // default processor.
    processor: unified({ rehypePlugins: [[rehypeExternalLinks, { origin: site.origin }], rehypeTableScroll] }),
  },
});
