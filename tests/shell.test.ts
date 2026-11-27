import { describe, expect, it } from "vitest";
import { filesWithExtension, page } from "./support/built-site";

const pages = [
  ["home", "/"],
  ["404", "/404.html"],
] as const;

describe.each(pages)("site shell on the %s page", (_name, path) => {
  it("has a header whose logo links home", () => {
    expect(page(path).querySelector('header a[href="/"]')).not.toBeNull();
  });

  it.each([
    ["GitHub", "https://github.com/JakeRyu"],
    ["X", "https://x.com/jakeryu"],
    ["Email", "mailto:jake@jakeryu.com"],
  ])("has a footer link to %s", (_label, href) => {
    expect(page(path).querySelector(`footer a[href="${href}"]`)).not.toBeNull();
  });
});

describe("404 page", () => {
  it("links back home from its main content", () => {
    expect(page("/404.html").querySelector('main a[href="/"]')).not.toBeNull();
  });
});

describe.each(pages)("theme on the %s page", (_name, path) => {
  it("applies the stored theme from a blocking inline script in the head", () => {
    const blocking = page(path)
      .querySelectorAll("head script")
      .filter(
        (script) =>
          !script.getAttribute("src") &&
          !["module", "async", "defer"].some((name) => script.hasAttribute(name) || script.getAttribute("type") === name) &&
          script.text.includes("localStorage"),
      );
    expect(blocking).toHaveLength(1);
  });

  it("has a labelled theme toggle button in the header", () => {
    expect(page(path).querySelector('header button[aria-label="Toggle colour theme"]')).not.toBeNull();
  });
});

describe("view transitions", () => {
  it("are enabled between pages", () => {
    expect(page("/").querySelector('meta[name="astro-view-transitions-enabled"]')).not.toBeNull();
  });
});

describe.each(pages)("mobile menu on the %s page", (_name, path) => {
  it("has a labelled menu button that controls the main navigation", () => {
    const html = page(path);
    const button = html.querySelector("header button[popovertarget]");
    expect(button?.getAttribute("aria-label")).toBe("Open menu");
    const target = html.querySelector(`#${button?.getAttribute("popovertarget")}`);
    expect(target?.tagName).toBe("NAV");
    expect(target?.getAttribute("aria-label")).toBe("Main");
    expect(target?.hasAttribute("popover")).toBe(true);
  });
});

describe("fonts", () => {
  it("are self-hosted: no built page or stylesheet requests a third-party URL", () => {
    for (const html of pages.map(([, path]) => page(path))) {
      const external = html
        .querySelectorAll("link[href]:not([rel=canonical])")
        .filter((link) => /^(https?:)?\/\//.test(link.getAttribute("href") ?? ""));
      expect(external).toHaveLength(0);
    }
    for (const css of filesWithExtension(".css")) {
      expect(css).not.toMatch(/url\(\s*["']?(https?:)?\/\//);
    }
  });

  it.each(["Geist Variable", "Geist Mono Variable", "Noto Sans KR Variable"])(
    "serve %s from a built woff2 file",
    (family) => {
      const css = filesWithExtension(".css").join("\n");
      const faces = css.match(/@font-face\s*{[^}]*}/g) ?? [];
      const own = faces.filter((face) => face.includes(`font-family:${family}`) || face.includes(`font-family:"${family}"`) || face.includes(`font-family:'${family}'`));
      expect(own.length).toBeGreaterThan(0);
      expect(own.every((face) => /url\([^)]*\.woff2/.test(face))).toBe(true);
    },
  );
});

describe("typography and motion", () => {
  const css = () => filesWithExtension(".css").join("\n");

  it("keeps Korean words together with word-break: keep-all", () => {
    expect(css()).toMatch(/:lang\(ko\)[^{}]*{[^}]*word-break:\s*keep-all/);
  });

  it("disables animation and transitions under prefers-reduced-motion", () => {
    expect(css()).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[^@]*animation:\s*none/);
  });
});
