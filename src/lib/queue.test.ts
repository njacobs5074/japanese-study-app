import { describe, expect, it } from 'vitest';
import { buildQueue } from './queue';
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
