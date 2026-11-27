// The one slug function for tags, used to generate tag pages and to build every
// tag link. Behaves like `github-slugger`: lowercase, drop punctuation, spaces to hyphens.
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}_\s-]/gu, "")
    .replace(/ /g, "-");
}
