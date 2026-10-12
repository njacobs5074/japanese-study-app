import { describe, expect, it } from 'vitest';
import { buildQueue, withSelection } from './queue';
import { newReview, type ReviewRecord } from './scheduling';

const NOW = 1_000_000;

function reviews(...rs: Partial<ReviewRecord>[]) {
  return new Map(rs.map((r) => [r.word!, { ...newReview(r.word!), ...r }]));
}

describe('buildQueue', () => {
  it('puts new words first, then marks the rest next', () => {
    const q = buildQueue(['a', 'b'], reviews(), NOW);
    expect(q.map((i) => i.status)).toEqual(['now', 'next']);
  });

  it('queues words that are not yet due', () => {
    const q = buildQueue(['a', 'b'], reviews({ word: 'a', dueAt: NOW + 5 }), NOW);
    expect(q).toEqual([
      { word: 'b', status: 'now', dueAt: 0 },
      { word: 'a', status: 'queued', dueAt: NOW + 5 },
    ]);
  });

  it('sends a word graded "again" behind words that have not been shown yet', () => {
    const q = buildQueue(['a', 'b'], reviews({ word: 'a', dueAt: NOW }), NOW);
    expect(q.map((i) => i.word)).toEqual(['b', 'a']);
  });

  it('has no current card when nothing is due', () => {
    const q = buildQueue(['a'], reviews({ word: 'a', dueAt: NOW + 1 }), NOW);
    expect(q.some((i) => i.status === 'now')).toBe(false);
  });
});

describe('withSelection', () => {
  const queue = buildQueue(['a', 'b', 'c'], reviews({ word: 'c', dueAt: NOW + 5 }), NOW);
  // order: a (now), b (next), c (queued)

  it('makes the chosen word current and demotes the previous one', () => {
    const q = withSelection(queue, 'c');
    expect(q.map((i) => [i.word, i.status])).toEqual([
      ['a', 'next'],
      ['b', 'next'],
      ['c', 'now'],
    ]);
  });

  it('keeps the list order', () => {
    expect(withSelection(queue, 'b').map((i) => i.word)).toEqual(['a', 'b', 'c']);
  });

  it('can pick a word when nothing is due', () => {
    const none = buildQueue(['a', 'b'], reviews({ word: 'a', dueAt: NOW + 1 }, { word: 'b', dueAt: NOW + 2 }), NOW);
    expect(none.some((i) => i.status === 'now')).toBe(false);
    expect(withSelection(none, 'b').map((i) => i.status)).toEqual(['queued', 'now']);
  });

  it('leaves the queue alone for no choice or an unknown word', () => {
    expect(withSelection(queue, null)).toBe(queue);
    expect(withSelection(queue, 'zzz')).toBe(queue);
  });

  it('is a no-op when the current word is chosen', () => {
    expect(withSelection(queue, 'a')).toEqual(queue);
  });
});
