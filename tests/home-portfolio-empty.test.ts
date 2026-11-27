import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { parse } from "node-html-parser";
import { describe, expect, it } from "vitest";
import { buildSite, fixtures } from "./support/build-site";

// The real portfolio folders start empty (data arrives in a later ticket), so
// the home page must build and simply omit the sections.
describe("home page with no portfolio data", () => {
  it("builds, omits the portfolio and experience sections and keeps the hero links", () => {
    const build = buildSite(join(fixtures, "empty"));
    try {
      expect(build.ok, build.output).toBe(true);
      const home = parse(readFileSync(join(build.outDir, "index.html"), "utf8"));
      for (const id of ["experience", "projects", "skills", "publications"]) {
        expect(home.querySelector(`#${id}`), id).toBeNull();
      }
      expect(home.querySelector(`main a[href="https://github.com/JakeRyu"]`)).not.toBeNull();
    } finally {
      rmSync(build.outDir, { recursive: true, force: true });
    }
  }, 60_000);
});
