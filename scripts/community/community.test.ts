import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoard, type BoardRow } from './board';
import { evaluate } from './evaluate';
import { renderSummary } from './render';
import { parseSnapshot } from './snapshot';

const snapshot = parseSnapshot([
  { ruleKey: '301.18.h', revision: '1.03', textHash: 'aaaaaaaaaaaa' },
  { ruleKey: '304.1', revision: '1.03', textHash: 'bbbbbbbbbbbb' },
  { ruleKey: '304.2', revision: '1.03', textHash: 'bbbbbbbbbbbb' },
]);

const row = (id: string, mark: BoardRow['mark']): [string, BoardRow] => [
  id,
  { id, file: `${id}.md`, mark, detail: mark },
];
const board = (mark: BoardRow['mark'] = 'RESOLVED') =>
  new Map<string, BoardRow>([row('04', mark), row('08', 'WITHHELD')]);

const good = {
  rules: [{ key: '301.18.h', reviewedHash: 'aaaaaaaaaaaa' }],
  rulings: [{ discussion: '04', rule: '301.18.h' }],
};
const run = (declaration: unknown, b = board(), only?: string[]) =>
  evaluate({ scripts: [{ cardNo: 'X-1', file: 'X-1.ts', declaration }], snapshot, board: b, only });
const codes = (declaration: unknown, b = board()) => run(declaration, b).failures.map((f) => f.code);

describe('parseSnapshot', () => {
  it('rejects non-array input', () => {
    expect(() => parseSnapshot({})).toThrow();
  });
  it('rejects entries missing fields', () => {
    expect(() => parseSnapshot([{ ruleKey: 'a', revision: '1' }])).toThrow();
  });
  it('rejects malformed hashes', () => {
    expect(() => parseSnapshot([{ ruleKey: 'a', revision: '1', textHash: 'ABC' }])).toThrow();
  });
  it('accepts identical hashes on different keys', () => {
    expect(snapshot.get('304.1')?.textHash).toBe(snapshot.get('304.2')?.textHash);
  });
});

describe('parseBoard', () => {
  const real = readFileSync(new URL('../../discussions/00-README.md', import.meta.url), 'utf8');
  it('parses the committed board into 12 rows', () => {
    const rows = parseBoard(real);
    expect(rows.size).toBe(12);
    expect(rows.get('08')?.mark).toBe('WITHHELD');
    expect(rows.get('10')?.mark).toBe('ESCALATE-OPEN');
    expect(rows.get('06')?.mark).toBe('ESCALATE');
  });
  it('throws BOARD_UNREADABLE without a header', () => {
    expect(() => parseBoard('no table here')).toThrow(/header/);
  });
  it('throws on an unknown mark naming the row', () => {
    const text = '| # | File | Status | One-line |\n|---|---|---|---|\n| 3 | f.md | MAYBE | x |\n';
    expect(() => parseBoard(text)).toThrow(/row 3/);
  });
});

describe('evaluate', () => {
  it('reports undeclared scripts and counts them', () => {
    const r = run(undefined);
    expect(r.failures.map((f) => f.code)).toEqual(['SCRIPT_UNDECLARED']);
    expect(r.totals.undeclared).toBe(1);
  });
  it('fails an empty rule list', () => {
    expect(codes({ rules: [], rulings: [] })).toContain('SCRIPT_NO_RULES');
  });
  it('fails a schema-invalid declaration', () => {
    expect(codes({ rules: 'x' })).toEqual(['DECLARATION_INVALID']);
  });
  it('fails an unknown rule key', () => {
    expect(codes({ rules: [{ key: '9.9', reviewedHash: 'aaaaaaaaaaaa' }], rulings: [] })).toEqual([
      'RULE_KEY_UNKNOWN',
    ]);
  });
  it('fails hash drift and reports both hashes', () => {
    const r = run({ rules: [{ key: '301.18.h', reviewedHash: 'cccccccccccc' }], rulings: [] });
    expect(r.failures.map((f) => f.code)).toEqual(['RULE_HASH_DRIFT']);
    expect(r.scripts[0]?.rules[0]).toMatchObject({ reviewedHash: 'cccccccccccc', currentHash: 'aaaaaaaaaaaa', drift: true });
    expect(r.totals.withDrift).toBe(1);
  });
  it('accepts identical hashes across two keys', () => {
    const decl = {
      rules: [
        { key: '304.1', reviewedHash: 'bbbbbbbbbbbb' },
        { key: '304.2', reviewedHash: 'bbbbbbbbbbbb' },
      ],
      rulings: [],
    };
    expect(codes(decl)).toEqual([]);
  });
  it('accepts a clean declaration', () => {
    expect(codes(good)).toEqual([]);
  });
  it('fails a ruling whose rule is not declared', () => {
    expect(codes({ ...good, rulings: [{ discussion: '04', rule: '304.1' }] })).toContain('RULING_RULE_NOT_DECLARED');
  });
  it('fails an unknown discussion', () => {
    expect(codes({ ...good, rulings: [{ discussion: '77', rule: '301.18.h' }] })).toEqual(['RULING_DISCUSSION_UNKNOWN']);
  });
  it('fails a withheld discussion', () => {
    expect(codes({ ...good, rulings: [{ discussion: '08', rule: '301.18.h' }] })).toEqual(['RULING_DISCUSSION_WITHHELD']);
  });
  it('flags without failing when the board moves RESOLVED to ESCALATE', () => {
    const resolved = run(good, board('RESOLVED'));
    expect(resolved.scripts[0]?.flags).toEqual([]);
    const open = run(good, board('ESCALATE'));
    expect(open.failures).toEqual([]);
    expect(open.scripts[0]?.flags).toEqual(['RULING_OPEN']);
    expect(open.scripts[0]?.rulings[0]?.status).toBe('ESCALATE');
    expect(run(good, board('ESCALATE-OPEN')).scripts[0]?.flags).toEqual(['RULING_OPEN']);
  });
  it('restricts failures with only but keeps overall totals', () => {
    const r = run(undefined, board(), ['OTHER']);
    expect(r.failures).toEqual([]);
    expect(r.totals.undeclared).toBe(1);
  });
});

describe('renderSummary', () => {
  it('always states the undeclared count and lists flagged scripts', () => {
    expect(renderSummary(run(good, board('RESOLVED')))).toContain('Undeclared scripts: 0');
    const text = renderSummary(run(good, board('ESCALATE')));
    expect(text).toContain('| X-1 |');
    expect(text).toContain('RULING_OPEN');
    expect(renderSummary(run(undefined))).toContain('Undeclared scripts: 1');
  });
});
