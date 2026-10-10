import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { dictionary } from '../data/jmdict';
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
  /** True when the dictionary could not be downloaded, so definitions are missing. */
  dictionaryError: boolean;
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
  const [dictionaryError, setDictionaryError] = useState(false);
  const resolving = useRef(new Set<string>());
  const listRef = useRef<StudyItem[]>([]);
  const [text, setText] = useState<SavedText | null>(null);
  const [studyList, setStudyList] = useState<StudyItem[]>([]);
  listRef.current = studyList;

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
      const item: StudyItem = { word, kana: segment.kana ?? word, addedAt: Date.now() };
      setStudyList((list) => [...list, item]);
      persist(putStudyItem(item));
    },
    [studyList, removeWord, persist],
  );

  // Fill in definitions in the background; the dictionary is downloaded on first need.
  useEffect(() => {
    const pending = studyList.filter((i) => !i.lookedUp && !resolving.current.has(i.word));
    for (const item of pending) {
      resolving.current.add(item.word);
      dictionary
        .lookup(item.word, item.kana === item.word ? undefined : item.kana)
        .then((entry) => {
          const resolved: StudyItem = {
            ...item,
            kana: item.kana === item.word && entry ? entry.kana : item.kana,
            gloss: entry?.gloss,
            lookedUp: true,
          };
          setDictionaryError(false);
          if (!listRef.current.some((i) => i.word === item.word)) return; // removed meanwhile
          setStudyList((list) => list.map((i) => (i.word === item.word ? resolved : i)));
          persist(putStudyItem(resolved));
        })
        .catch(() => setDictionaryError(true))
        .finally(() => resolving.current.delete(item.word));
    }
  }, [studyList, persist]);

  const value = useMemo(
    () => ({ loaded, storageError, dictionaryError, text, studyList, saveText, toggleWord, removeWord }),
    [loaded, storageError, dictionaryError, text, studyList, saveText, toggleWord, removeWord],
  );
  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy(): StudyContextValue {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy must be used inside <StudyProvider>');
  return ctx;
}
