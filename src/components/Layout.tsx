import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useStudy } from '../state/StudyContext';

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

const SunIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg {...iconProps}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </svg>
);

/** Header label for the current text: its first line, shortened. */
function textLabel(body: string | undefined): string | undefined {
  const first = body?.split(/\r?\n/).find((l) => l.trim() !== '')?.trim();
  if (!first) return undefined;
  const chars = [...first];
  return chars.length > 16 ? `${chars.slice(0, 16).join('')}…` : first;
}

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export default function Layout() {
  const { text } = useStudy();
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Storage unavailable (e.g. private mode): the choice just won't persist.
    }
    setTheme(next);
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <Link to="/text" className="site-title" lang="ja">
            日本語を勉強しましょう！
          </Link>
          <nav aria-label="Main">
            <NavLink to="/text">Text</NavLink>
            <NavLink to="/cards">Cards</NavLink>
            <NavLink to="/sentences">Sentences</NavLink>
          </nav>
          <p className="studying">
            Studying: {textLabel(text?.body) ? <span lang="ja">{textLabel(text?.body)}</span> : 'no text yet'}
          </p>
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <footer className="site-footer">
        <NavLink to="/about">About</NavLink>
      </footer>
    </>
  );
}
