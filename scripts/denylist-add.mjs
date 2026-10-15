#!/usr/bin/env node
//
// Adds names to scripts/denylist.json as salted hashes. Names are read from stdin,
// one per line (never from arguments, which would land in shell history) and are
// never echoed. Prints counts only.
//
// Usage: node scripts/denylist-add.mjs < names.txt
//        [--root <dir>] [--denylist <file>]

import { randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { hashToken, scanTree } from './check-denylist.mjs';

function parseArgs(argv) {
  const opts = { root: process.cwd(), denylist: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') opts.root = resolve(argv[++i]);
    else if (argv[i] === '--denylist') opts.denylist = resolve(argv[++i]);
  }
  opts.denylist ??= join(opts.root, 'scripts', 'denylist.json');
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const raw = JSON.parse(readFileSync(opts.denylist, 'utf8'));
  const min = raw.minTokenLength ?? 3;
  if (!raw.salt) raw.salt = randomBytes(16).toString('hex');

  const input = readFileSync(0, 'utf8');
  const tokens = new Set();
  for (const line of input.split(/\r?\n/)) {
    const parts = (line.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((p) => p.length >= min);
    for (const p of parts) tokens.add(p);
    if (parts.length > 1) tokens.add(parts.join(''));
  }

  const before = new Set(raw.hashes ?? []);
  const added = new Set();
  for (const t of tokens) {
    const h = hashToken(raw.salt, t);
    if (!before.has(h)) added.add(h);
  }
  raw.hashes = [...new Set([...before, ...added])].sort();
  writeFileSync(opts.denylist, `${JSON.stringify(raw, null, 2)}\n`);

  const probe = { salt: raw.salt, minTokenLength: min, hashes: new Set(added) };
  const occurrences = added.size > 0 ? scanTree(opts.root, probe, opts.denylist).length : 0;
  console.log(`tokens read: ${tokens.size}, new hashes: ${added.size}, total entries: ${raw.hashes.length}`);
  if (occurrences > 0) {
    console.log(`warning: ${occurrences} occurrence(s) of added tokens already exist in the current tree; run check:privacy`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
