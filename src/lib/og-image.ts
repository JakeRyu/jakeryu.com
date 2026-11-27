import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";
import { site } from "../site";

const require = createRequire(import.meta.url);

// The light-theme tokens from src/styles/global.css.
const ground = "#f3f5f7";
const ink = "#14202b";
const muted = "#566573";
const accent = "#e0561b";

const width = 1200;
const height = 630;

const geist = ([400, 700] as const).map((weight) => ({
  name: "Geist",
  data: readFileSync(require.resolve(`@fontsource/geist-sans/files/geist-sans-latin-${weight}-normal.woff`)),
  weight,
  style: "normal" as const,
}));

// Noto Sans KR ships as numbered subsets, each with a unicode-range, so
// Korean text needs the subsets that cover its characters. satori reads
// woff but not woff2.
const notoDir = require.resolve("@fontsource/noto-sans-kr/700.css").replace(/700\.css$/, "");
const notoSubsets = [...readFileSync(`${notoDir}700.css`, "utf8").matchAll(/noto-sans-kr-(\d+)-700-normal\.woff\).*?\n\s*unicode-range: ([^;]+);/g)].map(
  ([, index, ranges]) => ({
    file: `${notoDir}files/noto-sans-kr-${index}-700-normal.woff`,
    ranges: ranges.split(",").map((range) => {
      const [from, to = from] = range.trim().slice(2).split("-");
      return [parseInt(from, 16), parseInt(to, 16)] as const;
    }),
  }),
);

// satori only falls back between differently named fonts, so each subset gets
// its own name and the title lists them all as its font-family.
function notoFor(text: string) {
  const files = new Set<string>();
  for (const char of new Set(text)) {
    const code = char.codePointAt(0)!;
    const subset = notoSubsets.find(({ ranges }) => ranges.some(([from, to]) => code >= from && code <= to));
    if (subset) files.add(subset.file);
  }
  return [...files].map((file) => ({ name: `Noto Sans KR ${file}`, data: readFileSync(file), weight: 700 as const, style: "normal" as const }));
}

type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, style: Record<string, unknown>, children?: unknown): Node => ({ type, props: { style, children } });

async function render(tree: Node, fonts: Parameters<typeof satori>[1]["fonts"]): Promise<Buffer> {
  const svg = await satori(tree as Parameters<typeof satori>[0], { width, height, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng();
}

const frame = (...children: Node[]) =>
  el("div", { display: "flex", flexDirection: "column", justifyContent: "space-between", width, height, boxSizing: "border-box", padding: "72px 80px", background: ground, borderLeft: `16px solid ${accent}`, fontFamily: "Geist" }, children);

// A post's image: its title in the light-theme palette, with the site name.
// Korean posts set the title in Noto Sans KR.
export function postImage(title: string, language: "en" | "ko"): Promise<Buffer> {
  const noto = language === "ko" ? notoFor(title) : [];
  const titleFamily = noto.length > 0 ? noto.map((font) => `"${font.name}"`).join(", ") : "Geist";
  // Long titles step down in size so they stay inside the frame.
  const fontSize = title.length > 90 ? 40 : title.length > 50 ? 52 : 72;
  const tree = frame(
    el("div", { display: "flex", fontFamily: titleFamily, fontSize, fontWeight: 700, lineHeight: 1.25, letterSpacing: -1.5, color: ink, overflow: "hidden" }, title),
    el("div", { display: "flex", fontSize: 36, fontWeight: 700, color: accent }, site.name),
  );
  return render(tree, [...noto, ...geist]);
}

// The one image shared by every page that is not a post.
export function defaultImage(): Promise<Buffer> {
  const tree = frame(
    el("div", { display: "flex", fontSize: 36, fontWeight: 700, color: accent }, "jakeryu.com"),
    el("div", { display: "flex", flexDirection: "column" }, [
      el("div", { display: "flex", fontSize: 128, fontWeight: 700, letterSpacing: -3, color: ink }, site.name),
      el("div", { display: "flex", fontSize: 44, fontWeight: 400, color: muted, marginTop: 16 }, site.slogan),
    ]),
  );
  return render(tree, geist);
}
