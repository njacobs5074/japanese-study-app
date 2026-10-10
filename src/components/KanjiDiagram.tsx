import { useEffect, useState } from 'react';
import { fixtureJlptLevels } from '../data/fixtures';
import { dictionary } from '../data/jmdict';
import type { KanjiInfo } from '../data/types';
import { loadKanji } from '../lib/kanjiLoader';
import type { KanjiStrokes } from '../lib/kanjivg';
import JlptBadge from './JlptBadge';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; kanji: KanjiStrokes };

export default function KanjiDiagram({ char }: { char: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [info, setInfo] = useState<KanjiInfo | undefined>();

  useEffect(() => {
    let cancelled = false;
    dictionary.kanjiInfo(char).then(
      (i) => !cancelled && setInfo(i),
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, [char]);

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    loadKanji(char).then(
      (kanji) => !cancelled && setState({ status: 'ready', kanji }),
      () => !cancelled && setState({ status: 'error' }),
    );
    return () => {
      cancelled = true;
    };
  }, [char]);

  const level = fixtureJlptLevels.forKanji(char);
  const strokeCount = state.status === 'ready' ? state.kanji.paths.length : undefined;

  return (
    <figure className="kanji-figure">
      {state.status === 'ready' ? (
        <svg
          className="kanji-svg"
          viewBox="0 0 109 109"
          role="img"
          aria-label={`Stroke order for ${char}, ${state.kanji.paths.length} strokes`}
        >
          <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {state.kanji.paths.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          <g fill="var(--accent)" fontSize="8" fontFamily="var(--font-body)" fontWeight="700">
            {state.kanji.numbers.map((n) => (
              <text key={n.n} x={n.x} y={n.y}>
                {n.n}
              </text>
            ))}
          </g>
        </svg>
      ) : (
        <div className="kanji-svg kanji-svg--empty muted">
          {state.status === 'loading' ? 'Loading…' : 'Diagram unavailable'}
        </div>
      )}
      <figcaption>
        <span lang="ja" className="kanji-char">
          {char}
        </span>{' '}
        {level && <JlptBadge level={level} />}
        <dl className="kanji-facts">
          {info && (
            <>
              <dt>On</dt>
              <dd lang="ja">{info.onyomi.join('、') || '—'}</dd>
              <dt>Kun</dt>
              <dd lang="ja">{info.kunyomi.join('、') || '—'}</dd>
              <dt>Meaning</dt>
              <dd>{info.meaning}</dd>
            </>
          )}
          {strokeCount !== undefined && (
            <>
              <dt>Strokes</dt>
              <dd>{strokeCount}</dd>
            </>
          )}
        </dl>
      </figcaption>
    </figure>
  );
}
