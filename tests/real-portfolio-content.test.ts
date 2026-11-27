import { readdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { parse, type HTMLElement } from "node-html-parser";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildSite } from "./support/build-site";

// Builds the real content (src/content) and checks the migrated portfolio data
// against facts stated independently of the YAML: the source portfolio's
// lib/data.ts. Blog posts are migrated separately, so nothing here asserts on
// them or on total page counts.
let outDir: string;
let home: HTMLElement;

beforeAll(() => {
  const build = buildSite(resolve(import.meta.dirname, "../src/content"));
  if (!build.ok) throw new Error(`Real content build failed:\n${build.output}`);
  outDir = build.outDir;
  home = parse(readFileSync(join(outDir, "index.html"), "utf8"));
}, 120_000);

afterAll(() => rmSync(outDir, { recursive: true, force: true }));

const section = (id: string) => home.querySelector(`#${id}`)?.text ?? "";
const detail = (node: string) => home.querySelector(`[data-diagram] [data-node="${node}"]`)?.text ?? "";

describe("real experience", () => {
  const roles = [
    ["Web Developer", "Seoul, South Korea", 2000],
    ["Application Architect", "Hyundai Motor UK", 2006],
    ["Software Developer", "ByBox (Homebased, UK)", 2017],
    ["Senior Engineer", "Moneybox (London, UK)", 2018],
    ["Senior Software Engineer", "Adserve (Homebased, UK)", 2020],
    ["Lead Developer", "Howden, formerly Barnett Waddingham (London, UK)", 2021],
  ] as const;

  it("has six roles on the timeline", () => {
    expect(home.querySelectorAll("#experience .segment")).toHaveLength(6);
  });

  it("starts the timeline in 2000", () => {
    expect(section("experience")).toContain("timeline 2000 → now");
  });

  it.each(roles)("lists %s at %s from %i", (title, organisation, start) => {
    expect(section("experience")).toContain(`${title}, ${organisation}`);
    expect(section("experience")).toContain(`${start} —`);
  });

  it("marks only the last role, Lead Developer, as current", () => {
    const current = home.querySelectorAll("#experience .segment[data-current]");
    expect(current).toHaveLength(1);
    expect(current[0].text.trim()).toBe("6");
  });

  it("keeps a role's takeaway label and text", () => {
    expect(section("experience")).toContain("What this chapter is teaching me:");
    expect(section("experience")).toContain("the patience and precision needed to modernise legacy systems");
  });
});

describe("real projects", () => {
  it.each(["Feature Toggle Platform", "Team Retrospective Board", "Pension self-service", "Adserve Studio", "Moneybox App", "Pledge Service Integration"])(
    "lists %s",
    (title) => {
      expect(section("projects")).toContain(title);
    },
  );

  it("has one row per project", () => {
    expect(home.querySelectorAll("#projects tbody tr")).toHaveLength(6);
  });

  it("keeps a project's stack tags", () => {
    expect(section("projects")).toContain(".NET Framework 4.7.2 – .NET 8");
    expect(section("projects")).toContain("Azure Functions");
  });

  it("shows no project thumbnails (an open visual decision)", () => {
    expect(home.querySelectorAll("#projects img")).toHaveLength(0);
  });
});

describe("real skills", () => {
  it.each(["C#", "Clean Architecture", "TypeScript", "Cypress", "Claude Code", "Kubernetes"])("lists %s", (skill) => {
    expect(section("skills")).toContain(skill);
  });

  it.each(["Backend", "Frontend", "AI Tools", "Areas of interest"])("has a %s group", (group) => {
    expect(section("skills")).toContain(group);
  });
});

describe("real publications and certifications", () => {
  it.each([
    ["Pro ASP.NET MVC 5 (Korean translation)", "2014"],
    ["ASP.NET REBOOT — ASP.NET Core series", "2015"],
    ["Award in Pension Essentials", "2024"],
    ["Microsoft Azure Developer Associate", "2022"],
    ["AWS Cloud Practitioner", "2021"],
  ])("lists %s from %s", (title, year) => {
    const card = home.querySelectorAll("#publications .card").find((c) => c.text.includes(title));
    expect(card?.text).toContain(year);
  });
});

describe("real diagram counts", () => {
  it("counts six projects", () => {
    expect(detail("projects")).toContain("6 projects");
  });

  it("counts six roles since 2000", () => {
    expect(detail("experience")).toContain("6 roles since 2000");
  });

  it("counts two publications and three certifications", () => {
    expect(detail("publications")).toContain("2 publications");
    expect(detail("publications")).toContain("3 certs");
  });
});

describe("real About text", () => {
  it("is in the #about section, which the header link /#about points at", () => {
    expect(home.querySelector("#about")).not.toBeNull();
    expect(home.querySelector('a[href="/#about"]')).not.toBeNull();
  });

  it("opens with the portfolio's first-person introduction", () => {
    expect(section("about")).toContain("My name is Jake Ryu. I was born and raised in South Korea");
  });

  it("carries the facts merged in from the blog's About", () => {
    expect(section("about")).toContain("After gaining six years of experience in Korea");
    expect(section("about")).toContain("English Premier League (EPL)");
  });

  it("links Howden as the current employer", () => {
    expect(home.querySelector('#about a[href="https://www.howdengroup.com"]')?.text.trim()).toBe("Howden");
  });

  it("describes Howden as a global insurance group and mentions its former name", () => {
    expect(section("about")).toContain("(formerly Barnett Waddingham), a global insurance group");
  });

  it("mentions Barnett Waddingham only as the former name", () => {
    const text = home.text.replace(/\s+/g, " ");
    expect(text.match(/Barnett Waddingham/g)).toHaveLength(text.match(/formerly Barnett Waddingham/g)?.length ?? -1);
  });
});

describe("not migrated without consent", () => {
  it("ships neither the CV nor personal photos", () => {
    const files = readdirSync(outDir, { recursive: true, encoding: "utf8" });
    expect(files.filter((name) => /CV\.pdf|jake\.jpeg|jake-sketch|astronaut/.test(name))).toEqual([]);
  });
});
