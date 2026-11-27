import { describe, expect, it } from "vitest";
import { fileExists, page, pageExists } from "./support/built-site";

describe("blog post page", () => {
  it("is built at /blog/<folder-name>/ and shows the post title", () => {
    expect(page("/blog/hello-en/").querySelector("h1")?.text.trim()).toBe("Hello from the fixture");
  });

  it("has <html lang> en when the post sets no language", () => {
    expect(page("/blog/hello-en/").querySelector("html")?.getAttribute("lang")).toBe("en");
  });

  it("has <html lang> ko for a Korean post", () => {
    expect(page("/blog/korean-only/").querySelector("html")?.getAttribute("lang")).toBe("ko");
  });

  it("shows the date as YYYY-MM-DD", () => {
    expect(page("/blog/hello-en/").querySelector("article time")?.text.trim()).toBe("2024-06-10");
  });

  it("optimises images placed next to the post at build time", () => {
    const img = page("/blog/hello-en/").querySelector("article img");
    const src = img?.getAttribute("src") ?? "";
    expect(src).toMatch(/^\/_astro\/pixel\.[\w-]+\./);
    expect(fileExists(src)).toBe(true);
    expect(img?.getAttribute("width")).not.toBeNull();
    expect(img?.getAttribute("height")).not.toBeNull();
  });

  it("is not built for a draft post", () => {
    expect(pageExists("/blog/draft-post/")).toBe(false);
  });
});
