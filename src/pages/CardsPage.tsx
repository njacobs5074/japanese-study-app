import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import JlptBadge from '../components/JlptBadge';
import KanjiDiagram from '../components/KanjiDiagram';
import TwoColumn from '../components/TwoColumn';
import { jlptLevels } from '../data/jlpt';
import { useStudy } from '../state/StudyContext';
import { getAllReviews, putReview } from '../lib/db';
import { kanjiChars } from '../lib/kanjivg';
import { buildQueue } from '../lib/queue';
import { newReview, schedule, type Grade, type ReviewRecord } from '../lib/scheduling';

const GRADES: { grade: Grade; label: string }[] = [
  { grade: 'again', label: 'Again' },
  { grade: 'hard', label: 'Hard' },
  { grade: 'good', label: 'Good' },
  { grade: 'easy', label: 'Easy' },
];

const STATUS_LABEL = { now: 'Now', next: 'Next', queued: 'Queued' } as const;

export default function CardsPage() {
  const { studyList, loaded, dictionaryError } = useStudy();
  const words = useMemo(() => studyList.map((i) => i.word), [studyList]);
  const [reviews, setReviews] = useState<Map<string, ReviewRecord> | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAllReviews().then(setReviews, () => {
      setError(true);
      setReviews(new Map());
    });
  }, []);

  if (!reviews || !loaded) return <Card>Loading…</Card>;

  if (studyList.length === 0) {
    return (
      <Card title="No words yet">
        <p>
          Your study list is empty. <Link to="/text">Add words from your text</Link> to study them as
          cards.
        </p>
      </Card>
    );
  }

  const queue = buildQueue(words, reviews, now);
  const current = queue.find((i) => i.status === 'now');
  const entry = current && studyList.find((i) => i.word === current.word);
  const badges = current
    ? kanjiChars(current.word).flatMap((c) => {
        const level = jlptLevels.forKanji(c);
        return level ? [[c, level] as const] : [];
      })
    : [];
  const nextDue = queue.length ? Math.min(...queue.map((i) => i.dueAt)) : undefined;

  async function grade(g: Grade) {
    if (!current) return;
    const at = Date.now();
    const updated = schedule(reviews!.get(current.word) ?? newReview(current.word), g, at);
    setReviews(new Map(reviews!).set(current.word, updated));
    setNow(at);
    setRevealed(false);
    try {
      await putReview(updated);
    } catch {
      setError(true);
    }
  }

  return (
    <TwoColumn
      main={
        <Card>
          {error && (
            <p className="placeholder" role="alert">
              Progress could not be saved in this browser.
            </p>
          )}
          {current && entry ? (
            <>
              <p className="word-front" lang="ja">
                {current.word}
              </p>
              {badges.length > 0 && (
                <p className="badge-row">
                  {badges.map(([c, level]) => (
                    <span key={c}>
                      <span lang="ja">{c}</span> <JlptBadge level={level} />
                    </span>
                  ))}
                </p>
              )}
              {!revealed ? (
                <button type="button" className="button button--primary" onClick={() => setRevealed(true)}>
                  Show reading and meaning
                </button>
              ) : (
                <>
                  <p className="reading" lang="ja">
                    {entry.kana}
                  </p>
                  <p className="meaning">
                    {entry.gloss ?? (
                      <span className="muted">
                        {entry.lookedUp
                          ? 'No definition found.'
                          : dictionaryError
                            ? 'Definition unavailable: the dictionary could not be loaded.'
                            : 'Looking up definition…'}
                      </span>
                    )}
                  </p>
                  <div className="kanji-grid">
                    {kanjiChars(current.word).map((c) => (
                      <KanjiDiagram key={c} char={c} />
                    ))}
                  </div>
                  <div className="button-row" role="group" aria-label="How well did you remember it?">
                    {GRADES.map(({ grade: g, label }) => (
                      <button key={g} type="button" className="button" onClick={() => grade(g)}>
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <h2>All caught up</h2>
              <p className="muted">
                No cards are due.
                {nextDue ? ` Next review: ${new Date(nextDue).toLocaleString()}.` : ''}
              </p>
            </>
          )}
        </Card>
      }
      side={
        <Card title="Queue">
          <ul className="word-list">
            {queue.map((item) => (
              <li key={item.word}>
                <span className="muted">{STATUS_LABEL[item.status]}</span>
                <span lang="ja">{item.word}</span>
              </li>
            ))}
          </ul>
          {current && (
            <Link to={`/sentences/${encodeURIComponent(current.word)}`}>
              Drill this word in sentences
            </Link>
          )}
        </Card>
      }
    />
  );
}
