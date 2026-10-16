import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkDiscussions, parseBoard, HEADINGS, PUBLISHED_NUMBERS } from './check-discussions.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const SCRIPT = join(here, 'check-discussions.mjs');
const KEYS = new Set(['303.2.a.4', '301.18.h']);

const CLEAN = [
  '# 01 - Title',
  '',
  '**Status: RESOLVED (rulebook)**',
  '',
  '> Source note: L<n> citations refer to a private chat export.',
  '',
  ...HEADINGS.flatMap((h) => [`## ${h}`, 'Paraphrase citing 303.2.a.4 and 301.18.h.', '']),
].join('\n');

function files(overrides = {}, drop = []) {
  const f = { '00-README.md': '# Discussions\n' };
  for (const n of PUBLISHED_NUMBERS) f[`${n}-x.md`] = CLEAN;
  for (const d of drop) delete f[d];
  return { ...f, ...overrides };
}
const board = (status = 'RESOLVED (rulebook)') =>
  PUBLISHED_NUMBERS.map((n) => ({ number: n, file: `${n}-x.md`, status }));
const codes = (f, b = board()) => checkDiscussions(f, b, KEYS).map((v) => v.code);
const withExtra = (extra) => files({ '01-x.md': `${CLEAN}\n${extra}\n` });

describe('check-discussions', () => {
  it('passes a clean fixture set', () => {
    expect(codes(files())).toEqual([]);
  });

  it('DISC_FILE_SET: flags a missing 10', () => {
    expect(codes(files({}, ['10-x.md']))).toContain('DISC_FILE_SET');
  });

  it('DISC_FILE_SET: flags an 08 file', () => {
    expect(codes(files({ '08-anything.md': CLEAN }))).toContain('DISC_FILE_SET');
  });

  it('DISC_STATUS_LINE: rejects a private mark', () => {
    const f = files({ '01-x.md': CLEAN.replace('RESOLVED', 'JUDGE-RULED') });
    expect(codes(f)).toContain('DISC_STATUS_LINE');
  });

  it('DISC_STATUS_LINE: rejects an unknown mark', () => {
    const f = files({ '01-x.md': CLEAN.replace('RESOLVED', 'SETTLED') });
    expect(codes(f)).toContain('DISC_STATUS_LINE');
  });

  it('DISC_BOARD_MISMATCH: flags a differing board mark', () => {
    expect(codes(files(), board('CONSENSUS (x)'))).toContain('DISC_BOARD_MISMATCH');
  });

  it('DISC_SOURCE_NOTE: flags a note lacking "private"', () => {
    const f = files({ '01-x.md': CLEAN.replace('private', 'hidden') });
    expect(codes(f)).toContain('DISC_SOURCE_NOTE');
  });

  it('DISC_BLOCKQUOTE: flags a second blockquote line', () => {
    expect(codes(withExtra('> another'))).toContain('DISC_BLOCKQUOTE');
  });

  it('DISC_SENDER_ID: flags a backticked four-digit id', () => {
    expect(codes(withExtra('said `4321` so'))).toContain('DISC_SENDER_ID');
  });

  it('DISC_LONG_QUOTE: flags a 70 character quoted span', () => {
    expect(codes(withExtra(`"${'a'.repeat(70)}"`))).toContain('DISC_LONG_QUOTE');
  });

  it('DISC_LONG_QUOTE: spares a short quoted span', () => {
    expect(codes(withExtra('"short phrase"'))).toEqual([]);
  });

  it('DISC_HEADINGS: flags a renamed heading', () => {
    const f = files({ '01-x.md': CLEAN.replace('## Verdict', '## Outcome') });
    expect(codes(f)).toContain('DISC_HEADINGS');
  });

  it('DISC_RULE_UNKNOWN: flags a key absent from the snapshot', () => {
    expect(codes(withExtra('see 303.9.z.9'))).toContain('DISC_RULE_UNKNOWN');
  });

  it('DISC_RULE_UNKNOWN: ignores line refs, dates, versions and card numbers', () => {
    const extra = 'L12769 on 2026-09-24, v1.03, SP01-043, rules 303.2.a.4. and 301.18.h.';
    expect(codes(withExtra(extra))).toEqual([]);
  });

  it('DISC_PERSON_ROLE: flags sender, whatsapp and phone-like runs', () => {
    expect(codes(withExtra('the sender'))).toContain('DISC_PERSON_ROLE');
    expect(codes(withExtra('on WhatsApp'))).toContain('DISC_PERSON_ROLE');
    expect(codes(withExtra(`call ${'1234567'}${'8901'}`))).toContain('DISC_PERSON_ROLE');
  });

  it('parses board rows', () => {
    const rows = parseBoard('| 1 | 01-x.md | RESOLVED (a) | one |\n| # | File |\n');
    expect(rows).toEqual([{ number: '01', file: '01-x.md', status: 'RESOLVED (a)' }]);
  });

  it('the self-test exits 0', () => {
    const r = spawnSync('node', [SCRIPT, '--self-test'], { encoding: 'utf8' });
    expect(r.status).toBe(0);
  });

  it('the real published directory has zero violations', () => {
    const dir = join(root, 'discussions');
    const fs = {};
    for (const n of ['00-README.md', ...readdirNames(dir)]) fs[n] = readFileSync(join(dir, n), 'utf8');
    const snap = new Set(JSON.parse(readFileSync(join(root, 'rules', 'rule-key-snapshot.json'), 'utf8')).map((e) => e.ruleKey));
    const v = checkDiscussions(fs, parseBoard(fs['00-README.md']), snap);
    expect(v).toEqual([]);
  });
});

function readdirNames(dir) {
  return spawnSync('ls', [dir], { encoding: 'utf8' }).stdout.split('\n').filter((n) => n.endsWith('.md') && n !== '00-README.md');
}
