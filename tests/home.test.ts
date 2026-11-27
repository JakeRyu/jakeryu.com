import { describe, expect, it } from "vitest";
import { page } from "./support/built-site";

describe("home page", () => {
  it("shows the site name and slogan", () => {
    const home = page("/");
    expect(home.querySelector("h1")?.text.trim()).toBe("Jake Ryu");
    expect(home.text).toContain("Design with Depth, Build with Intent");
  });
});
