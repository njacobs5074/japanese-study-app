import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fixtureDictionary } from '../data/fixtures';
import {
  deleteStudyItem,
  getSavedText,
  getStudyList,
  putSavedText,
  putStudyItem,
  type SavedText,
  type StudyItem,
} from '../lib/db';
import type { Segment } from '../lib/tokenizer';

interface StudyContextValue {
  loaded: boolean;
  /** True when something could not be saved to or read from IndexedDB. */
  storageError: boolean;
  text: SavedText | null;
  studyList: StudyItem[];
  saveText: (text: SavedText) => void;
  toggleWord: (segment: Segment) => void;
  removeWord: (word: string) => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export function StudyProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [text, setText] = useState<SavedText | null>(null);
  const [studyList, setStudyList] = useState<StudyItem[]>([]);

  useEffect(() => {
    Promise.all([getSavedText(), getStudyList()])
      .then(([t, list]) => {
        setText(t ?? null);
        setStudyList(list);
      })
      .catch(() => setStorageError(true))
      .finally(() => setLoaded(true));
  }, []);

  const persist = useCallback((write: Promise<void>) => {
    write.catch(() => setStorageError(true));
  }, []);

  const saveText = useCallback(
    (t: SavedText) => {
      setText(t);
      persist(putSavedText(t));
    },
    [persist],
  );

  const removeWord = useCallback(
    (word: string) => {
      setStudyList((list) => list.filter((i) => i.word !== word));
      persist(deleteStudyItem(word));
    },
    [persist],
  );

  const toggleWord = useCallback(
    (segment: Segment) => {
      const word = segment.word;
      if (!word) return;
      if (studyList.some((i) => i.word === word)) {
        removeWord(word);
        return;
      }
      const known = fixtureDictionary.lookup(word);
      const item: StudyItem = {
        word,
        kana: known?.kana ?? segment.kana ?? word,
        gloss: known?.gloss,
        addedAt: Date.now(),
      };
      setStudyList((list) => [...list, item]);
      persist(putStudyItem(item));
    },
    [studyList, removeWord, persist],
  );

  const value = useMemo(
    () => ({ loaded, storageError, text, studyList, saveText, toggleWord, removeWord }),
    [loaded, storageError, text, studyList, saveText, toggleWord, removeWord],
  );
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used inside <StudyProvider>');
  return ctx;
}
