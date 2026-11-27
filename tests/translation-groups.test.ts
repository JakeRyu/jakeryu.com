import { rmSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSite, fixtures } from "./support/build-site";

describe("translation groups", () => {
  it("fail the build when two posts in one group share a language", () => {
    const build = buildSite(join(fixtures, "invalid", "duplicate-language"));
    rmSync(build.outDir, { recursive: true, force: true });
    expect(build.ok).toBe(false);
    expect(build.output).toMatch(/clash[\s\S]*"en"[\s\S]*one[\s\S]*two/);
  }, 60_000);
});
