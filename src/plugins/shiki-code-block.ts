import type { HastNode } from "./hast";

const element = (tagName: string, properties: Record<string, unknown>, children: HastNode[]): HastNode => ({
  type: "element",
  tagName,
  properties,
  children,
});

// Shiki transformer: wraps each highlighted <pre> in a block with a header
// bar holding the language and a copy button. The button is hidden until a
// script reveals it, so the block still works without JavaScript.
export const codeBlockTransformer = {
  name: "code-block",
  root(this: { options: { lang: string } }, root: HastNode) {
    const header = element("div", { className: ["code-header"], lang: "en" }, [
      element("span", { className: ["code-language"] }, [{ type: "text", value: this.options.lang } as HastNode & { value: string }]),
      element("button", { type: "button", hidden: true, "data-copy-code": "", "aria-label": "Copy code" }, [
        { type: "text", value: "Copy" } as HastNode & { value: string },
      ]),
    ]);
    root.children = [element("div", { className: ["code-block"] }, [header, ...(root.children ?? [])])];
  },
};
