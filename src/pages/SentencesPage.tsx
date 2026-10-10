import { Link, useParams } from 'react-router-dom';
import Card from '../components/Card';
import { fixtureDictionary } from '../data/fixtures';

export default function SentencesPage() {
  const { word } = useParams();
  const entry = word ? fixtureDictionary.lookup(word) : undefined;

  return (
    <Card title="Sentences">
      {word ? (
        <p>
          Target word: <strong lang="ja">{word}</strong>
          {entry && <span className="muted"> — {entry.gloss}</span>}
        </p>
      ) : (
        <p>
          Pick a word from the <Link to="/text">study list</Link> to drill.
        </p>
      )}
      <button type="button" className="button button--primary" disabled>
        Show reading and translation
      </button>{' '}
      <button type="button" className="button" disabled>
        Next sentence
      </button>
      <p className="placeholder">The Tatoeba client and attribution line arrive in milestone 3.</p>
    </Card>
  );
}
