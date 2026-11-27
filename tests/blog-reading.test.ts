import { describe, expect, it } from "vitest";
import { page } from "./support/built-site";

const post = () => page("/blog/reading-features/");

describe("post reading features", () => {
  it("lists the post's H2 headings in the outline, linking to their anchors", () => {
    const doc = post();
    const entries = doc.querySelectorAll('nav[aria-label="On this page"] a');
    expect(entries.map((a) => a.text.trim())).toEqual(["First section", "Second section", "Third section with code"]);
    for (const a of entries) {
      const id = a.getAttribute("href")?.replace(/^#/, "");
      expect(doc.querySelector(`article h2[id="${id}"]`)).not.toBeNull();
    }
  });

  it("opens external links in a new tab with a safe rel", () => {
    const link = post().querySelector('article a[href="https://example.com/docs"]');
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("leaves internal links unchanged", () => {
    const link = post().querySelector('article a[href="/blog/hello-en/"]');
    expect(link?.getAttribute("target")).toBeUndefined();
    expect(link?.getAttribute("rel")).toBeUndefined();
  });

  it("renders the Callout component with its type and content", () => {
    const callout = post().querySelector('article [data-callout="warning"]');
    expect(callout?.text).toContain("Mind the gap.");
  });

  it("wraps tables in a horizontally scrolling container", () => {
    const wrapper = post().querySelector("article .table-scroll");
    expect(wrapper?.querySelector("table")?.tagName).toBe("TABLE");
  });

  it("highlights code with paired light and dark Shiki themes", () => {
    const pre = post().querySelector("article pre.astro-code");
    expect(pre?.getAttribute("style")).toContain("--shiki-light");
    expect(pre?.getAttribute("style")).toContain("--shiki-dark");
  });

  it("gives each code block a labelled copy button and its language", () => {
    const block = post().querySelector("article .code-block");
    expect(block?.querySelector(".code-language")?.text.trim()).toBe("ts");
    expect(block?.querySelector("button[data-copy-code]")?.text.trim()).toBe("Copy");
  });
});
