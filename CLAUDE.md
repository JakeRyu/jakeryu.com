# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Jake Ryu's personal site, jakeryu.com. It is a static Astro site that replaces two older sites: a portfolio and a bilingual English/Korean blog.

## Sources of truth

- **Spec:** GitHub issue #1 (`gh issue view 1`). It holds every product and technical decision: stack, content model, translation module, routes, design tokens, testing seam and cutover. Read it before planning or building. When a decision changes, update the issue, not this file.
- **Design:** direction F, "System Map", on the design canvas https://claude.ai/artifact/BNTfkudqMLQdCnR38mgpzN. It has light, dark and mobile artboards. Directions A–E there are rejected alternatives. Open the canvas with the Artifact tool.
- **Content to migrate:** two read-only sources. Copy from them and never edit them.
  - `~/Projects/velite-blog` (`JakeRyu/velite-blog`): the six published posts in `content/blog/` (skip `archive/`), their image in `public/postImages/`, and the About text in `app/about/page.tsx`.
  - `~/Projects/portfolio` (`JakeRyu/portfolio`): portfolio data in `lib/data.ts`, plus project images in `public/`. The CV (`public/CV.pdf` there) is deliberately not migrated: the CV is only published with Jake's explicit consent.

## Development

- **Package manager:** pnpm (`packageManager` in `package.json`). If `pnpm` is not on PATH, use `npx -y pnpm@12.23.0 <command>`. Run `pnpm check`, `pnpm test` and `pnpm build` before opening a PR; CI runs the same three.
- **Content:** one folder per collection under `CONTENT_DIR` (default `src/content`): `blog/<slug>/index.mdx` for posts, `<collection>/*.yaml` for portfolio data. A new collection is one more entry in `src/content.config.ts`, reading `${contentDir}/<name>`. Real content is in place (six posts, portfolio data, About); tests use fixtures, not the real folders, except the `real-*-content` tests.
- **Tests:** one seam, the built site. `tests/support/build-fixture-site.ts` builds once against `tests/fixtures/content` and tests assert on the built HTML, CSS and files (`page()`, `fileExists()`, `filesWithExtension()` in `tests/support/built-site.ts`). Failing-build cases use `buildSite()` with a fixture under `tests/fixtures/invalid/<case>/`. Other agents add fixtures in parallel, so assert on specific slugs, never on total counts. Test files run one at a time (`fileParallelism: false`) because concurrent Astro builds share `.astro/`.
- **Test builds are production builds:** `buildSite()` sets `NODE_ENV=production`, because Vitest sets `NODE_ENV=test`, which Astro would treat as a non-production build (drafts included).
- **Translations:** all translation-group logic lives in `src/lib/translations.ts`. Pages never group posts themselves.
- **Dev server:** `CONTENT_DIR=$PWD/tests/fixtures/content pnpm dev` shows the fixture posts and portfolio data. When several agents run at once, give each its own port.
- **Deployment:** Cloudflare Workers Static Assets (`wrangler.jsonc`), built from Git: `main` is production, other branches get preview URLs.
- **Done means checked by eye:** visual fidelity (light, dark, mobile) is not automated; say in the PR what was and was not checked in a browser.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (JakeRyu/jakeryu.com) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
