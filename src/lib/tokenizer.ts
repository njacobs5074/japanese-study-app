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

/**
 * The suffix 的 (as in 個人的, 具体的) has its own tag in the dictionary: noun / suffix /
 * adjective stem. A standalone 的 ("target", as in 的を射る) is tagged as an ordinary noun.
 */
function isTekiSuffix(token: IpadicFeatures): boolean {
  return (
    token.surface_form === '的' &&
    token.pos === '名詞' &&
    token.pos_detail_1 === '接尾' &&
    token.pos_detail_2 === '形容動詞語幹'
  );
}

/** A noun can take 的, unless it is a number or itself a suffix (so 化 + 的 is not merged). */
function canTakeTeki(token: IpadicFeatures): boolean {
  return token.pos === '名詞' && token.pos_detail_1 !== '数' && token.pos_detail_1 !== '接尾';
}

/**
 * Joins a noun and a following suffix 的 into one token (個人 + 的 -> 個人的), since the
 * tokenizer always splits them but they are one word. The merged token keeps the noun's tags,
 * uses the joined text as its dictionary form, and joins the readings (unknown if either is).
 */
export function mergeTekiSuffix(tokens: IpadicFeatures[]): IpadicFeatures[] {
  const out: IpadicFeatures[] = [];
  for (const token of tokens) {
    const prev = out.at(-1);
    if (prev && isTekiSuffix(token) && canTakeTeki(prev)) {
      const surface = prev.surface_form + token.surface_form;
      const known = (r: string | undefined) => (r && r !== '*' ? r : undefined);
      const join = (a: string | undefined, b: string | undefined) =>
        known(a) && known(b) ? known(a)! + known(b)! : '*';
      out[out.length - 1] = {
        ...prev,
        surface_form: surface,
        basic_form: surface,
        reading: join(prev.reading, token.reading),
        pronunciation: join(prev.pronunciation, token.pronunciation),
      };
    } else {
      out.push(token);
    }
  }
  return out;
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
      mergeTekiSuffix(tokenizer.tokenize(line)).map((token): Segment => {
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
