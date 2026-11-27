import { rmSync } from "node:fs";
import { join } from "node:path";
import type { TestProject } from "vitest/node";
import { buildSite, fixtures } from "./build-site";

declare module "vitest" {
  export interface ProvidedContext {
    outDir: string;
  }
}

// Builds the production site once, against the fixture content set, into a
// throwaway directory. Tests assert on what lands in that directory.
export default function setup(project: TestProject) {
  const { ok, output, outDir } = buildSite(join(fixtures, "content"));
  if (!ok) throw new Error(`Fixture build failed:\n${output}`);
  project.provide("outDir", outDir);
  return () => rmSync(outDir, { recursive: true, force: true });
}
