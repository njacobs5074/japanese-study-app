import Card from '../components/Card';
import TwoColumn from '../components/TwoColumn';
import { fixtureText } from '../data/fixtures';
import StudyListPanel from './StudyListPanel';

export default function TextPage() {
  return (
    <TwoColumn
      main={
        <Card title="Text">
          <label htmlFor="passage">Paste a passage</label>
          <textarea id="passage" lang="ja" rows={6} defaultValue={fixtureText.body} disabled />
          <p>
            <button type="button" className="button button--primary" disabled>
              Split into words
            </button>
          </p>
          <p className="placeholder">Tokenizing and tap-to-add arrive in milestone 4.</p>
        </Card>
      }
      side={<StudyListPanel />}
    />
  );
}
