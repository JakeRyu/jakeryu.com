// The small part of the hast tree shape the rehype plugins need, so they don't
// depend on packages that Astro only provides transitively.
export interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}
