// Generates TypeScript types for the Tatoeba API from its OpenAPI spec.
// Output: src/lib/tatoeba-api.d.ts (committed; re-run this script to refresh it).
// The generator is pinned and run through npx because its peer dependency (TypeScript 5)
// does not match this project's TypeScript version.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const SPEC_URL = 'https://api.tatoeba.org/openapi.json';
const SPEC = '.cache/tatoeba-openapi.json';
const OUT = 'src/lib/tatoeba-api.d.ts';

const res = await fetch(SPEC_URL);
if (!res.ok) throw new Error(`Failed to fetch ${SPEC_URL} (${res.status})`);
mkdirSync('.cache', { recursive: true });
writeFileSync(SPEC, Buffer.from(await res.arrayBuffer()));

execFileSync('npx', ['--yes', 'openapi-typescript@7.13.0', SPEC, '-o', OUT], { stdio: 'inherit' });
