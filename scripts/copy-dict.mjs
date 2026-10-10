// Copies the kuromoji dictionary into public/ so it is served from our own origin.
import { cpSync, mkdirSync } from 'node:fs';

const from = 'node_modules/@patdx/kuromoji/dict';
const to = 'public/kuromoji-dict';
mkdirSync(to, { recursive: true });
cpSync(from, to, { recursive: true });
console.log(`Copied kuromoji dictionary to ${to}`);
