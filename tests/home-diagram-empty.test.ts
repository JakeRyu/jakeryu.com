import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { parse } from "node-html-parser";
import { describe, expect, it } from "vitest";
import { buildSite, fixtures } from "./support/build-site";

// The real content folders start empty. The diagram then keeps only Jake: a node
// is left out together with its section, so no link points at a missing anchor.
describe("home page diagram and latest posts with no content", () => {
  it("builds, keeps the hero heading and Jake, and omits every node and the Writing section", () => {
    const build = buildSite(join(fixtures, "empty"));
    try {
      expect(build.ok, build.output).toBe(true);
      const home = parse(readFileSync(join(build.outDir, "index.html"), "utf8"));
      expect(home.querySelector("h1")?.text.trim()).toBe("Jake Ryu");
      expect(home.querySelector("[data-diagram] .person")).not.toBeNull();
      expect(home.querySelectorAll("[data-diagram] [data-node]")).toHaveLength(0);
      expect(home.querySelector("#writing")).toBeNull();
    } finally {
      rmSync(build.outDir, { recursive: true, force: true });
    }
  }, 60_000);
});
