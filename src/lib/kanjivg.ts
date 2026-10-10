export interface KanjiStrokes {
  char: string;
  paths: string[];
  numbers: { n: number; x: number; y: number }[];
}

const KANJI_RE = /[㐀-䶿一-鿿豈-﫿]/;

export function isKanji(char: string): boolean {
  return KANJI_RE.test(char);
}

export function kanjiChars(word: string): string[] {
  return [...word].filter(isKanji);
}

/** KanjiVG file name: 5-digit lowercase hex code point, e.g. 会 -> 04f1a.svg. */
export function kanjiFilename(char: string): string {
  const cp = char.codePointAt(0)!;
  return `${cp.toString(16).padStart(5, '0')}.svg`;
}

/** Extracts stroke paths and stroke-number positions from a KanjiVG SVG document. */
export function parseKanjiSvg(char: string, svg: string): KanjiStrokes {
  const paths = [...svg.matchAll(/<path\b[^>]*?\sd="([^"]+)"/g)].map((m) => m[1]);
  const numbers = [
    ...svg.matchAll(/<text\s+transform="matrix\(1 0 0 1 ([\d.]+) ([\d.]+)\)"\s*>(\d+)<\/text>/g),
  ].map((m) => ({ x: Number(m[1]), y: Number(m[2]), n: Number(m[3]) }));
  if (paths.length === 0) throw new Error(`No strokes found for ${char}`);
  return { char, paths, numbers };
}
