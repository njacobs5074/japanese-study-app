import type { JlptLevels } from './types';

// TODO (open decision 2): no JLPT source has been chosen yet, so no levels are known and
// no badges are shown. Replace this with a real implementation of JlptLevels.
export const jlptLevels: JlptLevels = {
  forKanji: () => undefined,
};
