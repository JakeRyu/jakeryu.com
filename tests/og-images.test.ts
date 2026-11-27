import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, inject, it } from "vitest";
import { site } from "../src/site";
import { postImage } from "../src/lib/og-image";
import { page } from "./support/built-site";

// Every built page's URL path, derived from the output so the tests do not
// depend on which fixture posts exist.
function builtPaths(): string[] {
  return readdirSync(inject("outDir"), { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith("index.html"))
    .map((name) => `/${name.slice(0, -"index.html".length)}`);
}

const isPost = (path: string) => /^\/blog\/[^/]+\/$/.test(path) && path !== "/blog/tags/";
const postPaths = () => builtPaths().filter(isPost);
const otherPaths = () => builtPaths().filter((path) => !isPost(path));

function ogImage(path: string): string | undefined {
  return page(path).querySelector('meta[property="og:image"]')?.getAttribute("content");
}

// The built file behind an absolute og:image URL.
function imageFile(url: string): string {
  return join(inject("outDir"), new URL(url).pathname);
}

describe("post Open Graph images", () => {
  it("has a PNG file in the build for every published post, named by its og:image", () => {
    const posts = postPaths();
    expect(posts.length).toBeGreaterThan(1);
    for (const path of posts) {
      const url = ogImage(path);
      expect(url, path).toBeDefined();
      expect(existsSync(imageFile(url!)), `${path} -> ${url}`).toBe(true);
    }
  });

  it("is a 1200x630 PNG", () => {
    for (const path of postPaths()) {
      const bytes = readFileSync(imageFile(ogImage(path)!));
      expect([...bytes.subarray(0, 8)], path).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      expect([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], path).toEqual([1200, 630]);
    }
  });
});

describe("og:image", () => {
  it("is an absolute URL on the canonical origin on every page", () => {
    for (const path of builtPaths()) {
      expect(ogImage(path), path).toMatch(new RegExp(`^${site.origin}/[^?#]+\\.png$`));
    }
  });

  it("is each post's own image, different for every post", () => {
    const urls = postPaths().map((path) => ogImage(path));
    expect(new Set(urls).size).toBe(urls.length);
    for (const path of postPaths()) {
      expect(ogImage(path), path).toContain(path.split("/")[2]);
    }
  });

  it("is one shared default image on every page that is not a post", () => {
    const urls = new Set(otherPaths().map((path) => ogImage(path)));
    expect(otherPaths().length).toBeGreaterThan(1);
    expect(urls.size).toBe(1);
    const [url] = urls;
    expect(existsSync(imageFile(url!))).toBe(true);
    expect(postPaths().map((path) => ogImage(path))).not.toContain(url);
  });

  it("is also the shared default on the 404 page", () => {
    expect(page("/404.html").querySelector('meta[property="og:image"]')?.getAttribute("content")).toBe(ogImage("/"));
  });

  it("comes with the title, type and large-card tags, pointing at the same image", () => {
    for (const path of builtPaths()) {
      const meta = (selector: string) => page(path).querySelector(selector)?.getAttribute("content");
      expect(meta('meta[property="og:title"]'), path).toBeTruthy();
      expect(meta('meta[property="og:type"]'), path).toBe(isPost(path) ? "article" : "website");
      expect(meta('meta[name="twitter:card"]'), path).toBe("summary_large_image");
      expect(meta('meta[name="twitter:image"]'), path).toBe(ogImage(path));
    }
  });
});

describe("draft posts", () => {
  it("get no Open Graph image", () => {
    expect(existsSync(join(inject("outDir"), "og/draft-post.png"))).toBe(false);
    const images = readdirSync(join(inject("outDir"), "og"));
    expect(images.length).toBeGreaterThan(0);
    expect(images.some((name) => name.includes("draft"))).toBe(false);
  });
});

describe("Korean posts", () => {
  // The generator is handed Noto Sans KR only for Korean posts. Observable
  // fact: the built image is the title set with the Korean font, and it
  // differs from the same title set with the Latin-only Geist (which has no
  // Hangul glyphs, so it would render empty boxes).
  it("set the title in Noto Sans KR", async () => {
    const korean = postPaths().filter((path) => page(path).querySelector("html")?.getAttribute("lang") === "ko");
    expect(korean.length).toBeGreaterThan(0);
    for (const path of korean) {
      const title = page(path).querySelector("h1")!.text;
      const built = readFileSync(imageFile(ogImage(path)!));
      expect(built.equals(await postImage(title, "ko")), path).toBe(true);
      expect(built.equals(await postImage(title, "en")), path).toBe(false);
    }
  });
});
