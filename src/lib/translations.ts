import { getCollection, type CollectionEntry } from "astro:content";

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

// One entry per group, newest first.
export async function listEntries(): Promise<ListEntry[]> {
  return (await groups())
    .map((group) => ({
      post: group.find((post) => post.data.language === "en") ?? group[0],
      languages: group.map((post) => post.data.language).sort(),
    }))
    .sort((a, b) => b.post.data.date.getTime() - a.post.data.date.getTime());
}

// The other members of the post's group.
export async function translationsOf(post: Post): Promise<Post[]> {
  const group = (await groups()).find((members) => members.some((member) => member.id === post.id));
  return group?.filter((member) => member.id !== post.id) ?? [];
}
