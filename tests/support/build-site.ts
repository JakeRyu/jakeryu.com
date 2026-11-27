import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");

export const fixtures = join(root, "tests/fixtures");

// Runs a production build against the given content directory into a
// throwaway output directory, and reports whether it succeeded.
export function buildSite(contentDir: string) {
  const outDir = mkdtempSync(join(tmpdir(), "jakeryu-site-"));
  const result = spawnSync(join(root, "node_modules/.bin/astro"), ["build", "--outDir", outDir], {
    cwd: root,
    // Vitest sets NODE_ENV=test, which Astro would treat as a non-production
    // build (drafts included), so it is overridden explicitly.
    env: { ...process.env, NODE_ENV: "production", CONTENT_DIR: contentDir },
    encoding: "utf8",
  });
  return { ok: result.status === 0, output: `${result.stdout}${result.stderr}`, outDir };
}
