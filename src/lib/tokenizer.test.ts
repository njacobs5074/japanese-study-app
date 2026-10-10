import { beforeAll, describe, expect, it } from 'vitest';
import { TokenizerBuilder } from '@patdx/kuromoji';
import NodeDictionaryLoader from '@patdx/kuromoji/node';
import { katakanaToHiragana, segmentText, type Segment, type Tokenizer } from './tokenizer';

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
