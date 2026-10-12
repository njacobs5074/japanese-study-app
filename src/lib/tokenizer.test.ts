import { beforeAll, describe, expect, it } from 'vitest';
import { TokenizerBuilder } from '@patdx/kuromoji';
import NodeDictionaryLoader from '@patdx/kuromoji/node';
import type { IpadicFeatures } from '@patdx/kuromoji';
import { katakanaToHiragana, mergeTekiSuffix, segmentText, type Segment, type Tokenizer } from './tokenizer';

describe('katakanaToHiragana', () => {
  it('converts katakana and leaves other characters alone', () => {
    expect(katakanaToHiragana('カイギ')).toBe('かいぎ');
    expect(katakanaToHiragana('ガッコウー')).toBe('がっこうー');
  });
});

describe('segmentText (real kuromoji dictionary)', () => {
  let tokenizer: Tokenizer;
  beforeAll(async () => {
    tokenizer = await new TokenizerBuilder({
      loader: new NodeDictionaryLoader({ dic_path: 'node_modules/@patdx/kuromoji/dict/' }),
    }).build();
  }, 60_000);

  const flat = (text: string): Segment[] => segmentText(tokenizer, text).flat();

  it('splits the fixture sentence and classifies each part', () => {
    const segs = flat('トヨタの会議は30分');
    expect(segs.map((s) => s.surface).join('')).toBe('トヨタの会議は30分');
    const byKind = (k: string) => segs.filter((s) => s.kind === k).map((s) => s.surface);
    expect(byKind('particle')).toEqual(['の', 'は']);
    expect(byKind('number')).toEqual(['30']);
    expect(byKind('word')).toEqual(expect.arrayContaining(['トヨタ', '会議', '分']));
  });

  it('gives hiragana readings for words', () => {
    const kaigi = flat('会議').find((s) => s.word === '会議');
    expect(kaigi?.kana).toBe('かいぎ');
  });

  it('maps conjugated words to their dictionary form and reading', () => {
    const taberu = flat('朝ごはんを食べた').find((s) => s.surface === '食べ');
    expect(taberu).toMatchObject({ kind: 'word', word: '食べる', kana: 'たべる' });
  });

  it('marks punctuation and keeps lines separate', () => {
    const lines = segmentText(tokenizer, '会議です。\n\n終わり');
    expect(lines).toHaveLength(2);
    expect(lines[0].some((s) => s.kind === 'punct' && s.surface === '。')).toBe(true);
  });
});

describe('mergeTekiSuffix', () => {
  const tok = (surface: string, pos: string, d1 = '*', d2 = '*', reading = '*'): IpadicFeatures =>
    ({
      surface_form: surface,
      basic_form: surface,
      pos,
      pos_detail_1: d1,
      pos_detail_2: d2,
      pos_detail_3: '*',
      reading,
      pronunciation: reading,
    }) as IpadicFeatures;
  const teki = tok('的', '名詞', '接尾', '形容動詞語幹', 'テキ');

  it('joins a noun and the suffix 的, including readings', () => {
    const merged = mergeTekiSuffix([tok('個人', '名詞', '一般', '*', 'コジン'), teki]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ surface_form: '個人的', basic_form: '個人的', reading: 'コジンテキ' });
  });

  it('leaves a standalone 的 (an ordinary noun) alone', () => {
    const standalone = tok('的', '名詞', '一般', '*', 'マト');
    expect(mergeTekiSuffix([tok('を', '助詞'), standalone])).toHaveLength(2);
    expect(mergeTekiSuffix([standalone])).toHaveLength(1);
  });

  it('does not merge after a number, a suffix, a particle or at the start', () => {
    expect(mergeTekiSuffix([tok('30', '名詞', '数'), teki])).toHaveLength(2);
    expect(mergeTekiSuffix([tok('化', '名詞', '接尾', '*', 'カ'), teki])).toHaveLength(2);
    expect(mergeTekiSuffix([tok('は', '助詞'), teki])).toHaveLength(2);
    expect(mergeTekiSuffix([teki])).toHaveLength(1);
  });

  it('marks the reading unknown when either part has none', () => {
    const merged = mergeTekiSuffix([tok('個人', '名詞', '一般'), teki]);
    expect(merged[0].reading).toBe('*');
  });
});

describe('segmentText with 的 (real dictionary)', () => {
  let tokenizer: Tokenizer;
  beforeAll(async () => {
    tokenizer = await new TokenizerBuilder({
      loader: new NodeDictionaryLoader({ dic_path: 'node_modules/@patdx/kuromoji/dict/' }),
    }).build();
  }, 60_000);

  const words = (text: string) =>
    segmentText(tokenizer, text)
      .flat()
      .filter((s) => s.kind === 'word')
      .map((s) => [s.surface, s.word, s.kana]);

  it.each([
    ['個人的な意見', '個人的', 'こじんてき'],
    ['具体的に説明する', '具体的', 'ぐたいてき'],
    ['基本的には同じ', '基本的', 'きほんてき'],
    ['世界的に有名', '世界的', 'せかいてき'],
    ['一般的だ', '一般的', 'いっぱんてき'],
  ])('%s gives one word for the 〜的 part', (text, word, kana) => {
    const found = words(text);
    expect(found).toContainEqual([word, word, kana]);
    expect(found.map((w) => w[0])).not.toContain('的');
  });

  it('keeps the particles that follow 的 as separate, non-word segments', () => {
    const segs = segmentText(tokenizer, '個人的な意見').flat();
    expect(segs.map((s) => s.surface)).toEqual(['個人的', 'な', '意見']);
    expect(segs.map((s) => s.kind)).toEqual(['word', 'particle', 'word']);
  });

  it('leaves a standalone 的 as its own word', () => {
    expect(words('的を射る')).toContainEqual(['的', '的', 'まと']);
  });

  it('does not affect numbers with 分', () => {
    const segs = segmentText(tokenizer, '30分で終わる').flat();
    expect(segs.map((s) => s.surface)).toContain('分');
    expect(segs.map((s) => s.surface)).toContain('30');
  });
});
