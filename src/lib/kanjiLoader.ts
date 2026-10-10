import { cacheKanjiSvg, getCachedKanjiSvg } from './db';
import { kanjiFilename, parseKanjiSvg, type KanjiStrokes } from './kanjivg';

const GITHUB_RAW = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/';
const memory = new Map<string, Promise<KanjiStrokes>>();

async function fetchSvg(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const text = await res.text();
    // A dev/static server may answer unknown paths with index.html and status 200.
    return text.includes('<svg') && text.includes('kvg:') ? text : undefined;
  } catch {
    return undefined;
  }
}

async function load(char: string): Promise<KanjiStrokes> {
  const file = kanjiFilename(char);

  const cached = await getCachedKanjiSvg(char).catch(() => undefined);
  if (cached) return parseKanjiSvg(char, cached);

  // Vendored copies first; otherwise fetch once from KanjiVG and cache locally.
  const vendored = await fetchSvg(`${import.meta.env.BASE_URL}kanjivg/${file}`);
  if (vendored) return parseKanjiSvg(char, vendored);

  const remote = await fetchSvg(GITHUB_RAW + file);
  if (!remote) throw new Error(`Stroke diagram for ${char} is unavailable`);
  const strokes = parseKanjiSvg(char, remote);
  await cacheKanjiSvg(char, remote).catch(() => undefined);
  return strokes;
}

/** Loads stroke data for one kanji. Results are memoized for the page's lifetime. */
export function loadKanji(char: string): Promise<KanjiStrokes> {
  let p = memory.get(char);
  if (!p) {
    p = load(char);
    memory.set(char, p);
    p.catch(() => memory.delete(char));
  }
  return p;
}
