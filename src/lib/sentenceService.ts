import { cacheSentences, getCachedSentences } from './db';
import { fetchSentences, type Sentence } from './tatoeba';

/**
 * Returns example sentences for a word. A cached word (even one with no results) is
 * never refetched automatically; only a cache miss hits the Tatoeba API.
 */
export async function getSentences(word: string, signal?: AbortSignal): Promise<Sentence[]> {
  const cached = await getCachedSentences(word).catch(() => undefined);
  if (cached) return cached.sentences;

  const sentences = await fetchSentences(word, signal);
  await cacheSentences({ word, fetchedAt: Date.now(), sentences }).catch(() => undefined);
  return sentences;
}
