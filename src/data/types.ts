export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface DictionaryEntry {
  word: string;
  /** Hiragana/katakana reading of the matched entry. */
  kana: string;
  gloss: string;
}

export interface KanjiInfo {
  onyomi: string[];
  kunyomi: string[];
  meaning: string;
}

/** Source of readings and definitions (JMdict + KANJIDIC2). */
export interface Dictionary {
  /** `reading` (kana) picks the right entry among homographs, e.g. 分 as ふん vs ぶん. */
  lookup(word: string, reading?: string): Promise<DictionaryEntry | undefined>;
  kanjiInfo(char: string): Promise<KanjiInfo | undefined>;
}

/** Source of JLPT levels per kanji. Real implementation pending (open decision 2). */
export interface JlptLevels {
  forKanji(char: string): JlptLevel | undefined;
}
