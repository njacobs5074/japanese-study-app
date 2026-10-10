export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface DictionaryEntry {
  word: string;
  kana: string;
  gloss: string;
}

export interface KanjiInfo {
  onyomi: string[];
  kunyomi: string[];
  meaning: string;
}

/** Source of readings and definitions. Real implementation pending (open decision 1). */
export interface Dictionary {
  lookup(word: string): DictionaryEntry | undefined;
  kanjiInfo(char: string): KanjiInfo | undefined;
}

/** Source of JLPT levels per kanji. Real implementation pending (open decision 2). */
export interface JlptLevels {
  forKanji(char: string): JlptLevel | undefined;
}
