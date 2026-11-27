import { describe, expect, it } from "vitest";
import { fileExists, filesWithExtension, page } from "./support/built-site";

describe("home page projects", () => {
  it("lists a fixture project with its description, role and stack", () => {
    const projects = page("/").querySelector("#projects");
    expect(projects?.text).toContain("Fixture Platform");
    expect(projects?.text).toContain("A fixture project that exists only to exercise the home page.");
    expect(projects?.text).toContain("Fixture lead");
    expect(projects?.text).toContain("Fixture.NET");
    expect(projects?.text).toContain("FixtureDB");
  });
});

describe("home page projects layout", () => {
  it("is a table that the built CSS turns into cards below tablet width", () => {
    expect(page("/").querySelector("#projects table")).not.toBeNull();
    // Hiding the header row below 767px is what marks the card layout.
    const cardsRule = filesWithExtension(".css").some((css) =>
      /@media\s*\((?:max-width:\s*767px|width\s*<=\s*767px)\)\s*\{[^@]*thead[^{}]*\{display:\s*none/.test(css),
    );
    expect(cardsRule).toBe(true);
  });
});

describe("home page skills", () => {
  it("shows a fixture skill group with its items", () => {
    const skills = page("/").querySelector("#skills");
    expect(skills?.text).toContain("Fixture Backend");
    expect(skills?.text).toContain("FixtureSharp");
    expect(skills?.text).toContain("FixtureQL");
  });
});

describe("home page publications and certifications", () => {
  it("shows a fixture publication with its year", () => {
    const publications = page("/").querySelector("#publications");
    expect(publications?.text).toContain("The Fixture Handbook");
    expect(publications?.text).toContain("2015");
  });

  it("shows a fixture certification with its year", () => {
    const publications = page("/").querySelector("#publications");
    expect(publications?.text).toContain("Fixture Certified Associate");
    expect(publications?.text).toContain("2022");
  });
});

describe("home page links", () => {
  // The CV is only published with Jake's explicit consent, so the site offers no download.
  it("does not offer a CV download", () => {
    expect(page("/").querySelector("main a[download]")).toBeNull();
    expect(fileExists("/CV.pdf")).toBe(false);
  });

  it.each([
    ["GitHub", "https://github.com/JakeRyu"],
    ["X", "https://x.com/jakeryu"],
    ["email", "mailto:jake@jakeryu.com"],
  ])("links to %s from the main content", (_label, href) => {
    expect(page("/").querySelector(`main a[href="${href}"]`)).not.toBeNull();
  });
});
