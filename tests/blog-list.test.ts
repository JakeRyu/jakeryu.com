import { describe, expect, it } from "vitest";
import { page } from "./support/built-site";

// The list entries linking to a post, found by the URL they point at.
function entries(slug: string) {
  return page("/blog/")
    .querySelectorAll("[data-entry]")
    .filter((e) => e.querySelector("a")?.getAttribute("href") === `/blog/${slug}/`);
}

describe("blog list", () => {
  it("shows a translated pair once, represented by the English post", () => {
    expect(entries("http-verbs")).toHaveLength(1);
    expect(entries("http-verbs-ko")).toHaveLength(0);
  });

  it("shows both languages on a translated pair", () => {
    expect(entries("http-verbs")[0].getAttribute("data-languages")).toBe("en ko");
    expect(entries("http-verbs")[0].text).toContain("en · ko · 2024-06-08");
  });

  it("shows an English-only post once with its one language", () => {
    expect(entries("hello-en")).toHaveLength(1);
    expect(entries("hello-en")[0].getAttribute("data-languages")).toBe("en");
  });

  it("shows a Korean-only post once with its one language", () => {
    expect(entries("korean-only")).toHaveLength(1);
    expect(entries("korean-only")[0].getAttribute("data-languages")).toBe("ko");
  });

  it("omits draft posts", () => {
    expect(entries("draft-post")).toHaveLength(0);
  });

  it("hides no entry in the static HTML, so it works without JavaScript", () => {
    expect(page("/blog/").querySelectorAll("[data-entry][hidden]")).toHaveLength(0);
  });

  it("offers All, English and 한국어 filters", () => {
    const labels = page("/blog/")
      .querySelectorAll("[data-filter]")
      .map((b) => b.text.trim());
    expect(labels).toEqual(["All", "English", "한국어"]);
  });
});
