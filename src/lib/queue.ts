import { newReview, type ReviewRecord } from './scheduling';

export type QueueStatus = 'now' | 'next' | 'queued';

export interface QueueItem {
  word: string;
  status: QueueStatus;
  dueAt: number;
}

/**
 * Orders words by due time (never-reviewed words first). Due words are the current
 * card ("now") followed by "next"; words not yet due are "queued".
 */
export function buildQueue(
  words: string[],
  reviews: ReadonlyMap<string, ReviewRecord>,
  now: number,
): QueueItem[] {
  const items = words
    .map((word) => ({ word, dueAt: (reviews.get(word) ?? newReview(word)).dueAt }))
    .sort((a, b) => a.dueAt - b.dueAt);

  let seenNow = false;
  return items.map((item) => {
    if (item.dueAt > now) return { ...item, status: 'queued' as const };
    if (!seenNow) {
      seenNow = true;
      return { ...item, status: 'now' as const };
    }
    return { ...item, status: 'next' as const };
  });
}

/**
 * Applies a manual choice to a queue: the chosen word becomes the current card ("now") and the
 * word that was current becomes "next". The order of the list is left alone so it does not jump
 * around while you click. An unknown or empty choice leaves the queue unchanged.
 */
export function withSelection(queue: QueueItem[], selectedWord: string | null): QueueItem[] {
  if (!selectedWord || !queue.some((i) => i.word === selectedWord)) return queue;
  return queue.map((item) => {
    if (item.word === selectedWord) return { ...item, status: 'now' as const };
    if (item.status === 'now') return { ...item, status: 'next' as const };
    return item;
  });
}
