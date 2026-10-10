import type { ReactNode } from 'react';

export default function TwoColumn({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <div className="two-column">
      <div className="two-column__main">{main}</div>
      <aside className="two-column__side">{side}</aside>
    </div>
  );
}
