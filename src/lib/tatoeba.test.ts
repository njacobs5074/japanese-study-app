import { describe, expect, it } from 'vitest';
import {
  buildSearchUrl,
  mapSentences,
  quoteQuery,
  splitOnWord,
  transcriptionToKana,
  type ApiSentencesResponse,
} from './tatoeba';

describe('buildSearchUrl', () => {
  const url = new URL(buildSearchUrl('会議'));

  it('uses the stable endpoint with the required parameters', () => {
    expect(url.origin + url.pathname).toBe('https://api.tatoeba.org/v1/sentences');
    expect(url.searchParams.get('lang')).toBe('jpn');
    expect(url.searchParams.get('sort')).toBe('random');
    expect(url.searchParams.get('q')).toBe('"会議"');
    expect(url.searchParams.get('trans:lang')).toBe('eng');
    expect(url.searchParams.get('showtrans:lang')).toBe('eng');
    expect(url.searchParams.get('limit')).toBe('10');
  });

  it('does not send the license parameter', () => {
    expect(url.searchParams.has('license')).toBe(false);
  });
});

describe('quoteQuery', () => {
  it('escapes quotes and backslashes', () => {
    expect(quoteQuery('a"b\\c')).toBe('"a\\"b\\\\c"');
  });
});

describe('transcriptionToKana', () => {
  it('replaces bracketed furigana with the readings', () => {
    expect(transcriptionToKana('[会議|かい|ぎ]は[今月|こん|げつ][２０日|はつか]に')).toBe(
      'かいぎはこんげつはつかに',
    );
  });
});

describe('mapSentences', () => {
  const response: ApiSentencesResponse = {
    data: [
      {
        id: 1,
        text: '会議は終わった。',
        lang: 'jpn',
        license: 'CC BY 2.0 FR',
        owner: null,
        transcriptions: [{ script: 'Hrkt', text: '[会議|かい|ぎ]は[終|お]わった。', type: 'altscript' }],
        translations: [
          { id: 2, text: 'Indirect.', lang: 'eng', license: 'CC0 1.0', owner: 'x', is_direct: false },
          { id: 3, text: 'The meeting is over.', lang: 'eng', license: 'CC BY 2.0 FR', owner: 'y', is_direct: true },
        ],
      },
      { id: 4, text: 'flagged', lang: 'jpn', license: 'PROBLEM', owner: 'z' },
    ],
  };

  it('keeps licence and owner, prefers direct translations, drops PROBLEM sentences', () => {
    const [s, ...rest] = mapSentences(response);
    expect(rest).toEqual([]);
    expect(s.owner).toBeNull();
    expect(s.license).toBe('CC BY 2.0 FR');
    expect(s.reading).toBe('かいぎはおわった。');
    expect(s.translation).toEqual({
      id: 3,
      text: 'The meeting is over.',
      owner: 'y',
      license: 'CC BY 2.0 FR',
    });
  });
});

describe('splitOnWord', () => {
  it('marks every occurrence', () => {
    expect(splitOnWord('会議と会議', '会議')).toEqual([
      { text: '会議', match: true },
      { text: 'と', match: false },
      { text: '会議', match: true },
    ]);
  });

  it('returns the whole text when the word is absent', () => {
    expect(splitOnWord('食べた', '食べる')).toEqual([{ text: '食べた', match: false }]);
  });
});
