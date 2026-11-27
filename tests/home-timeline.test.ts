import { describe, expect, it } from "vitest";
import { filesWithExtension, page } from "./support/built-site";

describe("home page experience timeline", () => {
  it("shows each fixture role with its title, employer and chapter name", () => {
    const experience = page("/").querySelector("#experience");
    expect(experience?.text).toContain("Fixture Apprentice");
    expect(experience?.text).toContain("Fixture Studio, Seoul");
    expect(experience?.text).toContain("fixture beginnings");
    expect(experience?.text).toContain("Fixture Architect");
    expect(experience?.text).toContain("Fixture Consulting");
  });
});

// Segment geometry is read from the inline style, e.g. "left: 12.5%; width: 25%".
function segments() {
  return page("/")
    .querySelectorAll("#experience .segment")
    .map((el) => {
      const style = el.getAttribute("style") ?? "";
      return {
        el,
        left: parseFloat(/left:\s*([\d.]+)%/.exec(style)?.[1] ?? "NaN"),
        width: parseFloat(/width:\s*([\d.]+)%/.exec(style)?.[1] ?? "NaN"),
      };
    });
}

describe("home page experience timeline proportions", () => {
  // Fixture years: 2000-2006 (6 years) and 2006-2018 (12 years) are closed, so the
  // second must be exactly twice as wide as the first whatever year the build runs in.
  it("draws closed roles in proportion to their durations", () => {
    const [first, second] = segments();
    expect(second.width).toBeCloseTo(first.width * 2, 1);
  });

  it("starts each role where the previous one ended", () => {
    const [first, second, third] = segments();
    expect(first.left).toBe(0);
    expect(second.left).toBeCloseTo(first.width, 1);
    expect(third.left).toBeCloseTo(first.width + second.width, 1);
  });

  it("runs the current role to the end of the bar", () => {
    const current = segments()[2];
    expect(current.width).toBeGreaterThan(0);
    expect(current.left + current.width).toBeCloseTo(100, 1);
  });
});

describe("home page experience timeline current role", () => {
  it("marks only the current role, which has no end year", () => {
    const marked = segments().map(({ el }) => el.hasAttribute("data-current"));
    expect(marked).toEqual([false, false, true]);
  });

  it("colours the marked segment with the accent", () => {
    const accentRule = filesWithExtension(".css").some((css) =>
      /\[data-current\][^{}]*\{[^}]*background:\s*var\(--accent\)/.test(css),
    );
    expect(accentRule).toBe(true);
  });
});

describe("home page experience timeline legend", () => {
  it("is listed newest first below tablet width, by reversing the oldest-first list", () => {
    const items = page("/").querySelectorAll("#experience .legend li");
    expect(items.map((li) => li.querySelector("strong")?.text)).toEqual([
      "Fixture Apprentice",
      "Fixture Architect",
      "Fixture Lead",
    ]);
    const reversedBelowTablet = filesWithExtension(".css").some((css) =>
      /@media\s*\((?:max-width:\s*767px|width\s*<=\s*767px)\)\s*\{[^@]*\.legend[^{}]*\{[^}]*flex-direction:\s*column-reverse/.test(css),
    );
    expect(reversedBelowTablet).toBe(true);
  });
});
