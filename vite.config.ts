import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Content-Security-Policy, added to production builds as a <meta> tag (the dev server needs
// inline scripts and a websocket for hot reload, so it is left without one).
// A meta tag cannot set frame-ancestors; set that as a response header on the host if needed.
const csp = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  // Our own files, Tatoeba sentence search, and KanjiVG stroke diagrams.
  "connect-src 'self' https://api.tatoeba.org https://raw.githubusercontent.com",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'csp-meta',
      apply: 'build',
      transformIndexHtml: () => [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: csp },
          injectTo: 'head-prepend',
        },
      ],
    },
  ],
});
