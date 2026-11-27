import { existsSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildSite } from "./support/build-site";

// Builds the real content (src/content), not a fixture set, to check the
// migrated posts. Assertions stay inside the blog, because other content
// (portfolio data) is added independently.
let outDir: string;

beforeAll(() => {
  const build = buildSite(resolve(import.meta.dirname, "../src/content"));
  if (!build.ok) throw new Error(`Real content build failed:\n${build.output}`);
  outDir = build.outDir;
}, 120_000);

afterAll(() => rmSync(outDir, { recursive: true, force: true }));

const pageExists = (path: string) => existsSync(join(outDir, path, "index.html"));
const page = (path: string) => parse(readFileSync(join(outDir, path, "index.html"), "utf8"));
const alternates = (slug: string) => page(`/blog/${slug}/`).querySelectorAll('link[rel="alternate"][hreflang]');
const languageLink = (slug: string) => page(`/blog/${slug}/`).querySelector("[data-translation-link]");

const pairs = ["api-document", "http-verbs", "api-naming-conventions"];
const slugs = pairs.flatMap((key) => [key, `${key}-ko`]);

describe("migrated posts", () => {
  it.each(slugs)("builds /blog/%s/ at its old URL", (slug) => {
    expect(pageExists(`/blog/${slug}/`)).toBe(true);
  });

  it.each(pairs)("links %s to its Korean translation", (key) => {
    expect(languageLink(key)?.getAttribute("href")).toBe(`/blog/${key}-ko/`);
  });

  it.each(pairs)("links %s-ko to its English translation", (key) => {
    expect(languageLink(`${key}-ko`)?.getAttribute("href")).toBe(`/blog/${key}/`);
  });

  it.each(pairs)("declares the Korean alternate on %s", (key) => {
    const [link, ...rest] = alternates(key);
    expect(rest).toHaveLength(0);
    expect(link.getAttribute("hreflang")).toBe("ko");
    expect(link.getAttribute("href")).toBe(`https://jakeryu.com/blog/${key}-ko/`);
  });

  it.each(pairs)("declares the English alternate on %s-ko", (key) => {
    const [link, ...rest] = alternates(`${key}-ko`);
    expect(rest).toHaveLength(0);
    expect(link.getAttribute("hreflang")).toBe("en");
    expect(link.getAttribute("href")).toBe(`https://jakeryu.com/blog/${key}/`);
  });

  it.each(pairs)('sets <html lang="ko"> on %s-ko', (key) => {
    expect(page(`/blog/${key}-ko/`).querySelector("html")?.getAttribute("lang")).toBe("ko");
  });

  it.each(pairs)('sets <html lang="en"> on %s', (key) => {
    expect(page(`/blog/${key}/`).querySelector("html")?.getAttribute("lang")).toBe("en");
  });
});

describe("blog list with the migrated posts", () => {
  const entries = () => page("/blog/").querySelectorAll("[data-entry]");

  it("shows exactly three entries, one per translated pair", () => {
    expect(entries()).toHaveLength(3);
  });

  it.each(pairs)("shows %s once, in both languages", (key) => {
    const matching = entries().filter((e) => e.querySelector("a")?.getAttribute("href") === `/blog/${key}/`);
    expect(matching).toHaveLength(1);
    expect(matching[0].getAttribute("data-languages")).toBe("en ko");
  });
});

describe("post image", () => {
  it.each(["api-document", "api-document-ko"])("renders the Swagger UI screenshot optimised on %s", (slug) => {
    const src = page(`/blog/${slug}/`).querySelector('img[alt="Swagger UI"]')?.getAttribute("src") ?? "";
    expect(src).toMatch(/^\/_astro\/swagger-ui\.[\w-]+\.(webp|avif|jpg)/);
    expect(existsSync(join(outDir, src.split("?")[0]))).toBe(true);
  });

  it("does not reference the old /postImages path", () => {
    expect(readFileSync(join(outDir, "blog/api-document/index.html"), "utf8")).not.toContain("/postImages/");
  });
});

describe("archived posts", () => {
  // Slugs that only the old site's archive/ folder had.
  it.each(["hello-world", "react-hooks", "prop-drilling", "code-blocks", "github-markdown"])(
    "has no page for /blog/%s/",
    (slug) => {
      expect(pageExists(`/blog/${slug}/`)).toBe(false);
    },
  );
});
