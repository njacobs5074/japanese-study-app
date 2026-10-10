import { fetchGzippedJson } from '../lib/gzip';
import { katakanaToHiragana } from '../lib/tokenizer';
import type { Dictionary, DictionaryEntry, KanjiInfo } from './types';

/** Shapes written by scripts/build-dict.mjs. */
type JmdictEntry = [readings: string[], gloss: string];
export interface JmdictData {
  entries: Record<string, JmdictEntry[]>;
}
export interface KanjidicData {
  kanji: Record<string, { on: string[]; kun: string[]; meanings: string[] }>;
}

/** Picks the entry whose reading matches (ignoring kana type), else the first (most common). */
export function pickEntry(candidates: JmdictEntry[], reading?: string): JmdictEntry | undefined {
  if (reading) {
    const wanted = katakanaToHiragana(reading);
    const match = candidates.find(([readings]) =>
      readings.some((r) => katakanaToHiragana(r) === wanted),
    );
    if (match) return match;
  }
  return candidates[0];
}

/** First sense only, for tight spaces such as the study list. */
export function shortGloss(gloss: string): string {
  return gloss.split('; ')[0];
}

export function createDictionary(
  loadJmdict: () => Promise<JmdictData>,
  loadKanjidic: () => Promise<KanjidicData>,
): Dictionary {
  return {
    async lookup(word, reading) {
      const entry = pickEntry((await loadJmdict()).entries[word] ?? [], reading);
      if (!entry) return undefined;
      return { word, kana: entry[0][0], gloss: entry[1] } satisfies DictionaryEntry;
    },
    async kanjiInfo(char) {
      const k = (await loadKanjidic()).kanji[char];
      if (!k) return undefined;
      return { onyomi: k.on, kunyomi: k.kun, meaning: k.meanings.slice(0, 3).join(', ') } satisfies KanjiInfo;
    },
  };
}

function lazy<T>(load: () => Promise<T>): () => Promise<T> {
  let p: Promise<T> | undefined;
  return () => {
    p ??= load();
    p.catch(() => (p = undefined)); // allow a retry after a failure
    return p;
  };
}

const base = `${import.meta.env.BASE_URL}dict/`;
const loadJmdict = lazy(() => fetchGzippedJson<JmdictData>(`${base}jmdict.json.gz`));
const loadKanjidic = lazy(() => fetchGzippedJson<KanjidicData>(`${base}kanjidic.json.gz`));

/** The app's dictionary. Data is downloaded on first use (about 7.5 MB for JMdict). */
export const dictionary: Dictionary = createDictionary(loadJmdict, loadKanjidic);

/** Starts downloading the dictionary files in the background; failures surface on lookup. */
export function preloadDictionary(): void {
  loadJmdict().catch(() => undefined);
  loadKanjidic().catch(() => undefined);
}
