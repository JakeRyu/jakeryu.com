import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse, type HTMLElement } from "node-html-parser";
import { inject } from "vitest";

// Reads a built page by its URL path, e.g. "/" or "/blog/some-post/".
export function page(urlPath: string): HTMLElement {
  const file = join(inject("outDir"), urlPath, urlPath.endsWith(".html") ? "" : "index.html");
  return parse(readFileSync(file, "utf8"));
}
