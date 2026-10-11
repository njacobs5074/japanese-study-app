import { copyFileSync } from 'node:fs';
import { join } from 'node:path';
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

// Production builds are served from a subpath on GitHub Pages
// (https://njacobs5074.github.io/japanese-study-app/). Override with BASE_PATH for another host.
let outDir = 'dist';
const productionBase = process.env.BASE_PATH ?? '/japanese-study-app/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? productionBase : '/',
  plugins: [
    react(),
    {
      // GitHub Pages has no single-page-app fallback, so serve the app shell for unknown paths
      // (deep links and refreshes). The router then shows the right page.
      name: 'spa-404',
      apply: 'build',
      configResolved(config) {
        outDir = config.build.outDir;
      },
      closeBundle() {
        copyFileSync(join(outDir, 'index.html'), join(outDir, '404.html'));
      },
    },
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
}));
