import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse, type HTMLElement } from "node-html-parser";
import { inject } from "vitest";

// Reads a built page by its URL path, e.g. "/" or "/blog/some-post/".
export function page(urlPath: string): HTMLElement {
  const file = join(inject("outDir"), urlPath, urlPath.endsWith(".html") ? "" : "index.html");
  return parse(readFileSync(file, "utf8"));
}

// Reads every built file with the given extension (e.g. ".css") and returns
// the contents, for asserting on assets rather than pages.
export function filesWithExtension(extension: string): string[] {
  const root = inject("outDir");
  return readdirSync(root, { recursive: true, encoding: "utf8" })
    .filter((name) => name.endsWith(extension))
    .map((name) => readFileSync(join(root, name), "utf8"));
}

// True when a page was built at the given URL path.
export function pageExists(urlPath: string): boolean {
  return existsSync(join(inject("outDir"), urlPath, "index.html"));
}

// True when a built file exists at the given URL path, e.g. "/_astro/x.png".
export function fileExists(urlPath: string): boolean {
  return existsSync(join(inject("outDir"), urlPath));
}
