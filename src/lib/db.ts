import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ReviewRecord } from './scheduling';

interface StudyDB extends DBSchema {
  reviews: { key: string; value: ReviewRecord };
  kanjivg: { key: string; value: string };
}

let dbPromise: Promise<IDBPDatabase<StudyDB>> | undefined;

function db() {
  dbPromise ??= openDB<StudyDB>('japanese-study-app', 1, {
    upgrade(d) {
      d.createObjectStore('reviews', { keyPath: 'word' });
      d.createObjectStore('kanjivg');
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
