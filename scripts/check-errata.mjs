#!/usr/bin/env node
// Structural and history checks for ERRATA.md and errata/NNN.md.
//
// Usage: node scripts/check-errata.mjs [--root <dir>] [--base <git-ref>]
// Prints `CODE: detail` lines to stderr and exits 1 on any finding.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TIERS = ['HEAD-JUDGE', 'RULEBOOK', 'CARD-TEXT', 'TRUSTED-CONSENSUS'];
const ENTRY_FILE = /^(\d{3})\.md$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parse the header fields of one entry; absent fields are returned as null. */
export function parseEntry(text) {
  const field = (name) => {
    const m = text.match(new RegExp(`^\\*\\*${name}:\\*\\*[ \\t]*(.*?)[ \\t]*$`, 'm'));
    return m ? m[1] : null;
  };
  return {
    date: field('Date'),
    ruleKey: field('Rule key'),
    tier: field('Authority tier'),
    discussion: field('Discussion'),
  };
}

/** Parse the index table rows of ERRATA.md into cell arrays. */
export function parseIndexRows(text) {
  const rows = [];
  for (const line of text.split('\n')) {
    if (!/^\|\s*\d+\s*\|/.test(line)) continue;
    const cells = line.replace(/^\||\|\s*$/g, '').split('|').map((c) => c.trim());
    rows.push(cells);
  }
  return rows;
}

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

export function check(root, base) {
  const findings = [];
  const add = (code, detail) => findings.push(`${code}: ${detail}`);

  const dir = join(root, 'errata');
  const files = existsSync(dir)
    ? readdirSync(dir).filter((f) => ENTRY_FILE.test(f)).sort()
    : [];
  const numbers = files.map((f) => Number(f.match(ENTRY_FILE)[1]));

  numbers.forEach((n, i) => {
    if (n !== i + 1) add('ERRATA_GAP', `expected entry ${String(i + 1).padStart(3, '0')} but found ${files[i]}`);
  });

  let snapshot = null;
  const snapshotPath = join(root, 'rules', 'rule-key-snapshot.json');
  if (existsSync(snapshotPath)) {
    snapshot = new Set(JSON.parse(readFileSync(snapshotPath, 'utf8')).map((r) => r.ruleKey));
  } else if (files.length > 0) {
    add('ERRATA_SNAPSHOT_MISSING', 'rules/rule-key-snapshot.json is absent but entries exist');
  }

  const discussionsDir = join(root, 'discussions');
  const discussions = new Set(existsSync(discussionsDir) ? readdirSync(discussionsDir) : []);

  const parsed = [];
  let previousDate = null;
  for (const f of files) {
    const e = parseEntry(readFileSync(join(dir, f), 'utf8'));
    parsed.push({ file: f, ...e });
    if (e.date === null || !DATE.test(e.date)) {
      add('ERRATA_BAD_FIELD', `${f}: Date missing or not YYYY-MM-DD`);
    } else {
      if (previousDate !== null && e.date < previousDate) {
        add('ERRATA_DATE_ORDER', `${f}: ${e.date} is earlier than the previous entry (${previousDate})`);
      }
      previousDate = e.date;
    }
    if (!e.ruleKey) {
      add('ERRATA_BAD_FIELD', `${f}: Rule key missing`);
    } else if (snapshot && !snapshot.has(e.ruleKey)) {
      add('ERRATA_UNKNOWN_RULE', `${f}: rule key ${e.ruleKey} is not in the snapshot`);
    }
    if (e.tier === null) {
      add('ERRATA_BAD_FIELD', `${f}: Authority tier missing`);
    } else if (!TIERS.includes(e.tier)) {
      add('ERRATA_UNKNOWN_TIER', `${f}: tier ${e.tier} is not one of ${TIERS.join(', ')}`);
    }
    if (e.discussion === null) {
      add('ERRATA_BAD_FIELD', `${f}: Discussion missing`);
    } else if (e.discussion !== 'none' && !discussions.has(e.discussion)) {
      add('ERRATA_BAD_DISCUSSION', `${f}: discussion ${e.discussion} is not a published file`);
    }
  }

  const indexPath = join(root, 'ERRATA.md');
  const rows = existsSync(indexPath) ? parseIndexRows(readFileSync(indexPath, 'utf8')) : [];
  if (rows.length !== parsed.length) {
    add('ERRATA_INDEX_MISMATCH', `index has ${rows.length} rows but errata/ has ${parsed.length} entries`);
  } else {
    rows.forEach((cells, i) => {
      const p = parsed[i];
      const num = p.file.slice(0, 3);
      const expected = [String(Number(num)), p.date ?? '', p.ruleKey ?? '', p.tier ?? ''];
      const got = [cells[0], cells[1], cells[2], cells[3]];
      const link = cells[4] ?? '';
      const disc = cells[5] ?? '';
      const linkOk = link.includes(`errata/${p.file}`);
      const discOk = disc === (p.discussion ?? '') || disc.includes(p.discussion ?? '\0');
      if (expected.some((v, k) => v !== got[k]) || !linkOk || !discOk) {
        add('ERRATA_INDEX_MISMATCH', `index row ${i + 1} does not match errata/${p.file}`);
      }
    });
  }

  if (base) {
    const status = git(root, ['diff', '--name-status', '--no-renames', base, '--', 'errata']);
    for (const line of status.split('\n').filter(Boolean)) {
      const [st, path] = line.split('\t');
      if (st !== 'A' && ENTRY_FILE.test(path.split('/').pop())) {
        add('ERRATA_MUTATED', `${path} was ${st === 'D' ? 'deleted' : 'modified'} since ${base}`);
      }
    }
    const diff = git(root, ['diff', '-U0', '--no-renames', base, '--', 'ERRATA.md']);
    for (const line of diff.split('\n')) {
      if (line.startsWith('-') && !line.startsWith('---') && line.trim() !== '-') {
        add('ERRATA_INDEX_REWRITTEN', `ERRATA.md line removed since ${base}: ${line.slice(1).trim()}`);
      }
    }
  }

  return { findings, entries: parsed.length };
}

function main(argv) {
  let root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  let base = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root') root = resolve(argv[++i]);
    else if (argv[i] === '--base') base = argv[++i];
    else {
      process.stderr.write(`unknown argument ${argv[i]}\n`);
      return 2;
    }
  }
  const { findings, entries } = check(root, base);
  if (findings.length) {
    process.stderr.write(findings.join('\n') + '\n');
    return 1;
  }
  process.stdout.write(`errata ok (${entries} entries)\n`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
