import { getCollection, type CollectionEntry } from "astro:content";
import { tagSlug } from "./tags";

type Post = CollectionEntry<"blog">;
type Language = Post["data"]["language"];

export interface ListEntry {
  // The English post when the group has one, otherwise its only post.
  post: Post;
  languages: Language[];
}

// The single owner of translation-group logic: posts sharing a `translationKey`
// form a group, and a post without one is a group of its own. Pages use
// `listEntries` and `translationsOf` and never derive groups themselves.
async function groups(): Promise<Post[][]> {
  const posts = (await getCollection("blog")).filter((post) => !post.data.draft);
  const byKey = new Map<string, Post[]>();
  const result: Post[][] = [];
  for (const post of posts) {
    const key = post.data.translationKey;
    if (key === undefined) {
      result.push([post]);
      continue;
    }
    const group = byKey.get(key);
    if (group) group.push(post);
    else {
      const created = [post];
      byKey.set(key, created);
      result.push(created);
    }
  }
  for (const [key, group] of byKey) {
    const languages = group.map((post) => post.data.language);
    const duplicate = languages.find((language, i) => languages.indexOf(language) !== i);
    if (duplicate) {
      const slugs = group.filter((post) => post.data.language === duplicate).map((post) => post.id);
      throw new Error(
        `Translation group "${key}" has more than one "${duplicate}" post: ${slugs.join(", ")}. Each language may appear once per group.`,
      );
    }
  }
  return result;
}

const entryOf = (group: Post[]): ListEntry => ({
  post: group.find((post) => post.data.language === "en") ?? group[0],
  languages: group.map((post) => post.data.language).sort(),
});

const newestFirst = (a: ListEntry, b: ListEntry) => b.post.data.date.getTime() - a.post.data.date.getTime();

// One entry per group, newest first.
export async function listEntries(): Promise<ListEntry[]> {
  return (await groups()).map(entryOf).sort(newestFirst);
}

export interface TagEntry {
  slug: string;
  // The first spelling seen, for display.
  label: string;
  entries: ListEntry[];
}

// Every tag used by a published post, with one list entry per group, newest first.
// Tags that differ only in case or punctuation share a slug, so they share a page.
export async function tagEntries(): Promise<TagEntry[]> {
  const tags = new Map<string, TagEntry>();
  for (const group of await groups()) {
    const entry = entryOf(group);
    for (const tag of group.flatMap((post) => post.data.tags)) {
      const slug = tagSlug(tag);
      const existing = tags.get(slug) ?? { slug, label: tag, entries: [] };
      if (!existing.entries.includes(entry)) existing.entries.push(entry);
      tags.set(slug, existing);
    }
  }
  return [...tags.values()]
    .map((tag) => ({ ...tag, entries: tag.entries.sort(newestFirst) }))
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

export interface Related {
  // The post's own tags that at least one related post shares.
  tags: string[];
  posts: Post[];
}

// Other groups sharing a tag with the post, one post per group: the one in the
// post's language when the group has it, otherwise the group's representative.
// Same-language posts come first, then newest first. The post's own group
// (itself and its translations) is excluded.
export async function relatedTo(post: Post): Promise<Related> {
  const slugs = new Map(post.data.tags.map((tag) => [tagSlug(tag), tag]));
  const shared = new Set<string>();
  const found: Post[] = [];
  for (const group of await groups()) {
    if (group.some((member) => member.id === post.id)) continue;
    const common = group.flatMap((member) => member.data.tags.map(tagSlug)).filter((slug) => slugs.has(slug));
    if (common.length === 0) continue;
    common.forEach((slug) => shared.add(slug));
    found.push(group.find((member) => member.data.language === post.data.language) ?? entryOf(group).post);
  }
  const sameLanguage = (candidate: Post) => Number(candidate.data.language !== post.data.language);
  found.sort((a, b) => sameLanguage(a) - sameLanguage(b) || b.data.date.getTime() - a.data.date.getTime());
  return { tags: [...slugs].filter(([slug]) => shared.has(slug)).map(([, tag]) => tag), posts: found };
}

// The other members of the post's group.
export async function translationsOf(post: Post): Promise<Post[]> {
  const group = (await groups()).find((members) => members.some((member) => member.id === post.id));
  return group?.filter((member) => member.id !== post.id) ?? [];
}
