import type { JlptLevel, JlptLevels } from './types';

// Placeholder JLPT levels for a few kanji so the badges can be shown before a real
// source is chosen (open decision 2). Illustrative only; not an authoritative list.
const fixtureLevels: Record<string, JlptLevel> = {
  会: 'N4',
  議: 'N2',
  分: 'N5',
};

export const fixtureJlptLevels: JlptLevels = {
  forKanji: (char) => fixtureLevels[char],
};
