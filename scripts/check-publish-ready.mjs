#!/usr/bin/env node
//
// Publish-readiness check. Intentionally not part of `ci`: CI must be green on the
// private repository before the placeholders are filled in.
//
// Fails with a named code for each unmet condition.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Built by concatenation so this file does not contain the tokens it searches for.
const EMAIL_TOKEN = 'TAKEDOWN_EMAIL_' + 'PLACEHOLDER';
const HOLDER_TOKEN = 'COPYRIGHT_HOLDER_' + 'PLACEHOLDER';

const codes = [];

const files = execFileSync(
  'git',
  ['-C', root, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);

let emailHit = false;
let holderHit = false;
for (const f of files) {
  const abs = join(root, f);
  try {
    if (statSync(abs).size > 1024 * 1024) continue;
    const buf = readFileSync(abs);
    if (buf.includes(0)) continue;
    const text = buf.toString('utf8');
    if (text.includes(EMAIL_TOKEN)) emailHit = true;
    if (text.includes(HOLDER_TOKEN)) holderHit = true;
  } catch {
    // deleted from the working tree but still listed: ignore
  }
}
if (emailHit) codes.push('PLACEHOLDER_TAKEDOWN_EMAIL');
if (holderHit) codes.push('PLACEHOLDER_COPYRIGHT_HOLDER');

for (const required of ['LICENSE', 'NOTICE.md', 'CONTRIBUTING.md', 'README.md']) {
  if (!existsSync(join(root, required))) codes.push(`MISSING_FILE:${required}`);
}

const contributing = join(root, 'CONTRIBUTING.md');
if (existsSync(contributing)) {
  const text = readFileSync(contributing, 'utf8');
  const hasEmail = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(text);
  if (!hasEmail || !/takedown/i.test(text) || !text.includes('72')) codes.push('NO_TAKEDOWN_PATH');
}

const denylist = join(root, 'scripts', 'denylist.json');
let hashCount = 0;
try {
  hashCount = (JSON.parse(readFileSync(denylist, 'utf8')).hashes ?? []).length;
} catch {
  hashCount = 0;
}
if (hashCount === 0) codes.push('DENYLIST_EMPTY');

if (codes.length > 0) {
  for (const c of codes) console.error(c);
  console.error(`publish-ready: NOT READY (${codes.length})`);
  process.exit(1);
}
console.log('publish-ready: ok');
