import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Attribution from '../components/Attribution';
import Card from '../components/Card';
import { useStudy } from '../state/StudyContext';
import { getSentences } from '../lib/sentenceService';
import { splitOnWord, type Sentence } from '../lib/tatoeba';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; sentences: Sentence[] };

export default function SentencesPage() {
  const { word } = useParams();
  const { studyList } = useStudy();

  if (!word) {
    return (
      <Card title="Sentences">
        {studyList.length === 0 ? (
          <p>
            Your study list is empty. <Link to="/text">Add words from your text</Link> first.
          </p>
        ) : (
          <p>Pick a word to drill:</p>
        )}
        <ul className="word-list">
          {studyList.map((e) => (
            <li key={e.word}>
              <Link to={`/sentences/${encodeURIComponent(e.word)}`} lang="ja">
                {e.word}
              </Link>
              <span className="muted">{e.gloss}</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  }
  return <Drill key={word} word={word} />;
}

function Drill({ word }: { word: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { studyList } = useStudy();
  const entry = studyList.find((i) => i.word === word);

  const load = useCallback(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    getSentences(word, controller.signal).then(
      (sentences) => setState({ status: 'ready', sentences }),
      (e) => !controller.signal.aborted && (console.error(e), setState({ status: 'error' })),
    );
    return () => controller.abort();
  }, [word]);

  // `attempt` re-runs the load when the user presses Retry.
  useEffect(load, [load, attempt]);

  const next = (count: number) => {
    setIndex((i) => (i + 1) % count);
    setRevealed(false);
  };

  return (
    <Card>
      <h1 className="drill-title">
        Sentences for <span lang="ja">{word}</span>
        {entry && <span className="muted"> — {entry.gloss}</span>}
      </h1>

      {state.status === 'loading' && <p className="muted">Loading sentences from Tatoeba…</p>}

      {state.status === 'error' && (
        <>
          <p role="alert">Couldn’t load sentences. Check your connection and try again.</p>
          <button type="button" className="button" onClick={() => setAttempt((a) => a + 1)}>
            Retry
          </button>
        </>
      )}

      {state.status === 'ready' && state.sentences.length === 0 && (
        <p>No example sentences with an English translation were found for this word.</p>
      )}

      {state.status === 'ready' && state.sentences.length > 0 && (
        <SentenceView
          word={word}
          sentence={state.sentences[index % state.sentences.length]}
          position={`${(index % state.sentences.length) + 1} / ${state.sentences.length}`}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          onNext={() => next(state.sentences.length)}
        />
      )}
    </Card>
  );
}

function SentenceView(props: {
  word: string;
  sentence: Sentence;
  position: string;
  revealed: boolean;
  onReveal: () => void;
  onNext: () => void;
}) {
  const { word, sentence, position, revealed, onReveal, onNext } = props;
  return (
    <div>
      <p className="sentence" lang="ja">
        {splitOnWord(sentence.text, word).map((part, i) =>
          part.match ? (
            <mark key={i} className="target-word">
              {part.text}
            </mark>
          ) : (
            part.text
          ),
        )}
      </p>
      <Attribution item={sentence} label="Sentence" />

      {revealed && (
        <div className="reveal">
          {sentence.reading && (
            <p className="sentence-reading" lang="ja">
              {sentence.reading}
            </p>
          )}
          {sentence.translation ? (
            <>
              <p className="translation">{sentence.translation.text}</p>
              <Attribution item={sentence.translation} label="Translation" />
            </>
          ) : (
            <p className="muted">No English translation available.</p>
          )}
        </div>
      )}

      <div className="button-row">
        {!revealed && (
          <button type="button" className="button button--primary" onClick={onReveal}>
            Show reading and translation
          </button>
        )}
        <button type="button" className={revealed ? 'button button--primary' : 'button'} onClick={onNext}>
          Next sentence
        </button>
        <span className="muted position">{position}</span>
      </div>
    </div>
  );
}
