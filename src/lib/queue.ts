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
