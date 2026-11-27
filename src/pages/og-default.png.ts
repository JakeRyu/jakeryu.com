import type { APIRoute } from "astro";
import { defaultImage } from "../lib/og-image";

export const GET: APIRoute = async () => new Response(new Uint8Array(await defaultImage()), { headers: { "Content-Type": "image/png" } });
