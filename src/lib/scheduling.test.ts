import { describe, expect, it } from 'vitest';
import { newReview, schedule } from './scheduling';

const NOW = 1_000_000_000_000;
const DAY = 86_400_000;

describe('schedule', () => {
  it('again makes the word due now and resets the interval', () => {
    const prev = { ...newReview('会議'), intervalDays: 10 };
    const next = schedule(prev, 'again', NOW);
    expect(next.dueAt).toBe(NOW);
    expect(next.intervalDays).toBe(0);
    expect(next.ease).toBe(2.3);
    expect(next.lastGrade).toBe('again');
  });

  it('hard, good and easy multiply the interval by 1.2 / ease / ease*1.3', () => {
    const prev = { ...newReview('会議'), intervalDays: 10 };
    expect(schedule(prev, 'hard', NOW).intervalDays).toBe(12);
    expect(schedule(prev, 'good', NOW).intervalDays).toBe(25);
    expect(schedule(prev, 'easy', NOW).intervalDays).toBe(32.5);
  });

  it('nudges ease down, unchanged, up', () => {
    const prev = newReview('会議');
    expect(schedule(prev, 'hard', NOW).ease).toBe(2.35);
    expect(schedule(prev, 'good', NOW).ease).toBe(2.5);
    expect(schedule(prev, 'easy', NOW).ease).toBe(2.65);
  });

  it('moves a new word forward on its first successful review', () => {
    const next = schedule(newReview('分'), 'good', NOW);
    expect(next.intervalDays).toBe(2.5);
    expect(next.dueAt).toBe(NOW + 2.5 * DAY);
  });

  it('never lets ease drop below the minimum', () => {
    let r = newReview('分');
    for (let i = 0; i < 20; i++) r = schedule(r, 'again', NOW);
    expect(r.ease).toBe(1.3);
  });

  it('does not mutate its input', () => {
    const prev = newReview('分');
    schedule(prev, 'easy', NOW);
    expect(prev).toEqual(newReview('分'));
  });
});
