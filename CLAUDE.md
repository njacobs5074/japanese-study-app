# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A single-user, client-side web app for studying Japanese vocabulary from a text you are reading:
paste a passage, tap unknown words, review them as flashcards with stroke-order diagrams, and
drill them in Tatoeba example sentences. Vite + React + TypeScript, static site, **no backend**.
Everything the user creates lives in the browser (IndexedDB, plus `localStorage` for the theme).
`japanese-study-app-spec.md` is the original brief (all five milestones are done; some choices
there were superseded, e.g. JLPT levels were dropped and the text title field was removed).

## Workflow

- `main` is protected by a ruleset ("Protect main"): no direct pushes, force pushes or deletion.
  **Every change, including typo fixes, goes through a branch and a pull request**, and the
  `check` job from `ci.yml` must pass before merging. No approving review is required (solo
  repo). Merging to `main` deploys the site, so do not merge without the user's go-ahead.
- Name branches in conventional-commit style: `feat/…`, `fix/…`, `refactor/…`, `docs/…`,
  `chore/…`.
- Commit messages follow conventional commits (`feat:`, `fix:`, `style:`, `docs:`, `chore:`,
  `security:`).
- Update `CHANGELOG.md` (under `[Unreleased]`) for user-visible changes.

## Commands

```bash
npm install
npm run dev                  # dev server (runs copy-dict and build-dict first)
npm run build                # type-check + production build
npm test                     # Vitest (pure logic only)
npx tsc -b                   # type-check only
npm run build-dict -- --force   # rebuild public/dict/ from JMdict + KANJIDIC2
npm run gen-tatoeba-types    # regenerate src/lib/tatoeba-api.d.ts from Tatoeba's OpenAPI spec
```

Generated and downloaded files are git-ignored: `public/dict/`, `public/kuromoji-dict/`,
`.cache/`, `dist/`, `*.tsbuildinfo`. The first `npm run dev`/`build` on a fresh clone downloads
about 12 MB from GitHub (needs network and `tar`).

## Architecture

| Path | Purpose |
|------|---------|
| `src/pages/` | The four routes: `TextPage`, `CardsPage`, `SentencesPage` (`/sentences/:word?`), `AboutPage`; `StudyListPanel` is the shared side panel |
| `src/components/` | `Layout` (header, theme toggle, footer), `Card`, `TwoColumn`, `KanjiDiagram`, `Attribution` |
| `src/state/StudyContext.tsx` | App-wide state: saved text, study list, background definition lookup, `toggleWord`/`removeWord`/`clearAll` |
| `src/lib/db.ts` | The only IndexedDB code (via `idb`). Stores: `reviews`, `kanjivg`, `sentences`, `text`, `studyList`. Bump the DB version and add an `upgrade` branch when changing stores |
| `src/lib/scheduling.ts` | Pure spaced-repetition function `schedule()`; `queue.ts` orders cards. Keep both pure and unit-tested |
| `src/lib/tokenizer.ts` | kuromoji (dynamic import, ~17 MB dictionary) → `Segment[][]` with kind (`word`/`particle`/`punct`/`number`/`other`), dictionary form and kana |
| `src/lib/tatoeba.ts`, `sentenceService.ts` | Tatoeba client and per-word cache. Types come from `tatoeba-api.d.ts` (generated, do not edit) |
| `src/lib/kanjivg.ts`, `kanjiLoader.ts` | Parse KanjiVG SVGs; fetch once from a pinned commit and cache in IndexedDB |
| `src/lib/gzip.ts` | Fetch and gunzip files (static hosts do not decompress `.gz` for us) |
| `src/data/jmdict.ts` | `Dictionary` implementation over the built JMdict/KANJIDIC2 files, loaded lazily |
| `scripts/` | `build-dict.mjs` (verifies SHA-256, writes `public/dict/*.json.gz`), `copy-dict.mjs`, `gen-tatoeba-types.mjs` |
| `public/theme-init.js` | Applies the saved/system theme before first paint (external file so the CSP needs no script hash) |

## Conventions and decisions to keep

- **Theme:** colors are CSS variables in `src/styles/tokens.css`; dark mode is
  `:root[data-theme='dark']` (macOS-like palette). Keep text contrast at least 4.5:1. Use real
  `<button>`/`<a>`/`<label>` elements and `lang="ja"` on Japanese text.
- **Fonts:** Shippori Mincho for Japanese display text, Zen Kaku Gothic New for everything else.
- **Study items** store a `word` (dictionary form), `kana`, optional `gloss` and `lookedUp`.
  Definitions are resolved in the background by `StudyContext`, never at tap time.
- **Tatoeba:** never send the `license` parameter; show contributor, licence and a link for every
  sentence and translation; cache per word and never refetch automatically.
- **Privacy:** the pasted passage must never leave the browser. Outbound requests are Tatoeba
  (study words), GitHub raw (KanjiVG files) and Google Fonts. If you add or change one, update the
  "Your own text and privacy" section of `AboutPage.tsx`.
- **Content-Security-Policy:** defined in `vite.config.ts` and injected into production builds
  only. A new external origin needs to be added there. Avoid inline scripts and inline `style`
  attributes in markup (they would be blocked).
- **Attribution:** credits and licences live on the About page (KanjiVG, Tatoeba, JMdict and
  KANJIDIC2, kuromoji/IPADIC). Keep it in sync when data sources change. The IPADIC notice text is
  in `src/data/ipadicNotice.ts` (copied verbatim; do not edit).
- **Pinned data:** KanjiVG commit in `kanjiLoader.ts`; dictionary release and SHA-256 hashes in
  `scripts/build-dict.mjs`. Update the hashes together with the version.
- Paths for fetched files must use `import.meta.env.BASE_URL`, and the router's `basename` comes
  from it too: production is served from `/japanese-study-app/` on GitHub Pages (`base` in
  `vite.config.ts`, override with `BASE_PATH`), the dev server from `/`. The build also writes
  `dist/404.html` (a copy of `index.html`) so deep links and refreshes work on Pages.

## CI/CD

`.github/workflows/ci.yml` (type check, tests, build, `npm audit --audit-level=high`) runs on pull
requests and pushes to `main`. `deploy.yml` re-runs the checks and publishes `dist/` to GitHub
Pages on every push to `main`; the repo's Pages source must be "GitHub Actions". The README
badges show both. Pin every action to a commit SHA with a `# vX` comment (resolve SHAs with
`gh api repos/<owner>/<action>/git/ref/tags/<tag>`, dereferencing annotated tags). CI uses Node 24
because Vitest requires Node 22.12+/24+. Before pushing, run `npx tsc -b && npm test && npm run build`.

## Testing

Vitest covers pure logic only (scheduling, queue, tokenizer against the real dictionary in
`node_modules`, Tatoeba mapping, dictionary lookup, KanjiVG parsing). There are no UI or
IndexedDB tests; verify UI changes in a browser (check dark mode and a ~375px-wide viewport).

## Gotchas

- Vite's dev server can report "Outdated Optimize Dep" and fail to load the lazily imported
  tokenizer after a restart; restarting the dev server clears it.
- `useStudy()` only works inside `StudyProvider` (set up in `src/main.tsx`).
- IndexedDB data is per origin, so each dev port has its own study list.
- `DecompressionStream` is used directly to gunzip data files (modern browsers only).

## Known limitations

- Conjugated words are split by kuromoji (食べた → 食べ + た); only the stem is tappable.
- `mergeTekiSuffix()` in `tokenizer.ts` joins noun + suffix 的 (個人 + 的 → 個人的) using the
  dictionary's own tag for the suffix. Other noun suffixes (性, 化, 者, …) are still split.
- A sentence only highlights the target word on an exact match, so inflected forms are missed.
- Very large pasted passages are tokenized on the main thread and can briefly freeze the page.
