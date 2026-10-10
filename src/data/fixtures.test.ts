import { describe, expect, it } from 'vitest';
import { fixtureDictionary, fixtureJlptLevels } from './fixtures';

describe('fixture data', () => {
  it('looks up fixture words', () => {
    expect(fixtureDictionary.lookup('会議')?.kana).toBe('かいぎ');
    expect(fixtureDictionary.lookup('分')).toBeDefined();
    expect(fixtureDictionary.lookup('トヨタ')).toBeDefined();
  });

  it('returns undefined for unknown words and kanji', () => {
    expect(fixtureDictionary.lookup('猫')).toBeUndefined();
    expect(fixtureJlptLevels.forKanji('猫')).toBeUndefined();
  });
});
