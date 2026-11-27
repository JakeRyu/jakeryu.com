import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { postImage } from "../../lib/og-image";

export async function getStaticPaths() {
  // Drafts get no image.
  const posts = (await getCollection("blog")).filter((post) => import.meta.env.DEV || !post.data.draft);
  return posts.map((post) => ({ params: { slug: post.id }, props: { title: post.data.title, language: post.data.language } }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(new Uint8Array(await postImage(props.title, props.language)), { headers: { "Content-Type": "image/png" } });
