import { describe, expect, it } from "vitest";
import { filesWithExtension, page } from "./support/built-site";

const writing = () => page("/").querySelector("#writing");
const rows = () => writing()?.querySelectorAll("[data-post]") ?? [];
const hrefs = () => rows().map((row) => row.querySelector("a")?.getAttribute("href"));

// The latest-* fixtures are dated 9999-12-29 to 9999-12-31 so they are always among the
// five newest posts, however many other fixtures exist. Keep other fixtures' dates earlier.
const row = (href: string) => rows().find((r) => r.querySelector("a")?.getAttribute("href") === href);

describe("home page latest posts order and limit", () => {
  const dates = () => rows().map((row) => row.querySelector("time")?.getAttribute("datetime") ?? "");

  it("lists the most recent first", () => {
    expect(dates().length).toBeGreaterThan(1);
    expect(dates()).toEqual([...dates()].sort().reverse());
  });

  it("shows at most five posts and links to all of them", () => {
    expect(rows().length).toBeLessThanOrEqual(5);
    expect(writing()?.querySelector('a[href="/blog/"]')?.text).toContain("All posts");
  });

  it("shows the languages each post is available in", () => {
    expect(row("/blog/latest-pair/")?.querySelector(".meta")?.text).toContain("en · ko");
  });
});

describe("home page latest posts badge", () => {
  it("colours the GET badge with the GET method tokens", () => {
    // The blog list has its own .badge rule, so the home one is found by its scoped-style id.
    const scope = Object.keys(writing()?.querySelector(".badge")?.attributes ?? {}).find((a) => a.startsWith("data-astro-cid-"));
    const rule = filesWithExtension(".css")
      .join("\n")
      .match(new RegExp(`\\.badge\\[${scope}\\][^{},]*\\{[^}]*\\}`))?.[0];
    expect(rule).toMatch(/background:\s*var\(--get-bg\)/);
    expect(rule).toMatch(/[;{\s]color:\s*var\(--get-fg\)/);
  });
});

describe("home page section order", () => {
  it("runs the diagram, Writing, Projects, Skills, Experience, Publications", () => {
    const home = page("/");
    const order = ["[data-diagram]", "#writing", "#projects", "#skills", "#experience", "#publications"];
    const html = home.toString();
    const positions = order.map((selector) => {
      const el = home.querySelector(selector);
      expect(el, selector).not.toBeNull();
      return html.indexOf(el!.outerHTML.slice(0, 60));
    });
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });
});

describe("home page latest posts drafts", () => {
  it("leaves out draft posts", () => {
    expect(hrefs()).not.toContain("/blog/latest-draft/");
    expect(writing()?.text).not.toContain("Latest draft");
  });
});

describe("home page latest posts", () => {
  it("lists a post as a GET /blog/<slug> row linking to the post, with its title", () => {
    const plain = row("/blog/latest-plain/");
    expect(plain?.querySelector(".badge")?.text.trim()).toBe("GET");
    expect(plain?.text).toContain("/blog/latest-plain");
    expect(plain?.text).toContain("Latest plain post");
  });

  it("shows a translated pair once, represented by the English post, with both languages", () => {
    expect(hrefs().filter((href) => href === "/blog/latest-pair/").length).toBe(1);
    expect(hrefs()).not.toContain("/blog/latest-pair-ko/");
  });
});
