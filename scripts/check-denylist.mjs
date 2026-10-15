#!/usr/bin/env node
//
// Member and head-judge denylist check. The denylist stores only salted sha256
// hashes of lowercased name tokens, so anyone (a fork, a pull request, CI) can
// run this with no secret. Findings print a location and DENYLIST_HIT, never the
// matched token.
//
// Usage: node scripts/check-denylist.mjs [--root <dir>] [--denylist <file>] [--history]

import { createHash } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import { readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const MAX_FILE_BYTES = 1024 * 1024;
const MAX_PIECES = 8;

export function hashToken(salt, token) {
  return createHash('sha256').update(`${salt}:${token}`).digest('hex');
}

/**
 * Candidate tokens of a text: lowercased runs of letters and digits, the pieces of
 * each run split at case boundaries, and every contiguous join of those pieces.
 */
export function tokensOf(text) {
  const out = new Set();
  for (const run of text.match(/[A-Za-z0-9]+/g) ?? []) {
    out.add(run.toLowerCase());
    const pieces = run.match(/[A-Z]+(?![a-z])|[A-Z]?[a-z]+|[0-9]+/g) ?? [];
    if (pieces.length < 2) continue;
    const lowered = pieces.slice(0, MAX_PIECES).map((p) => p.toLowerCase());
    for (let i = 0; i < lowered.length; i++) {
      let joined = '';
      for (let j = i; j < lowered.length; j++) {
        joined += lowered[j];
        out.add(joined);
      }
    }
  }
  return [...out];
}

export function loadDenylist(file) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  return {
    salt: raw.salt ?? '',
    minTokenLength: raw.minTokenLength ?? 3,
    hashes: new Set(raw.hashes ?? []),
  };
}

function makeMatcher(list) {
  const memo = new Map();
  return (text) => {
    for (const token of tokensOf(text)) {
      if (token.length < list.minTokenLength) continue;
      let h = memo.get(token);
      if (h === undefined) {
        h = hashToken(list.salt, token);
        memo.set(token, h);
      }
      if (list.hashes.has(h)) return true;
    }
    return false;
  };
}

export function scanTree(root, list, denylistFile) {
  const hit = makeMatcher(list);
  const findings = [];
  const skip = denylistFile ? relative(root, resolve(denylistFile)) : null;
  const names = execFileSync(
    'git',
    ['-C', root, 'ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { encoding: 'utf8', maxBuffer: 1 << 28 },
  )
    .split('\0')
    .filter(Boolean);
  for (const name of names) {
    if (name === skip) continue;
    if (hit(name)) findings.push(`${name}:name`);
    let buf;
    try {
      const abs = join(root, name);
      if (statSync(abs).size > MAX_FILE_BYTES) continue;
      buf = readFileSync(abs);
    } catch {
      continue;
    }
    if (buf.includes(0)) continue;
    const lines = buf.toString('utf8').split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (hit(lines[i])) findings.push(`${name}:${i + 1}`);
    }
  }
  return findings;
}

export function scanHistory(root, list) {
  const hit = makeMatcher(list);
  const findings = [];
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      'git',
      [
        '-C', root, 'log', '--all', '-p', '-U0', '--no-color',
        '--format=@@@COMMIT@@@%H%n%an%n%ae%n%cn%n%ce%n%B@@@DIFF@@@',
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    );
    child.on('error', reject);
    let region = 'none';
    let commit = '';
    let file = '';
    let line = 0;
    let headerHit = false;
    const rl = createInterface({ input: child.stdout, crlfDelay: Infinity });
    rl.on('line', (text) => {
      if (text.startsWith('@@@COMMIT@@@')) {
        commit = text.slice('@@@COMMIT@@@'.length).slice(0, 7);
        region = 'header';
        headerHit = false;
        file = '';
        return;
      }
      if (region === 'header') {
        const end = text.indexOf('@@@DIFF@@@');
        const chunk = end === -1 ? text : text.slice(0, end);
        if (!headerHit && hit(chunk)) {
          headerHit = true;
          findings.push(`commit ${commit} (author, committer or message)`);
        }
        if (end !== -1) region = 'diff';
        return;
      }
      if (region !== 'diff') return;
      if (text.startsWith('+++ ')) {
        file = text.slice(4).replace(/^b\//, '');
        if (hit(file)) findings.push(`commit ${commit} ${file}:name`);
        return;
      }
      if (text.startsWith('--- ') || text.startsWith('diff --git')) return;
      const m = /^@@ -\S+ \+(\d+)/.exec(text);
      if (m) {
        line = Number(m[1]) - 1;
        return;
      }
      if (text.startsWith('+')) {
        line += 1;
        if (hit(text.slice(1))) findings.push(`commit ${commit} ${file}:${line}`);
      } else if (text.startsWith('-') && hit(text.slice(1))) {
        findings.push(`commit ${commit} ${file}:removed`);
      }
    });
    rl.on('close', () => resolvePromise(findings));
  });
}

function parseArgs(argv) {
  const opts = { root: process.cwd(), denylist: null, history: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') opts.root = resolve(argv[++i]);
    else if (argv[i] === '--denylist') opts.denylist = resolve(argv[++i]);
    else if (argv[i] === '--history') opts.history = true;
  }
  opts.denylist ??= join(opts.root, 'scripts', 'denylist.json');
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const list = loadDenylist(opts.denylist);
  console.log(`denylist entries: ${list.hashes.size}`);
  if (list.hashes.size === 0) return 0;
  const findings = opts.history ? await scanHistory(opts.root, list) : scanTree(opts.root, list, opts.denylist);
  for (const f of findings) console.log(`DENYLIST_HIT ${f}`);
  if (findings.length > 0) {
    console.error(`denylist: ${findings.length} finding(s)`);
    return 1;
  }
  console.log(`denylist ${opts.history ? 'history' : 'tree'} check ok`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then(
    (code) => process.exit(code),
    (err) => {
      console.error(err.message);
      process.exit(2);
    },
  );
}
