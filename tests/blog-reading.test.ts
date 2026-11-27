import { describe, expect, it } from "vitest";
import { page } from "./support/built-site";

const post = () => page("/blog/reading-features/");

describe("outline placement", () => {
  const asideChildren = (slug: string) => {
    const aside = page(`/blog/${slug}/`).querySelector(".wrap > aside");
    return aside?.querySelectorAll(":scope > nav, :scope > section").map((el) => el.getAttribute("aria-label") ?? "") ?? [];
  };

  it("puts the outline in the right sidebar, after the translation and related cards", () => {
    expect(asideChildren("outline-order")).toEqual(["Translation", "Related", "On this page"]);
  });

  it("puts the outline first in the sidebar when there is no translation or related post", () => {
    expect(asideChildren("reading-features")).toEqual(["On this page"]);
  });

  it("is not in a left column: the outline follows the article in the document", () => {
    const html = page("/blog/outline-order/").querySelector(".wrap")?.innerHTML ?? "";
    expect(html.indexOf("<article")).toBeGreaterThanOrEqual(0);
    expect(html.indexOf('aria-label="On this page"')).toBeGreaterThan(html.indexOf("</article>"));
  });

  it("renders no outline for a post without H2 headings", () => {
    expect(page("/blog/http-verbs/").querySelector('nav[aria-label="On this page"]')).toBeNull();
  });
});

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
