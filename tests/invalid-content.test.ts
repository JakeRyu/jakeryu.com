import { rmSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSite, fixtures } from "./support/build-site";

// Each case is its own production build, against a content set with exactly
// one frontmatter mistake. The build must fail, and the message must name the
// post and the offending field so the author can find it.
function failedBuild(caseName: string) {
  const build = buildSite(join(fixtures, "invalid", caseName));
  rmSync(build.outDir, { recursive: true, force: true });
  return build;
}

describe("invalid frontmatter fails the build", () => {
  it("when the title is missing", () => {
    const build = failedBuild("missing-title");
    expect(build.ok).toBe(false);
    expect(build.output).toMatch(/bad-post[\s\S]*title/);
  }, 60_000);

  it("when the date is invalid", () => {
    const build = failedBuild("invalid-date");
    expect(build.ok).toBe(false);
    expect(build.output).toMatch(/bad-post[\s\S]*date/);
  }, 60_000);

  it("when the language is unknown", () => {
    const build = failedBuild("unknown-language");
    expect(build.ok).toBe(false);
    expect(build.output).toMatch(/bad-post[\s\S]*language/);
  }, 60_000);
});
