import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { fixtureWords } from '../data/fixtures';

export default function StudyListPanel() {
  return (
    <Card title={`Study list (${fixtureWords.length})`}>
      <ul className="word-list">
        {fixtureWords.map((e) => (
          <li key={e.word}>
            <span className="word" lang="ja">
              {e.word}
            </span>
            <span lang="ja">{e.kana}</span>
            <span className="muted">{e.gloss}</span>
          </li>
        ))}
      </ul>
      <div className="button-row">
        <Link to="/cards" className="button button--primary">
          Study these as cards
        </Link>
        <Link to={`/sentences/${encodeURIComponent(fixtureWords[0].word)}`} className="button">
          Drill them in sentences
        </Link>
      </div>
    </Card>
  );
}
