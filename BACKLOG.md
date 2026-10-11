# 日本語を勉強しましょう – Ideas & Backlog

- [ ] Import/export data to move study information to another browser
- [ ] Study cards sharing
    - [ ] Share them as images
    - [ ] Share them as data so that they can be imported into another user’s app

## Data safety
- [ ] Ask the browser for persistent storage so saved data is not evicted (Safari can clear a site's storage after a week of non-use); export (above) is the safety net, so consider doing it first
- [ ] "Delete all my data" button
- [ ] Accounts or sync across devices (out of scope for v1; would need a backend)

## Deployment and maintenance
- [ ] Deploy to GitHub Pages at njacobs5074.github.io/japanese-study-app/ and link to it from www.highlandcows.com (deployed; the link is still to do)
    - [x] Set the Vite `base` path and add a matching `basename` to the router
    - [x] Publish a `404.html` copy of `index.html` so deep links and refreshes work
    - [x] Add a deploy workflow (build with the dictionary download, actions pinned to commit SHAs) and switch the repo's Pages source to GitHub Actions
- [ ] When a host is chosen, send `Content-Security-Policy: frame-ancestors 'none'` as a response header (a `<meta>` policy cannot set it; GitHub Pages cannot send custom headers)
- [x] CI on every push: type check, tests, `npm audit` and build
- [ ] Automate updates to pinned data: the KanjiVG commit, the jmdict-simplified release and its SHA-256 hashes (Dependabot or Renovate for npm packages)
- [ ] Create the `v0.1.0` git tag and GitHub release (the changelog links assume it)

## Fixes for known limitations
- [ ] Highlight inflected forms of the target word in example sentences (only exact matches are marked today)
- [ ] Conjugated words are split into pieces (食べた becomes 食べ + た) and only the stem is tappable: allow selecting a multi-token span, or merge common endings
- [ ] Tokenize in a Web Worker so a very large passage does not freeze the page
- [ ] Skip unapproved Tatoeba sentences, which the API flags
- [ ] Fetch fresh example sentences for a word (results are cached for good and capped at 10)
- [ ] Let the user correct a wrong reading or definition, or choose among several dictionary senses
- [ ] Revisit JLPT levels if wanted (dropped for now: needs a source with a verified licence)

## Study experience
- [ ] Keyboard shortcuts: space to flip, 1 to 4 to grade
- [ ] Show the next review interval on each grade button
- [ ] Progress and stats view
- [ ] Cycle through the whole study list in the Sentences screen instead of one word at a time
- [ ] Furigana on example sentences (Tatoeba already returns the markup; today it is reduced to plain kana)
- [ ] Audio: Tatoeba recordings or the browser's built-in speech (out of scope for v1)
- [ ] Multiple texts, each with its own study list (out of scope for v1)
- [ ] Handwriting practice (out of scope for v1)
- [ ] Try a different spaced-repetition scheduler such as FSRS (the scheduler is one pure function so it can be swapped)

## Platform and polish
- [ ] Make it a PWA: installable and usable offline (the tokenizer and dictionary are about 25 MB to cache)
- [ ] Download progress bar for the first split
- [ ] "Follow system theme" option to undo a saved light/dark choice
- [ ] Accessibility pass: measure dark-theme contrast, test with a screen reader
- [ ] Mobile app (out of scope for v1)

## Quality
- [ ] Tests for the screens and IndexedDB (for example fake-indexeddb)
- [ ] End-to-end test of the main flow (paste, split, add words, study, drill)
