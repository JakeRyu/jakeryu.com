# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Jake Ryu's personal site, jakeryu.com. It is a static Astro site that replaces two older sites: a portfolio and a bilingual English/Korean blog.

## Sources of truth

- **Spec:** GitHub issue #1 (`gh issue view 1`). It holds every product and technical decision: stack, content model, translation module, routes, design tokens, testing seam and cutover. Read it before planning or building. When a decision changes, update the issue, not this file.
- **Design:** direction F, "System Map", on the design canvas https://claude.ai/artifact/BNTfkudqMLQdCnR38mgpzN. It has light, dark and mobile artboards. Directions A–E there are rejected alternatives. Open the canvas with the Artifact tool.
- **Content to migrate:** two read-only sources. Copy from them and never edit them.
  - `~/Projects/velite-blog` (`JakeRyu/velite-blog`): the six published posts in `content/blog/` (skip `archive/`), their image in `public/postImages/`, and the About text in `app/about/page.tsx`.
  - `~/Projects/portfolio` (`JakeRyu/portfolio`): portfolio data in `lib/data.ts`, plus project images and `CV.pdf` in `public/`.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (JakeRyu/jakeryu.com) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
