import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ReviewRecord } from './scheduling';
import type { Sentence } from './tatoeba';
import type { Segment } from './tokenizer';

export interface CachedSentences {
  word: string;
  fetchedAt: number;
  sentences: Sentence[];
}

export interface SavedText {
  title: string;
  body: string;
  /** Tokenized lines, so the passage can be shown again without reloading the tokenizer. */
  lines: Segment[][];
}

export interface StudyItem {
  word: string;
  kana: string;
  gloss?: string;
  addedAt: number;
}

interface StudyDB extends DBSchema {
  reviews: { key: string; value: ReviewRecord };
  kanjivg: { key: string; value: string };
  sentences: { key: string; value: CachedSentences };
  text: { key: string; value: SavedText };
  studyList: { key: string; value: StudyItem };
}

let dbPromise: Promise<IDBPDatabase<StudyDB>> | undefined;

function db() {
  dbPromise ??= openDB<StudyDB>('japanese-study-app', 3, {
    upgrade(d, oldVersion) {
      if (oldVersion < 1) {
        d.createObjectStore('reviews', { keyPath: 'word' });
        d.createObjectStore('kanjivg');
      }
      if (oldVersion < 2) {
        d.createObjectStore('sentences', { keyPath: 'word' });
      }
      if (oldVersion < 3) {
        d.createObjectStore('text');
        d.createObjectStore('studyList', { keyPath: 'word' });
      }
    },
  });
  return dbPromise;
}

export async function getAllReviews(): Promise<Map<string, ReviewRecord>> {
  const all = await (await db()).getAll('reviews');
  return new Map(all.map((r) => [r.word, r]));
}

export async function putReview(record: ReviewRecord): Promise<void> {
  await (await db()).put('reviews', record);
}

export async function getCachedKanjiSvg(char: string): Promise<string | undefined> {
  return (await db()).get('kanjivg', char);
}

export async function cacheKanjiSvg(char: string, svg: string): Promise<void> {
  await (await db()).put('kanjivg', svg, char);
}

export async function getCachedSentences(word: string): Promise<CachedSentences | undefined> {
  return (await db()).get('sentences', word);
}

export async function cacheSentences(entry: CachedSentences): Promise<void> {
  await (await db()).put('sentences', entry);
}

export async function getSavedText(): Promise<SavedText | undefined> {
  return (await db()).get('text', 'current');
}

export async function putSavedText(text: SavedText): Promise<void> {
  await (await db()).put('text', text, 'current');
}

export async function getStudyList(): Promise<StudyItem[]> {
  const all = await (await db()).getAll('studyList');
  return all.sort((a, b) => a.addedAt - b.addedAt);
}

export async function putStudyItem(item: StudyItem): Promise<void> {
  await (await db()).put('studyList', item);
}

export async function deleteStudyItem(word: string): Promise<void> {
  await (await db()).delete('studyList', word);
}
