import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    outDir: string;
  }
}

const root = resolve(import.meta.dirname, "../..");

// Builds the production site once, against the fixture content set, into a
// throwaway directory. Tests assert on what lands in that directory.
export default function setup(project: TestProject) {
  const outDir = mkdtempSync(join(tmpdir(), "jakeryu-site-"));
  execFileSync(join(root, "node_modules/.bin/astro"), ["build", "--outDir", outDir], {
    cwd: root,
    env: { ...process.env, CONTENT_DIR: join(root, "tests/fixtures/content") },
    stdio: "inherit",
  });
  project.provide("outDir", outDir);
  return () => rmSync(outDir, { recursive: true, force: true });
}
