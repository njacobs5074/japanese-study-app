# 日本語を勉強しましょう！

A single-user web app for studying Japanese vocabulary from a text you are reading.
Everything you create is stored in your browser (IndexedDB); there is no backend.

## Commands

```bash
npm install
npm run dev      # dev server
npm run build    # type-check and production build
npm test         # unit tests
```

`npm run dev` and `npm run build` first run two prebuild steps (also available on their own):

- `npm run copy-dict` copies the kuromoji tokenizer dictionary from `node_modules` into
  `public/kuromoji-dict/`.
- `npm run build-dict` downloads JMdict and KANJIDIC2 (via jmdict-simplified, pinned release in
  `scripts/build-dict.mjs`), shrinks them, and writes gzipped files to `public/dict/`.
  Downloads are cached in `.cache/dict/`; pass `-- --force` to rebuild. This needs network
  access and the `tar` command the first time.

Both outputs are git-ignored. Data credits and licences are on the app's About page.
