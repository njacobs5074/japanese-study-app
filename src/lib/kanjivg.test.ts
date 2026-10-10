import { describe, expect, it } from 'vitest';
import { isKanji, kanjiChars, kanjiFilename, parseKanjiSvg } from './kanjivg';

// Abbreviated KanjiVG file for 分 (same structure as the real files).
const bun = `<svg xmlns="http://www.w3.org/2000/svg" width="109" height="109" viewBox="0 0 109 109">
<g id="kvg:StrokePaths_05206" style="fill:none;stroke:#000000;stroke-width:3;">
<path id="kvg:05206-s1" kvg:type="㇒" d="M41.12,19.38c0.25,1.24-0.44,3.01-1.1,4.08"/>
<path id="kvg:05206-s2" kvg:type="㇏" d="M54.69,13.75c7.56-0.12,20.68,19.17,29.41,25.95"/>
<path id="kvg:05206-s3" kvg:type="㇆" d="M29.35,55.37c2.42,0.83,4.97,0.75,7.42,0.37"/>
<path id="kvg:05206-s4" kvg:type="㇒" d="M49.12,57.25c0.15,1.49,0.06,2.72-0.56,4.08"/>
</g>
<g id="kvg:StrokeNumbers_05206" style="font-size:8;fill:#808080">
	<text transform="matrix(1 0 0 1 32.50 19.50)">1</text>
	<text transform="matrix(1 0 0 1 50.50 11.50)">2</text>
	<text transform="matrix(1 0 0 1 30.50 52.50)">3</text>
	<text transform="matrix(1 0 0 1 39.50 65.50)">4</text>
</g>
</svg>`;

describe('kanjivg', () => {
  it('maps characters to KanjiVG file names', () => {
    expect(kanjiFilename('会')).toBe('04f1a.svg');
    expect(kanjiFilename('議')).toBe('08b70.svg');
    expect(kanjiFilename('分')).toBe('05206.svg');
  });

  it('finds the kanji in a word', () => {
    expect(kanjiChars('会議')).toEqual(['会', '議']);
    expect(kanjiChars('トヨタ')).toEqual([]);
    expect(isKanji('か')).toBe(false);
  });

  it('parses strokes and numbers', () => {
    const k = parseKanjiSvg('分', bun);
    expect(k.paths).toHaveLength(4);
    expect(k.numbers.map((n) => n.n)).toEqual([1, 2, 3, 4]);
    expect(k.numbers[0]).toEqual({ n: 1, x: 32.5, y: 19.5 });
  });

  it('throws when no strokes are present', () => {
    expect(() => parseKanjiSvg('x', '<html></html>')).toThrow();
  });
});
