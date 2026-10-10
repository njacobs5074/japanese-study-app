import type { JlptLevel } from '../data/types';

export default function JlptBadge({ level }: { level: JlptLevel }) {
  return (
    <span className="jlpt-badge" title="Unofficial JLPT level">
      {level}
    </span>
  );
}
