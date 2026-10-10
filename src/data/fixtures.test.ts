import { describe, expect, it } from 'vitest';
import { createDictionary, pickEntry, shortGloss, type JmdictData, type KanjidicData } from './jmdict';
import { fixtureJlptLevels } from './fixtures';

const jmdict: JmdictData = {
  entries: {
    分: [
      [['ふん'], 'minute (unit of time)'],
      [['ぶん'], 'part, portion; amount'],
    ],
    トヨタ: [[['トヨタ'], 'Toyota']],
  },
};
const kanjidic: KanjidicData = {
  kanji: { 会: { on: ['カイ', 'エ'], kun: ['あ.う'], meanings: ['meeting', 'meet', 'party', 'association'] } },
};
const dict = createDictionary(
  async () => jmdict,
  async () => kanjidic,
);

describe('pickEntry', () => {
  it('prefers the entry matching the reading', () => {
    expect(pickEntry(jmdict.entries['分'], 'ぶん')?.[1]).toContain('part');
  });

  it('matches regardless of hiragana/katakana', () => {
    expect(pickEntry(jmdict.entries['トヨタ'], 'とよた')?.[1]).toBe('Toyota');
  });

  it('falls back to the first (most common) entry', () => {
    expect(pickEntry(jmdict.entries['分'], 'わ')?.[1]).toContain('minute');
    expect(pickEntry(jmdict.entries['分'])?.[1]).toContain('minute');
    expect(pickEntry([])).toBeUndefined();
  });
});

describe('shortGloss', () => {
  it('keeps only the first sense', () => {
    expect(shortGloss('to eat; to live on')).toBe('to eat');
  });
});

describe('dictionary', () => {
  it('looks up words by reading', async () => {
    expect(await dict.lookup('分', 'ふん')).toEqual({ word: '分', kana: 'ふん', gloss: 'minute (unit of time)' });
    expect((await dict.lookup('分', 'ぶん'))?.kana).toBe('ぶん');
    expect(await dict.lookup('猫')).toBeUndefined();
  });

  it('returns kanji info with a short meaning', async () => {
    expect(await dict.kanjiInfo('会')).toEqual({
      onyomi: ['カイ', 'エ'],
      kunyomi: ['あ.う'],
      meaning: 'meeting, meet, party',
    });
    expect(await dict.kanjiInfo('猫')).toBeUndefined();
  });
});

describe('fixture JLPT levels', () => {
  it('are only defined for the fixture kanji', () => {
    expect(fixtureJlptLevels.forKanji('会')).toBe('N4');
    expect(fixtureJlptLevels.forKanji('猫')).toBeUndefined();
  });
});
