#!/usr/bin/env node
// Structural and privacy checks for the published discussions.
//
// Usage: node scripts/check-discussions.mjs [--root <dir>] [--self-test]
// Prints `CODE: file: detail` lines to stderr and exits 1 on any finding.
// Plain Node, no dependencies.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PUBLISHED_NUMBERS = ['01', '02', '03', '04', '05', '06', '07', '09', '10'];
export const PUBLIC_MARKS = ['RESOLVED', 'HEAD-JUDGE', 'CONSENSUS', 'ESCALATE', 'ESCALATE-OPEN'];
export const HEADINGS = [
  'The question',
  'Positions',
  'What the head judge said',
  'Verdict',
  'Rulebook check',
  'Scripts and engine',
];

const DISCUSSION_FILE = /^(\d{2})-[a-z0-9-]+\.md$/;
const BOARD_NAME = '00-README.md';
// Three digits, then one or more dot-separated alphanumeric groups (303.2.a.4).
// Not preceded by a word character, dot or hyphen so dates, versions and card numbers are skipped.
const RULE_TOKEN = /(?<![\w.-])\d{3}(?:\.[A-Za-z0-9]+)+(?![\w])/g;
const SENDER_ID = /`\d{4,}`/;
const CURLY_LONG_QUOTE = /“[^”\n]{60,}”/;
const QUOTED_LIMIT = 60;

/** True when a double-quoted span of 60+ characters exists; straight quotes are paired in order per line. */
export function hasLongQuote(text) {
  if (CURLY_LONG_QUOTE.test(text)) return true;
  for (const line of text.split('\n')) {
    const parts = line.split('"');
    if (parts.length % 2 === 0) continue;
    for (let i = 1; i < parts.length; i += 2) if (parts[i].length >= QUOTED_LIMIT) return true;
  }
  return false;
}
const PERSON_WORDS = /\b(sender|whatsapp)\b/i;
const PHONE_LIKE = /\+\d{8,}|\b\d{9,}\b|\b\d{3,4}[ -]\d{3,4}[ -]\d{3,5}\b/;

/** Parse the board table rows into `{ number, file, status }`. */
export function parseBoard(text) {
  const rows = [];
  for (const line of text.split('\n')) {
    if (!/^\|\s*\d+\s*\|/.test(line)) continue;
    const cells = line.replace(/^\||\|\s*$/g, '').split('|').map((c) => c.trim());
    rows.push({ number: cells[0].padStart(2, '0'), file: cells[1], status: cells[2] });
  }
  return rows;
}

/** First whitespace-delimited token of a status cell. */
function firstToken(s) {
  return (s ?? '').trim().split(/\s+/)[0] ?? '';
}

/**
 * Check one set of published files.
 * @param {Record<string,string>} files name -> text, including the board file
 * @param {{number:string,file:string,status:string}[]} board parsed board rows
 * @param {Set<string>|string[]} snapshotKeys known rule keys
 * @returns {{code:string,file:string,detail:string}[]}
 */
export function checkDiscussions(files, board, snapshotKeys) {
  const keys = snapshotKeys instanceof Set ? snapshotKeys : new Set(snapshotKeys);
  const out = [];
  const add = (code, file, detail) => out.push({ code, file, detail });

  // File set: the board plus exactly the published numbers.
  const names = Object.keys(files);
  const seenNumbers = new Set();
  for (const name of names) {
    if (name === BOARD_NAME) continue;
    const m = name.match(DISCUSSION_FILE);
    if (!m || !PUBLISHED_NUMBERS.includes(m[1])) {
      add('DISC_FILE_SET', name, 'file is not part of the published set (00 plus 01-07, 09, 10)');
      continue;
    }
    if (seenNumbers.has(m[1])) add('DISC_FILE_SET', name, `duplicate number ${m[1]}`);
    seenNumbers.add(m[1]);
  }
  if (!names.includes(BOARD_NAME)) add('DISC_FILE_SET', BOARD_NAME, 'board file missing');
  for (const n of PUBLISHED_NUMBERS) {
    if (!seenNumbers.has(n)) add('DISC_FILE_SET', `${n}-*`, `published discussion ${n} missing`);
  }

  for (const name of names) {
    const text = files[name];
    const lines = text.split('\n');

    // Privacy detectors apply to every file, including the board.
    if (SENDER_ID.test(text)) add('DISC_SENDER_ID', name, 'backticked numeric identifier');
    if (hasLongQuote(text)) add('DISC_LONG_QUOTE', name, 'quoted span of 60+ characters');
    if (PERSON_WORDS.test(text)) add('DISC_PERSON_ROLE', name, 'mentions sender or the chat application');
    if (PHONE_LIKE.test(text)) add('DISC_PERSON_ROLE', name, 'phone-like digit run');
    for (const token of new Set(text.match(RULE_TOKEN) ?? [])) {
      if (!keys.has(token)) add('DISC_RULE_UNKNOWN', name, `rule key ${token} is not in the snapshot`);
    }

    if (name === BOARD_NAME || !DISCUSSION_FILE.test(name)) continue;

    // Status line.
    const status = lines[2] ?? '';
    const sm = status.match(/^\*\*Status: ([A-Z-]+)(?:[ :(].*)?\*\*$/);
    const mark = sm ? sm[1] : null;
    if (!mark || !PUBLIC_MARKS.includes(mark)) {
      add('DISC_STATUS_LINE', name, `line 3 must be "**Status: MARK ...**" with a public mark, got: ${status.slice(0, 60)}`);
    }

    // Board agreement.
    const number = name.slice(0, 2);
    const row = board.find((r) => r.number === number);
    if (!row) add('DISC_BOARD_MISMATCH', name, 'no board row for this discussion');
    else {
      if (row.file !== name) add('DISC_BOARD_MISMATCH', name, `board row names ${row.file}`);
      if (mark && firstToken(row.status) !== mark) {
        add('DISC_BOARD_MISMATCH', name, `board says ${firstToken(row.status)}, file says ${mark}`);
      }
    }

    // Blockquote: exactly one, and it is the source note.
    const quotes = lines.filter((l) => l.startsWith('>'));
    if (quotes.length > 1) add('DISC_BLOCKQUOTE', name, `${quotes.length} blockquote lines, expected 1`);
    const note = quotes[0];
    if (!note || !/source note/i.test(note) || !/private/i.test(note)) {
      add('DISC_SOURCE_NOTE', name, 'missing blockquote containing "Source note" and "private"');
    }

    // Headings.
    const headings = lines.filter((l) => l.startsWith('## ')).map((l) => l.slice(3).trim());
    if (headings.join('|') !== HEADINGS.join('|')) {
      add('DISC_HEADINGS', name, `headings are [${headings.join(', ')}]`);
    }
  }
  return out;
}

function loadSnapshotKeys(root) {
  const arr = JSON.parse(readFileSync(join(root, 'rules', 'rule-key-snapshot.json'), 'utf8'));
  return new Set(arr.map((e) => e.ruleKey));
}

function loadFiles(root) {
  const dir = join(root, 'discussions');
  const files = {};
  for (const name of readdirSync(dir)) {
    if (name.endsWith('.md')) files[name] = readFileSync(join(dir, name), 'utf8');
  }
  return files;
}

const CLEAN_DISCUSSION = [
  '# 01 - Title',
  '',
  '**Status: RESOLVED (rulebook)**',
  '',
  '> Source note: L<n> citations refer to a private chat export.',
  '',
  ...HEADINGS.flatMap((h) => [`## ${h}`, 'Paraphrase citing 303.2.a.4 on 2026-09-24 under v1.03, see L12769 and SP01-043.', '']),
].join('\n');

function sampleFiles(extra, replaceFirst) {
  const files = { [BOARD_NAME]: '# Discussions\n' };
  for (const n of PUBLISHED_NUMBERS) files[`${n}-x.md`] = CLEAN_DISCUSSION.replace('# 01', `# ${n}`);
  if (replaceFirst) files['01-x.md'] = replaceFirst;
  return { ...files, ...extra };
}

function sampleBoard(status = 'RESOLVED (rulebook)') {
  return PUBLISHED_NUMBERS.map((n) => ({ number: n, file: `${n}-x.md`, status }));
}

function selfTest() {
  const keys = new Set(['303.2.a.4']);
  const run = (files, board = sampleBoard()) => checkDiscussions(files, board, keys).map((v) => v.code);
  const cases = [
    ['clean', run(sampleFiles({})), null],
    ['DISC_FILE_SET', run(sampleFiles({ '08-x.md': CLEAN_DISCUSSION })), 'DISC_FILE_SET'],
    ['DISC_STATUS_LINE', run(sampleFiles({}, CLEAN_DISCUSSION.replace('RESOLVED', 'JUDGE-RULED'))), 'DISC_STATUS_LINE'],
    ['DISC_BOARD_MISMATCH', run(sampleFiles({}), sampleBoard('CONSENSUS (x)')), 'DISC_BOARD_MISMATCH'],
    ['DISC_SOURCE_NOTE', run(sampleFiles({}, CLEAN_DISCUSSION.replace('private', 'hidden'))), 'DISC_SOURCE_NOTE'],
    ['DISC_BLOCKQUOTE', run(sampleFiles({}, `${CLEAN_DISCUSSION}\n> extra quote\n`)), 'DISC_BLOCKQUOTE'],
    ['DISC_SENDER_ID', run(sampleFiles({}, `${CLEAN_DISCUSSION}\n\`4321\`\n`)), 'DISC_SENDER_ID'],
    ['DISC_LONG_QUOTE', run(sampleFiles({}, `${CLEAN_DISCUSSION}\n"${'a'.repeat(70)}"\n`)), 'DISC_LONG_QUOTE'],
    ['DISC_HEADINGS', run(sampleFiles({}, CLEAN_DISCUSSION.replace('## Verdict', '## Outcome'))), 'DISC_HEADINGS'],
    ['DISC_RULE_UNKNOWN', run(sampleFiles({}, `${CLEAN_DISCUSSION}\nSee 303.9.z.9.\n`)), 'DISC_RULE_UNKNOWN'],
    ['DISC_PERSON_ROLE', run(sampleFiles({}, `${CLEAN_DISCUSSION}\nThe sender said so.\n`)), 'DISC_PERSON_ROLE'],
  ];
  const failed = cases.filter(([, codes, want]) => (want === null ? codes.length !== 0 : !codes.includes(want)));
  if (failed.length > 0) {
    console.error('DISCUSSIONS_SELF_TEST_FAILED');
    for (const [label, codes] of failed) console.error(`  ${label}: got [${codes.join(', ')}]`);
    process.exit(1);
  }
  console.log('discussions self-test ok');
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--self-test')) {
    selfTest();
    return;
  }
  const i = argv.indexOf('--root');
  const root = i >= 0 ? resolve(argv[i + 1]) : join(dirname(fileURLToPath(import.meta.url)), '..');
  if (!existsSync(join(root, 'discussions'))) {
    console.error(`DISC_FILE_SET: discussions: directory missing under ${root}`);
    process.exit(1);
  }
  const files = loadFiles(root);
  const board = parseBoard(files[BOARD_NAME] ?? '');
  const violations = checkDiscussions(files, board, loadSnapshotKeys(root));
  if (violations.length > 0) {
    for (const v of violations) console.error(`${v.code}: ${v.file}: ${v.detail}`);
    process.exit(1);
  }
  console.log(`discussions ok: ${Object.keys(files).length} files`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
