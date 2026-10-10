# 日本語を勉強しましょう！ — implementation brief (v1)

A brief for Claude Code. Read it fully before writing code. Build milestone by
milestone and stop after each one for review.

## What this is

A single-user web app for studying Japanese vocabulary taken from a text the
user is reading (currently the book トヨタの会議は30分). The user pastes a
passage, taps the words they don't know, studies those words as flashcards
with stroke-order diagrams, then drills each word in example sentences.

No accounts, no server-side user data. Everything the user creates lives in
the browser.

## Stack (default; change only with the user's agreement)

- Vite + TypeScript + React, static site, no backend.
- Persistence: IndexedDB (via a small wrapper such as `idb`).
- Tests: Vitest for the pure logic (scheduling, lookups, API mapping).

## Screens

Four routes, a shared header (app name, nav: Text / Cards / Sentences, and
"Studying: <text title>") and a footer link to About.

### 1. Text (`/text`)
- Text area to paste a passage, and a "Split into words" button.
- The passage renders as tappable word buttons. Tapping toggles the word in
  the study list (use `aria-pressed`). Particles and punctuation are shown
  but can be de-emphasised.
- Side panel: the study list (word, kana, short gloss) with a count, and
  buttons to "Study these as cards" and "Drill them in sentences".

### 2. Cards (`/cards`)
- Front: the word in large kanji, a JLPT badge per kanji, and a
  "Show reading and meaning" button.
- Back: kana reading, English meaning, and one stroke-order diagram per kanji
  (numbered strokes) with a caption: JLPT badge, readings, meaning, stroke
  count. Then four grade buttons: Again / Hard / Good / Easy.
- Side panel: the queue of words (now / next / queued) and a link to drill
  the current word in sentences.

### 3. Sentences (`/sentences/:word`)
- One sentence at a time with the target word highlighted.
- "Show reading and translation" reveals the English translation (and kana
  reading if available).
- Attribution line under every sentence: contributor name, licence, link to
  the sentence on tatoeba.org. "Next sentence" button.

### 4. About (`/about`)
Sections: KanjiVG credit; Tatoeba licences and how searches are made;
Readings and definitions (source + licence); JLPT levels (source + licence,
with a note that levels are unofficial); Your own text (where it is stored).

## Visual design

- Ground `#EEF1EE`, surface `#FFFFFF`, ink `#1B2438`, muted text `#55607A`,
  hairline `#D5DAD6`, accent (primary buttons, highlighted word) `#B8301C`.
- Fonts (Google Fonts): `Shippori Mincho` 500/700 for Japanese display text
  and the app name; `Zen Kaku Gothic New` 400/500/700 for everything else.
- Cards: 16px radius, 1px hairline border. Buttons: 10px radius, min height
  48px. Layout is main column + side panel that stacks under ~800px.
- Accessibility: real `<button>`/`<a>`/`<label>` elements, `lang="ja"` on
  Japanese text, text contrast at least 4.5:1.

## Data sources

### KanjiVG — stroke diagrams (CC BY-SA 3.0, © Ulrich Apel)
- One SVG per character in the GitHub repo `KanjiVG/kanjivg`, folder
  `kanji/`, named by the 5-digit lowercase hex code point: 会 is
  `04f1a.svg`, 議 is `08b70.svg`.
- Each file has a stroke-path group and a stroke-number group. Render the
  paths with the app's ink colour and the numbers in the accent colour.
- Do not hot-link GitHub at runtime. Vendor the SVGs (or fetch on first use
  and cache in IndexedDB).
- Attribution must appear on the About page.

### Tatoeba — example sentences
- Spec: `https://api.tatoeba.org/openapi.json`. READ IT FIRST and generate
  types from it; do not guess response shapes.
- Endpoint: `GET https://api.tatoeba.org/v1/sentences` (stable, no auth).
  `lang` and `sort` are required.
- Query for a word:
  `lang=jpn&q=<word>&trans:lang=eng&showtrans:lang=eng&sort=random&limit=10`
- Do NOT send the `license` parameter. Without it the API already excludes
  sentences flagged with a licensing problem.
- Each sentence has `license` (`CC BY 2.0 FR` or `CC0 1.0`) and `owner`.
  Store both and show them. Treat each translation as needing the same
  attribution if the response carries its own owner/licence.
- Cache results per word in IndexedDB and never refetch a cached word
  automatically. The terms of use forbid automated use that overloads the
  service; no rate limits are documented.
- `q` uses ManticoreSearch syntax: quote/escape the word as needed.

## Open decisions (TODO — ask the user, do not pick silently)

1. **Dictionary source** for word readings and definitions. Candidate:
   JMdict (EDRDG licence; attribution required). Verify the licence and pick
   a distribution that is practical to ship to a browser.
2. **JLPT level source.** There are no official kanji lists for the current
   test. kanjitest.online's data was rejected (it lists 会 as N2). Candidate:
   Jonathan Waller's lists at tanos.co.uk — licence unverified.
3. **Tokenizer** for splitting Japanese text into words. Candidate:
   kuromoji.js in the browser; check its dictionary download size.
4. **Where pasted text is stored.** Default assumption: IndexedDB only,
   never sent anywhere.

Until 1 and 2 are decided, hide the data behind interfaces
(`Dictionary.lookup(word)`, `JlptLevels.forKanji(char)`) with a small
hand-written fixture covering 会議, 分, トヨタ, so the UI can be built.

## Risks to check before building on them

- **CORS on the Tatoeba API.** Confirm a browser can call it directly. If
  not, stop and tell the user: the options are a tiny proxy or a build-time
  fetch, and that changes the "no backend" decision.
- **Tokenizer/dictionary bundle size.** Load lazily; do not block first paint.

## Review scheduling

Simple spaced repetition per word, stored in IndexedDB:
`{ word, intervalDays, ease, dueAt, lastGrade }`.
Again → due again this session; Hard/Good/Easy → interval multiplied by
1.2 / ease / ease × 1.3, with ease nudged down/unchanged/up. Keep it in one
pure, unit-tested function so it can be replaced later.

## Milestones

1. **Skeleton.** Vite project, routes, header/footer, design tokens, About
   page with the known credits and TODO placeholders. Fixture data only.
2. **Cards.** Flip card, KanjiVG rendering for any kanji in a word, grading
   and scheduling with persistence.
3. **Sentences.** Tatoeba client (after the CORS check), caching,
   highlighting, attribution line.
4. **Text.** Paste, tokenise, tap to add words; study list persistence.
5. **Real dictionary and JLPT data**, once the user has decided the sources;
   fill in the About page.

## Out of scope for v1

Audio, accounts or sync, multiple texts, handwriting practice, mobile app.
