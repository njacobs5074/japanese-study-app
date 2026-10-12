# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- MIT `LICENSE`, `CHANGELOG.md`, `CONTRIBUTORS.md`, `CLAUDE.md` and `BACKLOG.md`.
- GitHub Actions: a CI workflow (type check, tests, build, `npm audit`) and a workflow that
  deploys the site to GitHub Pages on every push to `main`, with status badges in the README.
- Production builds are served from the `/japanese-study-app/` subpath and include a `404.html`
  fallback so deep links and refreshes work on GitHub Pages.
- **Text page:** a Clear button next to "Split into words" empties the text box and the split
  words but leaves the study list alone.
- **About page:** a "Source code" section linking to the GitHub repository.
- **Cards page:** click a word in the Queue to study it next. The chosen card replaces the
  current one (its answer hidden again); grading it returns the queue to its normal order. Works
  for words that are not due yet and when everything is caught up. On narrow screens the page
  scrolls back up to the card.

### Changed

- **Text page:** the prompt is now a hint inside the text box ("Type or paste Japanese
  here...") instead of a label above it. A hidden label keeps the field accessible to screen
  readers.

---

## [0.1.0] - 2026-10-10

First working version.

### Added

- **Text page:** paste a Japanese passage and split it into words in the browser with kuromoji
  (loaded on first use). Tap words to add them to the study list; particles, punctuation and
  numbers are shown dimmed. The passage, its split result and the study list are saved in
  IndexedDB. The header shows the start of the passage you are studying.
- **Study list:** kanji, kana reading and a short English gloss for each word, with remove and
  "Clear all" buttons.
- **Cards page:** flip cards showing the word, reading, meaning and a numbered stroke-order
  diagram per kanji (from KanjiVG) with its readings and meaning (from KANJIDIC2). Grade with
  Again / Hard / Good / Easy; a simple spaced-repetition scheduler persists progress. A Reset
  button on the "All caught up" panel makes every card due again.
- **Sentences page:** example sentences from the Tatoeba API with the target word highlighted,
  an optional kana reading and English translation, and attribution (contributor, licence, link)
  for every sentence and translation. Results are cached per word.
- **Definitions:** word readings and definitions from JMdict, built at install time into compact
  gzipped files and loaded lazily.
- **About page:** credits and licences for KanjiVG, Tatoeba, JMdict/KANJIDIC2, kuromoji and the
  IPADIC dictionary, plus a privacy section listing the requests the app makes.
- Light and dark themes (dark follows the macOS palette). The system setting is used until you
  choose, and your choice is remembered.
- Responsive layout that stacks the side panel on narrow screens.
- Content-Security-Policy added to production builds.
- Tatoeba API types generated from its OpenAPI spec (`npm run gen-tatoeba-types`).
- Unit tests for scheduling, queueing, tokenizing, Tatoeba mapping, dictionary lookup and
  KanjiVG parsing.

### Security

- Stroke diagrams are fetched from a pinned KanjiVG commit.
- Dictionary downloads are verified against pinned SHA-256 checksums before use.

[Unreleased]: https://github.com/njacobs5074/japanese-study-app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/njacobs5074/japanese-study-app/releases/tag/v0.1.0
