// Types mirror the schemas in https://api.tatoeba.org/openapi.json
// (SentenceWithTranslations, Translation, Transcription, Paging).

export type TatoebaLicense = 'CC BY 2.0 FR' | 'CC0 1.0' | 'PROBLEM';

interface ApiTranscription {
  script: string;
  text: string;
  type: 'transcription' | 'altscript';
}

interface ApiSentenceBase {
  id: number;
  text: string;
  lang: string | null;
  license: TatoebaLicense;
  owner: string | null;
}

export interface ApiTranslation extends ApiSentenceBase {
  is_direct: boolean;
}

export interface ApiSentence extends ApiSentenceBase {
  translations?: ApiTranslation[];
  transcriptions?: ApiTranscription[];
}

export interface ApiSentencesResponse {
  data: ApiSentence[];
  paging?: { total: number; has_next: boolean };
}

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
export function buildSearchUrl(word: string, limit = SENTENCE_LIMIT): string {
  const params = new URLSearchParams({
    lang: 'jpn',
    q: quoteQuery(word),
    'trans:lang': 'eng',
    'showtrans:lang': 'eng',
    include: 'transcriptions',
    sort: 'random',
    limit: String(limit),
  });
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

function attributed(s: ApiSentenceBase): Attributed | undefined {
  if (s.license === 'PROBLEM') return undefined;
  return { id: s.id, text: s.text, owner: s.owner, license: s.license };
}

export function mapSentences(response: ApiSentencesResponse): Sentence[] {
  const out: Sentence[] = [];
  for (const raw of response.data) {
    const base = attributed(raw);
    if (!base) continue;
    const translations = raw.translations ?? [];
    const t = translations.find((x) => x.is_direct) ?? translations[0];
    const kana = raw.transcriptions?.find((x) => x.script === 'Hrkt');
    out.push({
      ...base,
      reading: kana ? transcriptionToKana(kana.text) : undefined,
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
