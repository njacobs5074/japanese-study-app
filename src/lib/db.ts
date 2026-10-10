import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ReviewRecord } from './scheduling';
import type { Sentence } from './tatoeba';

export interface CachedSentences {
  word: string;
  fetchedAt: number;
  sentences: Sentence[];
}

interface StudyDB extends DBSchema {
  reviews: { key: string; value: ReviewRecord };
  kanjivg: { key: string; value: string };
  sentences: { key: string; value: CachedSentences };
}

let dbPromise: Promise<IDBPDatabase<StudyDB>> | undefined;

function db() {
  dbPromise ??= openDB<StudyDB>('japanese-study-app', 2, {
    upgrade(d, oldVersion) {
      if (oldVersion < 1) {
        d.createObjectStore('reviews', { keyPath: 'word' });
        d.createObjectStore('kanjivg');
      }
      if (oldVersion < 2) {
        d.createObjectStore('sentences', { keyPath: 'word' });
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
