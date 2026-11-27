import type { HastNode } from "./hast";

// Wraps each table in a container so a wide table scrolls inside its own box
// instead of stretching the page.
export function rehypeTableScroll() {
  function visit(node: HastNode) {
    node.children = (node.children ?? []).map((child) => {
      if (child.type !== "element") return child;
      if (child.tagName === "table") {
        return { type: "element", tagName: "div", properties: { className: ["table-scroll"] }, children: [child] };
      }
      visit(child);
      return child;
    });
  }

  return (tree: HastNode) => visit(tree);
}
