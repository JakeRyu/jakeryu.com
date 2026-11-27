import { describe, expect, it } from "vitest";
import { page, pageExists } from "./support/built-site";

const hrefs = (urlPath: string, selector: string) =>
  page(urlPath)
    .querySelectorAll(selector)
    .map((link) => link.getAttribute("href"));

describe("tag index", () => {
  it("lists a tag used by a published post, linking to its tag page", () => {
    expect(hrefs("/blog/tags/", "a")).toContain("/blog/tags/rest-api/");
  });

  it("lists a tag only the English half of a translated pair carries", () => {
    expect(hrefs("/blog/tags/", "a")).toContain("/blog/tags/clean-architecture/");
  });

  it("does not list a tag used only by drafts", () => {
    expect(hrefs("/blog/tags/", "a")).not.toContain("/blog/tags/draft-only-tag/");
  });
});

describe("tags on a post page", () => {
  const tagLinks = (slug: string) => hrefs(`/blog/${slug}/`, "dl a");

  it("link to their tag pages, using the slug of each tag", () => {
    expect(tagLinks("rest-design")).toEqual(["/blog/tags/rest-api/", "/blog/tags/clean-architecture/"]);
    expect(tagLinks("dotnet-notes")).toEqual(["/blog/tags/net/"]);
  });

  it("all resolve to a built page", () => {
    for (const slug of ["rest-design", "rest-design-ko", "rest-versioning", "dotnet-notes", "hello-en"]) {
      expect(tagLinks(slug).length).toBeGreaterThan(0);
      for (const href of tagLinks(slug)) expect(pageExists(href!), `${slug} links to ${href}`).toBe(true);
    }
  });
});

describe("related posts", () => {
  const related = (slug: string) => hrefs(`/blog/${slug}/`, "[data-related] a");

  it("lists other posts sharing a tag", () => {
    expect(related("rest-versioning")).toContain("/blog/rest-design/");
  });

  it("excludes the post itself and its own translation", () => {
    const links = related("rest-design");
    expect(links).not.toContain("/blog/rest-design/");
    expect(links).not.toContain("/blog/rest-design-ko/");
    expect(links).toContain("/blog/rest-versioning/");
  });

  it("lists a translated pair once", () => {
    const links = related("rest-versioning");
    expect(links.filter((href) => href === "/blog/rest-design/")).toHaveLength(1);
    expect(links).not.toContain("/blog/rest-design-ko/");
  });

  it("prefers the same language: English posts list English related posts first", () => {
    const links = related("rest-design");
    expect(links.indexOf("/blog/rest-versioning/")).toBeLessThan(links.indexOf("/blog/rest-korean/"));
  });

  it("prefers the same language: Korean posts list Korean related posts first", () => {
    const links = related("rest-design-ko");
    expect(links.indexOf("/blog/rest-korean/")).toBeLessThan(links.indexOf("/blog/rest-versioning/"));
  });

  it("still lists related posts in the other language after the same-language ones", () => {
    expect(related("rest-design")).toContain("/blog/rest-korean/");
  });

  it("does not list a draft", () => {
    expect(related("rest-versioning")).not.toContain("/blog/rest-draft/");
  });

  it("is absent when no other post shares a tag", () => {
    expect(page("/blog/dotnet-notes/").querySelector("[data-related]")).toBeNull();
  });
});

describe("tag page", () => {
  it("exists for a tag used by a published post", () => {
    expect(pageExists("/blog/tags/rest-api/")).toBe(true);
  });

  it("exists under the slug of a tag with punctuation, as github-slugger would make it", () => {
    expect(pageExists("/blog/tags/net/")).toBe(true);
  });

  it("does not exist for a tag used only by drafts", () => {
    expect(pageExists("/blog/tags/draft-only-tag/")).toBe(false);
  });

  const entryLinks = () => hrefs("/blog/tags/rest-api/", "[data-entry] a");

  it("lists a published post carrying the tag", () => {
    expect(entryLinks()).toContain("/blog/rest-versioning/");
  });

  it("lists a translated pair once, as the English post", () => {
    const links = entryLinks();
    expect(links.filter((href) => href === "/blog/rest-design/")).toHaveLength(1);
    expect(links).not.toContain("/blog/rest-design-ko/");
  });

  it("does not list a draft", () => {
    expect(entryLinks()).not.toContain("/blog/rest-draft/");
  });

  it("does not list a post without the tag", () => {
    expect(entryLinks()).not.toContain("/blog/dotnet-notes/");
  });
});
