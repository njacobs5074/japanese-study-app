import type { Dictionary, DictionaryEntry, JlptLevels, JlptLevel } from './types';

// Hand-written placeholder data so the UI can be built before the real
// dictionary and JLPT sources are chosen. JLPT levels here are illustrative only.

export const fixtureText = {
  title: 'トヨタの会議は30分',
  body: 'トヨタの会議は30分',
};

export const fixtureWords: DictionaryEntry[] = [
  { word: '会議', kana: 'かいぎ', gloss: 'meeting, conference' },
  { word: '分', kana: 'ふん', gloss: 'minute (of time)' },
  { word: 'トヨタ', kana: 'トヨタ', gloss: 'Toyota (company name)' },
];

const fixtureLevels: Record<string, JlptLevel> = {
  会: 'N4',
  議: 'N2',
  分: 'N5',
};

export const fixtureDictionary: Dictionary = {
  lookup: (word) => fixtureWords.find((e) => e.word === word),
};

export const fixtureJlptLevels: JlptLevels = {
  forKanji: (char) => fixtureLevels[char],
};
