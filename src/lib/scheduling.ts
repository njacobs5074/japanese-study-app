export type Grade = 'again' | 'hard' | 'good' | 'easy';

export interface ReviewRecord {
  word: string;
  intervalDays: number;
  ease: number;
  /** Epoch milliseconds. */
  dueAt: number;
  lastGrade: Grade | null;
}

export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
const DAY_MS = 24 * 60 * 60 * 1000;

const EASE_NUDGE: Record<Grade, number> = {
  again: -0.2,
  hard: -0.15,
  good: 0,
  easy: 0.15,
};

/** State of a word that has never been reviewed: due immediately. */
export function newReview(word: string): ReviewRecord {
  return { word, intervalDays: 0, ease: DEFAULT_EASE, dueAt: 0, lastGrade: null };
}

/**
 * Pure scheduling function (kept separate so it can be replaced later).
 *
 * - again: due again right now (this session), interval reset to 0.
 * - hard / good / easy: interval multiplied by 1.2 / ease / ease * 1.3, using the
 *   ease from before this grade. A word with interval 0 is treated as 1 day so the
 *   first successful review still moves it forward.
 * - ease is nudged down (hard, again), unchanged (good) or up (easy), never below MIN_EASE.
 */
export function schedule(prev: ReviewRecord, grade: Grade, now: number): ReviewRecord {
  const ease = Math.max(MIN_EASE, round(prev.ease + EASE_NUDGE[grade]));

  if (grade === 'again') {
    return { ...prev, intervalDays: 0, ease, dueAt: now, lastGrade: grade };
  }

  const base = Math.max(prev.intervalDays, 1);
  const multiplier = { hard: 1.2, good: prev.ease, easy: prev.ease * 1.3 }[grade];
  const intervalDays = round(base * multiplier);
  return { ...prev, intervalDays, ease, dueAt: now + intervalDays * DAY_MS, lastGrade: grade };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
