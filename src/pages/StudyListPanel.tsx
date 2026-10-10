import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { shortGloss } from '../data/jmdict';
import { useStudy } from '../state/StudyContext';

export default function StudyListPanel() {
  const { studyList, removeWord, dictionaryError } = useStudy();
  const empty = studyList.length === 0;

  return (
    <Card title={`Study list (${studyList.length})`}>
      {empty ? (
        <p className="muted">Tap words in the text to add them here.</p>
      ) : (
        <ul className="word-list">
          {studyList.map((item) => (
            <li key={item.word}>
              <span className="word" lang="ja">
                {item.word}
              </span>
              <span lang="ja">{item.kana !== item.word ? item.kana : ''}</span>
              <span className="muted study-gloss">
                {item.gloss ? shortGloss(item.gloss) : item.lookedUp ? 'No definition found' : dictionaryError ? '' : 'Looking up…'}
              </span>
              <button
                type="button"
                className="icon-button"
                onClick={() => removeWord(item.word)}
                aria-label={`Remove ${item.word} from the study list`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {dictionaryError && (
        <p className="muted" role="alert">
          Definitions are unavailable: the dictionary could not be loaded.
        </p>
      )}
      <div className="button-row">
        {empty ? (
          <>
            <button type="button" className="button button--primary" disabled>
              Study these as cards
            </button>
            <button type="button" className="button" disabled>
              Drill them in sentences
            </button>
          </>
        ) : (
          <>
            <Link to="/cards" className="button button--primary">
              Study these as cards
            </Link>
            <Link to="/sentences" className="button">
              Drill them in sentences
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}
