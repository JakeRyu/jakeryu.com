import { rmSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSite, fixtures } from "./support/build-site";

// Each case is its own production build, against a content set with exactly
// one portfolio data mistake. The build must fail and name the entry and field.
function failedBuild(caseName: string) {
  const build = buildSite(join(fixtures, "invalid", caseName));
  rmSync(build.outDir, { recursive: true, force: true });
  return build;
}

describe("invalid portfolio data fails the build", () => {
  it.each([
    ["project-missing-role", /bad-project[\s\S]*role/],
    ["project-empty-stack", /bad-project[\s\S]*stack/],
    ["skill-group-empty", /bad-group[\s\S]*items/],
    ["publication-bad-year", /bad-publication[\s\S]*year/],
    ["certification-missing-title", /bad-cert[\s\S]*title/],
  ])("for %s", (caseName, message) => {
    const build = failedBuild(caseName);
    expect(build.ok).toBe(false);
    expect(build.output).toMatch(message);
  }, 60_000);
});
