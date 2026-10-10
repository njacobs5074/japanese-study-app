import { useEffect, useState } from 'react';
import Card from '../components/Card';
import TwoColumn from '../components/TwoColumn';
import { loadTokenizer, segmentText } from '../lib/tokenizer';
import { useStudy } from '../state/StudyContext';
import StudyListPanel from './StudyListPanel';

type Status = 'idle' | 'loading-dictionary' | 'error';

export default function TextPage() {
  const { loaded, storageError, text, studyList, saveText, toggleWord } = useStudy();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [seeded, setSeeded] = useState(false);

  // Fill the form from the saved text once, after it has loaded from IndexedDB.
  useEffect(() => {
    if (loaded && !seeded) {
      setTitle(text?.title ?? '');
      setBody(text?.body ?? '');
      setSeeded(true);
    }
  }, [loaded, seeded, text]);

  async function split() {
    setStatus('loading-dictionary');
    try {
      const tokenizer = await loadTokenizer();
      const lines = segmentText(tokenizer, body);
      saveText({ title: title.trim(), body, lines });
      setStatus('idle');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  }

  const selected = new Set(studyList.map((i) => i.word));

  return (
    <TwoColumn
      main={
        <>
          <Card title="Text">
            {storageError && (
              <p className="placeholder" role="alert">
                Your browser blocked local storage, so your text and study list won’t be kept.
              </p>
            )}
            <label htmlFor="title">Title (shown in the header)</label>
            <input
              id="title"
              className="text-input"
              lang="ja"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label htmlFor="passage" className="field-label">
              Paste a passage
            </label>
            <textarea
              id="passage"
              lang="ja"
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p>
              <button
                type="button"
                className="button button--primary"
                onClick={split}
                disabled={status === 'loading-dictionary' || body.trim() === ''}
              >
                {status === 'loading-dictionary' ? 'Splitting…' : 'Split into words'}
              </button>
            </p>
            {status === 'loading-dictionary' && (
              <p className="muted" role="status">
                Loading the Japanese dictionary (about 17 MB, first time only)…
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
