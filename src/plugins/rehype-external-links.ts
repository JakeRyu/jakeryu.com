import type { HastNode } from "./hast";

// Marks http(s) links that leave the site so they open in a new tab. Authors
// write plain Markdown links; relative links and links to the site itself are
// left alone.
export function rehypeExternalLinks({ origin }: { origin: string }) {
  const host = new URL(origin).host;

  function isExternal(href: unknown): boolean {
    if (typeof href !== "string" || !/^(https?:)?\/\//.test(href)) return false;
    try {
      return new URL(href, origin).host !== host;
    } catch {
      return false;
    }
  }

  function visit(node: HastNode) {
    for (const child of node.children ?? []) {
      if (child.type !== "element") continue;
      if (child.tagName === "a" && child.properties && isExternal(child.properties.href)) {
        child.properties.target = "_blank";
        child.properties.rel = ["noopener", "noreferrer"];
      }
      visit(child);
    }
  }

  return (tree: HastNode) => visit(tree);
}
