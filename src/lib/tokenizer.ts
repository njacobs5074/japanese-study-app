import type { IpadicFeatures, TokenizerBuilder } from '@patdx/kuromoji';
import { fetchGunzipped } from './gzip';

export type SegmentKind = 'word' | 'particle' | 'punct' | 'number' | 'other';

export interface Segment {
  surface: string;
  kind: SegmentKind;
  /** Dictionary form (only for kind === 'word'); the key used in the study list. */
  word?: string;
  /** Reading of the dictionary form in hiragana, when known. */
  kana?: string;
}

/** The part of a kuromoji tokenizer we depend on (also lets tests pass a stub). */
export interface Tokenizer {
  tokenize(text: string): IpadicFeatures[];
}

const JAPANESE_RE = /[぀-ヿ㐀-䶿一-鿿]/;

export function katakanaToHiragana(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export function classify(token: IpadicFeatures): SegmentKind {
  const { pos, pos_detail_1: detail, surface_form: surface } = token;
  if (pos === '記号') return 'punct';
  if (pos === '助詞' || pos === '助動詞') return 'particle';
  if (detail === '数') return 'number';
  if (!JAPANESE_RE.test(surface)) return 'other';
  return 'word';
}

function dictionaryForm(token: IpadicFeatures): string {
  return token.basic_form && token.basic_form !== '*' ? token.basic_form : token.surface_form;
}

function readingOf(tokens: IpadicFeatures[]): string | undefined {
  if (tokens.length === 0 || tokens.some((t) => !t.reading || t.reading === '*')) return undefined;
  return katakanaToHiragana(tokens.map((t) => t.reading).join(''));
}

/** Splits a passage into lines of segments. Blank lines are dropped. */
export function segmentText(tokenizer: Tokenizer, text: string): Segment[][] {
  const readingCache = new Map<string, string | undefined>();
  const kanaFor = (token: IpadicFeatures, word: string): string | undefined => {
    if (word === token.surface_form) return readingOf([token]);
    // Inflected: tokenize the dictionary form itself to get its reading.
    if (!readingCache.has(word)) readingCache.set(word, readingOf(tokenizer.tokenize(word)));
    return readingCache.get(word);
  };

  return text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .map((line) =>
      tokenizer.tokenize(line).map((token): Segment => {
        const kind = classify(token);
        if (kind !== 'word') return { surface: token.surface_form, kind };
        const word = dictionaryForm(token);
        return { surface: token.surface_form, kind, word, kana: kanaFor(token, word) };
      }),
    );
}

let tokenizerPromise: Promise<Tokenizer> | undefined;

/**
 * Loads kuromoji and its dictionary (~17 MB, self-hosted) on first use only.
 */
export function loadTokenizer(): Promise<Tokenizer> {
  tokenizerPromise ??= (async () => {
    const { TokenizerBuilder: Builder } = await import('@patdx/kuromoji');
    const base = `${import.meta.env.BASE_URL}kuromoji-dict/`;
    const builder: TokenizerBuilder = new Builder({
      loader: {
        loadArrayBuffer: (file: string) => fetchGunzipped(base + file),
      },
    });
    return builder.build();
  })();
  tokenizerPromise.catch(() => (tokenizerPromise = undefined));
  return tokenizerPromise;
}
