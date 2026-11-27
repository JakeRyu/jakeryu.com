import { describe, expect, it } from "vitest";
import { filesWithExtension, page } from "./support/built-site";

const diagram = () => page("/").querySelector("[data-diagram]");
const node = (name: string) => diagram()?.querySelector(`[data-node="${name}"]`);

// Counts are derived from other output of the same build, never hard-coded,
// because other fixtures are added in parallel.
const countIn = (name: string, noun: RegExp) => {
  const match = noun.exec(node(name)?.text ?? "");
  return match ? Number(match[1]) : NaN;
};

describe("home page system-context diagram counts", () => {
  it("counts posts as the entries the reader sees on /blog, drafts excluded", () => {
    const listed = page("/blog/").querySelectorAll("[data-entry]").length;
    expect(listed).toBeGreaterThan(0);
    expect(countIn("writing", /(\d+) posts?/)).toBe(listed);
  });
});

describe("home page system-context diagram counts of portfolio data", () => {
  it("counts projects as the rows of the projects section", () => {
    const rows = page("/").querySelectorAll("#projects tbody tr").length;
    expect(rows).toBeGreaterThan(0);
    expect(countIn("projects", /(\d+) projects?/)).toBe(rows);
  });
});

describe("home page system-context diagram counts of roles", () => {
  it("counts roles as the segments of the experience timeline, and names the first year", () => {
    const segments = page("/").querySelectorAll("#experience .segment").length;
    expect(segments).toBeGreaterThan(0);
    expect(countIn("experience", /(\d+) roles?/)).toBe(segments);
    expect(node("experience")?.text).toContain("since 2000");
  });
});

describe("home page system-context diagram counts of publications", () => {
  it("counts publications and certifications as the cards of that kind in the publications section", () => {
    const cards = page("/").querySelectorAll("#publications .card");
    const ofKind = (kind: string) => cards.filter((card) => card.text.includes(`«${kind}»`)).length;
    expect(ofKind("publication")).toBeGreaterThan(0);
    expect(ofKind("certification")).toBeGreaterThan(0);
    expect(countIn("publications", /(\d+) publications?/)).toBe(ofKind("publication"));
    expect(countIn("publications", /(\d+) certs?/)).toBe(ofKind("certification"));
  });
});

describe("home page system-context diagram text alternative", () => {
  it("states Jake and every node with its count in an accessible name, keeping the nodes real links", () => {
    const label = diagram()?.getAttribute("aria-label") ?? "";
    expect(label).toContain("Jake Ryu");
    for (const name of ["writing", "projects", "experience", "publications"]) {
      const target = node(name);
      expect(target?.tagName, name).toBe("A");
      expect(label, name).toContain(target?.querySelector("[data-detail]")?.text.trim());
    }
  });

  it("hides the purely decorative connectors from assistive technology", () => {
    const connectors = diagram()?.querySelectorAll("[data-connector]") ?? [];
    expect(connectors.length).toBeGreaterThan(0);
    for (const connector of connectors) expect(connector.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("home page system-context diagram layout", () => {
  const css = () => filesWithExtension(".css").join("\n");

  it("becomes a vertical spine below tablet width, with nodes stacked in a column", () => {
    const spine = /@media\s*\((?:max-width:\s*767px|width\s*<=\s*767px)\)\s*\{[^@]*\bul\b[^{}]*\{[^}]*flex-direction:\s*column[^}]*width:\s*auto/.test(
      css(),
    );
    expect(spine).toBe(true);
  });

  it("fills the person node with --ink and its text with --surface, which swap in dark mode", () => {
    // The minifier reorders declarations, so the rule is checked as a set.
    const rule = /\.person[^{},]*\{([^}]*)\}/.exec(css())?.[1] ?? "";
    expect(rule).toMatch(/background:\s*var\(--ink\)/);
    expect(rule).toMatch(/[;{\s]color:\s*var\(--surface\)/);
    // In the dark half of each light-dark() pair the ink is the lighter colour.
    const dark = (token: string) => /light-dark\(\s*#[0-9a-f]{3,6}\s*,\s*(#[0-9a-f]{6})\s*\)/.exec(
      new RegExp(`--${token}:[^;]*`).exec(css())?.[0] ?? "",
    )?.[1];
    expect(dark("ink")! > dark("surface")!).toBe(true);
  });
});

describe("home page system-context diagram links", () => {
  it("links each node to its section on the home page", () => {
    expect(node("writing")?.getAttribute("href")).toBe("/#writing");
    expect(node("projects")?.getAttribute("href")).toBe("/#projects");
    expect(node("experience")?.getAttribute("href")).toBe("/#experience");
    expect(node("publications")?.getAttribute("href")).toBe("/#publications");
  });

  it("points every node at a section that exists on the page", () => {
    for (const name of ["writing", "projects", "experience", "publications"]) {
      expect(page("/").querySelector(`#${name}`), name).not.toBeNull();
    }
  });
});
