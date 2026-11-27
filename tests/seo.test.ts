import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, inject, it } from "vitest";
import { site } from "../src/site";
import { page, pageExists } from "./support/built-site";

const origin = "https://jakeryu.com";

// Every built page's URL path, derived from the output itself so the test
// does not depend on which pages exist.
function builtPaths(): string[] {
  return readdirSync(inject("outDir"), { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith("index.html"))
    .map((name) => `/${name.slice(0, -"index.html".length)}`);
}

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
}

function sitemapLocs(): string[] {
  const dir = inject("outDir");
  const files = locs(readFileSync(join(dir, "sitemap-index.xml"), "utf8"));
  return files.flatMap((file) => locs(readFileSync(join(dir, file.replace(origin, "")), "utf8")));
}

describe("sitemap", () => {
  it("lists exactly the built pages on the canonical origin", () => {
    const expected = builtPaths().map((path) => `${origin}${path}`);
    expect(expected.length).toBeGreaterThan(1);
    expect([...sitemapLocs()].sort()).toEqual([...expected].sort());
  });

  it("omits drafts and the 404 page", () => {
    expect(pageExists("/blog/draft-post/")).toBe(false);
    expect(existsSync(join(inject("outDir"), "404.html"))).toBe(true);
    const all = sitemapLocs();
    expect(all.some((loc) => loc.includes("draft-post"))).toBe(false);
    expect(all.some((loc) => loc.includes("404"))).toBe(false);
  });
});

describe("canonical URL", () => {
  it("is the canonical origin plus the page's own path, on every page", () => {
    for (const path of builtPaths()) {
      expect(page(path).querySelector('link[rel="canonical"]')?.getAttribute("href"), path).toBe(`${origin}${path}`);
    }
  });

  it("is declared on the 404 page too", () => {
    expect(page("/404.html").querySelector('link[rel="canonical"]')).not.toBeNull();
  });
});

describe("analytics beacon", () => {
  it("is the Cloudflare beacon with the configured token, on every page", () => {
    for (const path of builtPaths()) {
      const script = page(path).querySelector('script[src="https://static.cloudflareinsights.com/beacon.min.js"]');
      expect(JSON.parse(script?.getAttribute("data-cf-beacon") ?? "{}"), path).toEqual({ token: site.analyticsToken });
    }
  });

  it("adds no cookie code of its own", () => {
    expect(page("/").innerHTML).not.toContain("document.cookie");
  });
});
