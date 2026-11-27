import { rmSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSite, fixtures } from "./support/build-site";

// Each case is its own production build, against a content set with exactly
// one experience mistake. The build must fail and name the entry and field.
describe("invalid experience data fails the build", () => {
  it.each([
    ["experience-missing-chapter", /bad-role[\s\S]*chapter/],
    ["experience-bad-start", /bad-role[\s\S]*start/],
  ])("for %s", (caseName, message) => {
    const build = buildSite(join(fixtures, "invalid", caseName));
    rmSync(build.outDir, { recursive: true, force: true });
    expect(build.ok).toBe(false);
    expect(build.output).toMatch(message);
  }, 60_000);
});
