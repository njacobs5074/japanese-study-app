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

`npm run gen-tatoeba-types` regenerates `src/lib/tatoeba-api.d.ts` (the Tatoeba API types) from
the live OpenAPI spec; that file is committed.

The dictionary outputs are git-ignored. Data credits and licences are on the app's About page.

## Content-Security-Policy

Production builds include a Content-Security-Policy `<meta>` tag (defined in `vite.config.ts`;
the dev server has none because hot reload needs inline scripts). It allows only this app's own
files, Tatoeba (`api.tatoeba.org`) and KanjiVG (`raw.githubusercontent.com`) for data, and Google
Fonts for styles and fonts. If you add another external service, add its origin to `csp` there.

A `<meta>` policy cannot set `frame-ancestors` (clickjacking protection). When you pick a host,
also send `Content-Security-Policy: frame-ancestors 'none'` as a response header.

## Licence

The source code is released under the [MIT licence](LICENSE). The app uses third-party code and
data under their own licences, which are not changed by this one:

- npm dependencies are MIT, Apache-2.0, ISC, BSD-3-Clause or MPL-2.0 (development tools only).
- JMdict and KANJIDIC2 (EDRDG, CC BY-SA 4.0), KanjiVG (CC BY-SA 3.0), Tatoeba sentences
  (CC BY 2.0 FR / CC0 1.0) and the IPADIC dictionary used by kuromoji are fetched or built at
  install or run time and are not part of this repository. Their credits and licences are on the
  app's About page.
