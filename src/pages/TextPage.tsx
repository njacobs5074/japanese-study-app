import { useEffect, useState } from 'react';
import Card from '../components/Card';
import TwoColumn from '../components/TwoColumn';
import { preloadDictionary } from '../data/jmdict';
import { loadTokenizer, segmentText } from '../lib/tokenizer';
import { useStudy } from '../state/StudyContext';
import StudyListPanel from './StudyListPanel';

type Status = 'idle' | 'loading-dictionary' | 'error';

export default function TextPage() {
  const { loaded, storageError, text, studyList, saveText, clearText, toggleWord } = useStudy();
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [seeded, setSeeded] = useState(false);

  // Fill the form from the saved text once, after it has loaded from IndexedDB.
  useEffect(() => {
    if (loaded && !seeded) {
      setBody(text?.body ?? '');
      setSeeded(true);
    }
  }, [loaded, seeded, text]);

  async function split() {
    setStatus('loading-dictionary');
    preloadDictionary(); // fetch definitions in parallel so taps resolve quickly
    try {
      const tokenizer = await loadTokenizer();
      const lines = segmentText(tokenizer, body);
      saveText({ body, lines });
      setStatus('idle');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }

  /** Empties the text box and the split words. The study list is deliberately left as is. */
  function clear() {
    setBody('');
    setStatus('idle');
    clearText();
  }

  const selected = new Set(studyList.map((i) => i.word));

  return (
    <TwoColumn
      main={
        <>
          <Card>
            {storageError && (
              <p className="placeholder" role="alert">
                Your browser blocked local storage, so your text and study list won’t be kept.
              </p>
            )}
            <label htmlFor="passage" className="visually-hidden">
              Type or paste Japanese text
            </label>
            <textarea
              id="passage"
              lang="ja"
              rows={6}
              placeholder="Type or paste Japanese here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="button-row action-row">
              <button
                type="button"
                className="button button--primary"
                onClick={split}
                disabled={status === 'loading-dictionary' || body.trim() === ''}
              >
                {status === 'loading-dictionary' ? 'Splitting…' : 'Split into words'}
              </button>
              <button
                type="button"
                className="button"
                onClick={clear}
                disabled={status === 'loading-dictionary' || (body === '' && !text)}
              >
                Clear
              </button>
            </div>
            {status === 'loading-dictionary' && (
              <p className="muted" role="status">
                Loading the word splitter (about 17 MB, first time only)…
              </p>
            )}
            {status === 'error' && (
              <p role="alert">Couldn’t load the dictionary. Check your connection and try again.</p>
            )}
          </Card>

          {text && text.lines.length > 0 && (
            <Card>
              <div className="passage" lang="ja">
                {text.lines.map((line, i) => (
                  <p key={i}>
                    {line.map((seg, j) =>
                      seg.kind === 'word' && seg.word ? (
                        <button
                          key={j}
                          type="button"
                          className="word-button"
                          aria-pressed={selected.has(seg.word)}
                          onClick={() => toggleWord(seg)}
                        >
                          {seg.surface}
                        </button>
                      ) : (
                        <span key={j} className="quiet">
                          {seg.surface}
                        </span>
                      ),
                    )}
                  </p>
                ))}
              </div>
            </Card>
          )}
        </>
      }
      side={<StudyListPanel />}
    />
  );
}
