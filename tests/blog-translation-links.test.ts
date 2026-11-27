import { describe, expect, it } from "vitest";
import { page } from "./support/built-site";

const languageLink = (slug: string) => page(`/blog/${slug}/`).querySelector("[data-translation-link]");
const alternates = (slug: string) => page(`/blog/${slug}/`).querySelectorAll('link[rel="alternate"][hreflang]');

const thisPost = (slug: string) => page(`/blog/${slug}/`).querySelector(".translation .this .title");

describe("post language link", () => {
  it("links the English post to its Korean translation", () => {
    expect(languageLink("http-verbs")?.getAttribute("href")).toBe("/blog/http-verbs-ko/");
  });

  it("links the Korean post to its English translation", () => {
    expect(languageLink("http-verbs-ko")?.getAttribute("href")).toBe("/blog/http-verbs/");
  });

  it("declares the Korean translation as an alternate on the English post, on the canonical origin", () => {
    const [link, ...rest] = alternates("http-verbs");
    expect(rest).toHaveLength(0);
    expect(link.getAttribute("hreflang")).toBe("ko");
    expect(link.getAttribute("href")).toBe("https://jakeryu.com/blog/http-verbs-ko/");
  });

  it("declares the English translation as an alternate on the Korean post, on the canonical origin", () => {
    const [link, ...rest] = alternates("http-verbs-ko");
    expect(rest).toHaveLength(0);
    expect(link.getAttribute("hreflang")).toBe("en");
    expect(link.getAttribute("href")).toBe("https://jakeryu.com/blog/http-verbs/");
  });

  it("gives untranslated posts no language link", () => {
    expect(languageLink("hello-en")).toBeNull();
    expect(languageLink("korean-only")).toBeNull();
  });

  it("gives untranslated posts no alternate metadata", () => {
    expect(alternates("hello-en")).toHaveLength(0);
    expect(alternates("korean-only")).toHaveLength(0);
  });

  it("shows the English post's title in the «this post» node", () => {
    expect(thisPost("http-verbs")?.textContent?.trim()).toBe("HTTP verbs");
  });

  it("marks the «this post» title of the English post as English", () => {
    expect(thisPost("http-verbs")?.getAttribute("lang")).toBe("en");
  });

  it("shows the Korean post's title in the «this post» node", () => {
    expect(thisPost("http-verbs-ko")?.textContent?.trim()).toBe("HTTP 동사");
  });

  it("marks the «this post» title of the Korean post as Korean", () => {
    expect(thisPost("http-verbs-ko")?.getAttribute("lang")).toBe("ko");
  });
});
