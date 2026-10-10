// Builds compact, browser-friendly dictionary files from the jmdict-simplified releases
// (JMdict + KANJIDIC2, © EDRDG, CC BY-SA 4.0). Downloads are cached in .cache/dict/.
// Output (gzipped; the browser decompresses them): public/dict/jmdict.json.gz and kanjidic.json.gz.
// Skipped when public/dict/VERSION already matches; pass --force to rebuild.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const VERSION = '3.6.2+20261005200550';
const RELEASE = `https://github.com/scriptin/jmdict-simplified/releases/download/${encodeURIComponent(VERSION)}`;
const CACHE = '.cache/dict';
const OUT = 'public/dict';

const SOURCES = [
  { name: 'jmdict-eng', file: `jmdict-eng-${VERSION.split('+')[0]}.json` },
  { name: 'kanjidic2-en', file: `kanjidic2-en-${VERSION.split('+')[0]}.json` },
];

async function fetchSource({ name, file }) {
  const json = `${CACHE}/${name}/${file}`;
  if (existsSync(json)) return JSON.parse(readFileSync(json, 'utf8'));
  mkdirSync(`${CACHE}/${name}`, { recursive: true });
  const archive = `${CACHE}/${name}.tgz`;
  const url = `${RELEASE}/${name}-${VERSION}.json.tgz`;
  console.log(`Downloading ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}): ${url}`);
  writeFileSync(archive, Buffer.from(await res.arrayBuffer()));
  execFileSync('tar', ['-xzf', archive, '-C', `${CACHE}/${name}`]);
  return JSON.parse(readFileSync(json, 'utf8'));
}

const MAX_SENSES = 3;
const MAX_GLOSSES = 4;

function glossFor(word, kanjiText, kanaText) {
  const senses = word.sense.filter(
    (s) =>
      (!kanjiText || s.appliesToKanji.includes('*') || s.appliesToKanji.includes(kanjiText)) &&
      (!kanaText || s.appliesToKana.includes('*') || s.appliesToKana.includes(kanaText)),
  );
  return senses
    .slice(0, MAX_SENSES)
    .map((s) => s.gloss.slice(0, MAX_GLOSSES).map((g) => g.text).join(', '))
    .filter(Boolean)
    .join('; ');
}

function buildJmdict(data) {
  const index = new Map(); // written form -> [{common, readings, gloss}]
  const add = (key, item) => {
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(item);
  };

  for (const word of data.words) {
    const kana = word.kana.filter((k) => !k.tags.includes('sk'));
    for (const kanji of word.kanji.filter((k) => !k.tags.includes('sK'))) {
      const readings = kana
        .filter((k) => k.appliesToKanji.includes('*') || k.appliesToKanji.includes(kanji.text))
        .map((k) => k.text);
      const gloss = glossFor(word, kanji.text, null);
      if (gloss && readings.length) add(kanji.text, { common: kanji.common, readings, gloss });
    }
    // Words without kanji, or usually written in kana, are found by their kana form.
    const usuallyKana = word.kanji.length === 0 || word.sense[0]?.misc.includes('uk');
    if (usuallyKana) {
      for (const k of kana) {
        const gloss = glossFor(word, null, k.text);
        if (gloss) add(k.text, { common: k.common, readings: [k.text], gloss });
      }
    }
  }

  const entries = {};
  for (const [key, items] of index) {
    items.sort((a, b) => Number(b.common) - Number(a.common)); // stable: keeps JMdict order
    entries[key] = items.map((i) => [i.readings, i.gloss]);
  }
  return { version: VERSION, entries };
}

function buildKanjidic(data) {
  const kanji = {};
  for (const c of data.characters) {
    const groups = c.readingMeaning?.groups ?? [];
    const on = groups.flatMap((g) => g.readings.filter((r) => r.type === 'ja_on').map((r) => r.value));
    const kun = groups.flatMap((g) => g.readings.filter((r) => r.type === 'ja_kun').map((r) => r.value));
    const meanings = groups.flatMap((g) => g.meanings.filter((m) => m.lang === 'en').map((m) => m.value));
    if (on.length || kun.length || meanings.length) {
      kanji[c.literal] = { on, kun, meanings: meanings.slice(0, 5) };
    }
  }
  return { version: VERSION, kanji };
}

mkdirSync(OUT, { recursive: true });
const marker = `${OUT}/VERSION`;
if (!process.argv.includes('--force') && existsSync(marker) && readFileSync(marker, 'utf8') === VERSION) {
  console.log(`Dictionary files are up to date (${VERSION})`);
  process.exit(0);
}

const [jmdict, kanjidic] = await Promise.all(SOURCES.map(fetchSource));
const write = (name, value) => {
  const bytes = gzipSync(JSON.stringify(value), { level: 9 });
  writeFileSync(`${OUT}/${name}.json.gz`, bytes);
  console.log(`Wrote ${OUT}/${name}.json.gz (${(bytes.length / 1e6).toFixed(1)} MB)`);
};
write('jmdict', buildJmdict(jmdict));
write('kanjidic', buildKanjidic(kanjidic));
writeFileSync(marker, VERSION);
