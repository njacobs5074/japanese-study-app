import { describe, expect, it } from 'vitest';
import bun from '../../public/kanjivg/05206.svg?raw';
import { isKanji, kanjiChars, kanjiFilename, parseKanjiSvg } from './kanjivg';

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
