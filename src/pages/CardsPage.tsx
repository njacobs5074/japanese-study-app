import { Link } from 'react-router-dom';
import Card from '../components/Card';
import TwoColumn from '../components/TwoColumn';
import { fixtureWords } from '../data/fixtures';

export default function CardsPage() {
  const [current, ...rest] = fixtureWords;
  return (
    <TwoColumn
      main={
        <Card>
          <p className="muted">Front</p>
          <p lang="ja" style={{ fontSize: '4rem', margin: '0.5rem 0' }}>
            {current.word}
          </p>
          <button type="button" className="button button--primary" disabled>
            Show reading and meaning
          </button>
          <p className="placeholder">Flip, stroke diagrams, and grading arrive in milestone 2.</p>
        </Card>
      }
      side={
        <Card title="Queue">
          <ul className="word-list">
            <li>
              <span className="muted">Now</span>
              <span lang="ja">{current.word}</span>
            </li>
            {rest.map((e) => (
              <li key={e.word}>
                <span className="muted">Next</span>
                <span lang="ja">{e.word}</span>
              </li>
            ))}
          </ul>
          <Link to={`/sentences/${encodeURIComponent(current.word)}`}>
            Drill this word in sentences
          </Link>
        </Card>
      }
    />
  );
}
