import type { components, paths } from './tatoeba-api';

// API types are generated from https://api.tatoeba.org/openapi.json (npm run gen-tatoeba-types).
// The spec marks every field optional, so the mapping below checks what it needs.
export type ApiSentencesResponse = NonNullable<
  paths['/v1/sentences']['get']['responses'][200]['content']
>['application/json'];
type ApiSentence = components['schemas']['SentenceWithTranslations'];
type ApiTranslation = components['schemas']['Translation'];

/** App-level shape: only what the UI needs, including attribution for every text. */
export interface Attributed {
  id: number;
  text: string;
  owner: string | null;
  license: 'CC BY 2.0 FR' | 'CC0 1.0';
}

export interface Sentence extends Attributed {
  /** Plain-kana reading, when Tatoeba has a Japanese transcription. */
  reading?: string;
  translation?: Attributed;
}

export const API_BASE = 'https://api.tatoeba.org/v1/sentences';
export const SENTENCE_LIMIT = 10;

/** Quotes the word as a ManticoreSearch phrase so it is matched literally. */
export function quoteQuery(word: string): string {
  return `"${word.replace(/[\\"]/g, '\\$&')}"`;
}

/**
 * Builds the search URL. The `license` parameter is deliberately not sent: without it
 * the API already excludes sentences flagged with a licensing problem.
 */
type SearchQuery = NonNullable<paths['/v1/sentences']['get']['parameters']['query']>;

export function buildSearchUrl(word: string, limit = SENTENCE_LIMIT): string {
  // Typed against the spec, so a misspelled or wrongly typed parameter fails to compile.
  const query: SearchQuery = {
    lang: ['jpn'],
    q: quoteQuery(word),
    'trans:lang': 'eng',
    'showtrans:lang': 'eng',
    include: ['transcriptions'],
    sort: 'random',
    limit,
  };
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  return `${API_BASE}?${params}`;
}

export function sentenceUrl(id: number): string {
  return `https://tatoeba.org/en/sentences/show/${id}`;
}

export function licenseUrl(license: Attributed['license']): string {
  return license === 'CC0 1.0'
    ? 'https://creativecommons.org/publicdomain/zero/1.0/'
    : 'https://creativecommons.org/licenses/by/2.0/fr/';
}

/**
 * Converts Tatoeba's furigana markup to plain kana: `[会議|かい|ぎ]は` -> `かいぎは`.
 * Text outside brackets is kept as is.
 */
export function transcriptionToKana(markup: string): string {
  return markup.replace(/\[[^|\]]*\|([^\]]*)\]/g, (_, readings: string) => readings.replaceAll('|', ''));
}

/** Keeps what we need for display and attribution; drops anything incomplete or flagged. */
function attributed(s: ApiSentence | ApiTranslation): Attributed | undefined {
  if (s.id === undefined || s.text === undefined) return undefined;
  if (s.license !== 'CC BY 2.0 FR' && s.license !== 'CC0 1.0') return undefined; // incl. PROBLEM
  return { id: s.id, text: s.text, owner: s.owner ?? null, license: s.license };
}

export function mapSentences(response: ApiSentencesResponse): Sentence[] {
  const out: Sentence[] = [];
  for (const raw of response.data ?? []) {
    const base = attributed(raw);
    if (!base) continue;
    const translations = raw.translations ?? [];
    const t = translations.find((x) => x.is_direct) ?? translations[0];
    const kana = raw.transcriptions?.find((x) => x.script === 'Hrkt' && x.text);
    out.push({
      ...base,
      reading: kana?.text ? transcriptionToKana(kana.text) : undefined,
      translation: t ? attributed(t) : undefined,
    });
  }
  return out;
}

export async function fetchSentences(word: string, signal?: AbortSignal): Promise<Sentence[]> {
  const res = await fetch(buildSearchUrl(word), { signal });
  if (!res.ok) throw new Error(`Tatoeba request failed (${res.status})`);
  const json: unknown = await res.json();
  if (!json || typeof json !== 'object' || !Array.isArray((json as ApiSentencesResponse).data)) {
    throw new Error('Unexpected response from Tatoeba');
  }
  return mapSentences(json as ApiSentencesResponse);
}

/** Splits text around occurrences of the target word, for highlighting. */
export function splitOnWord(text: string, word: string): { text: string; match: boolean }[] {
  if (!word) return [{ text, match: false }];
  const parts: { text: string; match: boolean }[] = [];
  let i = 0;
  for (;;) {
    const j = text.indexOf(word, i);
    if (j === -1) break;
    if (j > i) parts.push({ text: text.slice(i, j), match: false });
    parts.push({ text: word, match: true });
    i = j + word.length;
  }
  if (i < text.length) parts.push({ text: text.slice(i), match: false });
  return parts;
}
