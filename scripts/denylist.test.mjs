import { spawnSync, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { hashToken, tokensOf } from './check-denylist.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const CHECK = join(here, 'check-denylist.mjs');
const ADD = join(here, 'denylist-add.mjs');

// Invented tokens only: no real name appears in this file.
const TOKEN = 'zxqvtest';
const SALT = 'unit-test-salt';

const dirs = [];
afterEach(() => {
  while (dirs.length) rmSync(dirs.pop(), { recursive: true, force: true });
});

function tmp() {
  const d = mkdtempSync(join(tmpdir(), 'denylist-'));
  dirs.push(d);
  return d;
}

function git(dir, ...args) {
  return execFileSync(
    'git',
    ['-C', dir, '-c', 'user.name=Tester One', '-c', 'user.email=t@example.test', '-c', 'commit.gpgsign=false', ...args],
    { encoding: 'utf8' },
  );
}

function makeRepo() {
  const dir = tmp();
  git(dir, 'init', '-q', '-b', 'main');
  return dir;
}

function writeDenylist(hashes, salt = SALT) {
  const file = join(tmp(), 'denylist.json');
  writeFileSync(
    file,
    JSON.stringify({ version: 1, algorithm: 'sha256', minTokenLength: 3, salt, hashes }, null, 2),
  );
  return file;
}

function runCheck(root, denylist, ...extra) {
  const r = spawnSync('node', [CHECK, '--root', root, '--denylist', denylist, ...extra], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

describe('tokenisation', () => {
  it('lowercases runs of letters and digits', () => {
    expect(tokensOf('Hello, World_42!')).toEqual(expect.arrayContaining(['hello', 'world', '42']));
  });

  it('splits camelCase and offers joined neighbours', () => {
    const t = tokensOf('ZxqvTestUser');
    expect(t).toContain('zxqvtest');
    expect(t).toContain('zxqv');
    expect(t).toContain('user');
  });
});

describe('check-denylist', () => {
  it('flags a tracked-or-untracked file containing a denied token (tree mode)', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, 'notes.txt'), `line one\nwho is ${TOKEN} anyway\n`);
    const dl = writeDenylist([hashToken(SALT, TOKEN)]);
    const r = runCheck(repo, dl);
    expect(r.code).toBe(1);
    expect(r.out).toContain('DENYLIST_HIT');
    expect(r.out).toContain('notes.txt:2');
    expect(r.out).not.toContain(TOKEN);
  });

  it('passes a clean tree and reports the entry count', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, 'notes.txt'), 'nothing to see\n');
    const dl = writeDenylist([hashToken(SALT, TOKEN)]);
    const r = runCheck(repo, dl);
    expect(r.code).toBe(0);
    expect(r.out).toContain('denylist entries: 1');
  });

  it('fails with an empty denylist unless --allow-empty is given', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, 'a.txt'), `${TOKEN}\n`);
    const r = runCheck(repo, writeDenylist([]));
    expect(r.code).toBe(1);
    expect(r.out).toContain('denylist entries: 0');
    expect(runCheck(repo, writeDenylist([]), '--allow-empty').code).toBe(0);
  });

  it('never prints a path that contains a denied token (tree and history)', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, `${TOKEN}-notes.txt`), 'nothing here\n');
    git(repo, 'add', '-A');
    git(repo, 'commit', '-q', '-m', 'add');
    const dl = writeDenylist([hashToken(SALT, TOKEN)]);
    for (const extra of [[], ['--history']]) {
      const r = runCheck(repo, dl, ...extra);
      expect(r.code).toBe(1);
      expect(r.out).toContain('<redacted-path:');
      expect(r.out).not.toContain(TOKEN);
    }
  });

  it('never scans the denylist file itself', () => {
    const repo = makeRepo();
    const dl = join(repo, 'scripts', 'denylist.json');
    mkdirSync(join(repo, 'scripts'));
    writeFileSync(dl, JSON.stringify({ version: 1, salt: SALT, minTokenLength: 3, hashes: [hashToken(SALT, TOKEN)], note: TOKEN }));
    const r = runCheck(repo, dl);
    expect(r.code).toBe(0);
  });

  it('catches a token added in one commit and deleted in the next (history mode)', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, 'a.txt'), `hello ${TOKEN}\n`);
    git(repo, 'add', '-A');
    git(repo, 'commit', '-q', '-m', 'add');
    writeFileSync(join(repo, 'a.txt'), 'hello\n');
    git(repo, 'add', '-A');
    git(repo, 'commit', '-q', '-m', 'remove');
    const dl = writeDenylist([hashToken(SALT, TOKEN)]);
    expect(runCheck(repo, dl).code).toBe(0);
    const h = runCheck(repo, dl, '--history');
    expect(h.code).toBe(1);
    expect(h.out).toContain('DENYLIST_HIT');
    expect(h.out).toMatch(/commit [0-9a-f]{7}/);
    expect(h.out).not.toContain(TOKEN);
  });

  it('catches a token in a commit message', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, 'a.txt'), 'x\n');
    git(repo, 'add', '-A');
    git(repo, 'commit', '-q', '-m', `credit to ${TOKEN}`);
    const h = runCheck(repo, writeDenylist([hashToken(SALT, TOKEN)]), '--history');
    expect(h.code).toBe(1);
    expect(h.out).not.toContain(TOKEN);
  });

  it('catches a token in an author name', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, 'a.txt'), 'x\n');
    git(repo, 'add', '-A');
    git(repo, 'commit', '-q', '-m', 'plain', '--author', `${TOKEN} Person <p@example.test>`);
    const h = runCheck(repo, writeDenylist([hashToken(SALT, TOKEN)]), '--history');
    expect(h.code).toBe(1);
    expect(h.out).not.toContain(TOKEN);
  });

  it('matches a camelCase identifier by its joined pieces', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, 'a.ts'), 'const ZxqvTestUser = 1;\n');
    const r = runCheck(repo, writeDenylist([hashToken(SALT, TOKEN)]));
    expect(r.code).toBe(1);
  });

  it('never checks tokens shorter than minTokenLength', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, 'a.txt'), 'ab ab ab\n');
    const r = runCheck(repo, writeDenylist([hashToken(SALT, 'ab')]));
    expect(r.code).toBe(0);
  });
});

describe('denylist-add', () => {
  function add(dir, denylist, input) {
    return spawnSync('node', [ADD, '--root', dir, '--denylist', denylist], { input, encoding: 'utf8' });
  }

  it('creates a salt, stores token and joined hashes, dedupes and prints counts only', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, 'a.txt'), 'clean\n');
    const dl = join(tmp(), 'denylist.json');
    writeFileSync(dl, JSON.stringify({ version: 1, algorithm: 'sha256', minTokenLength: 3, salt: '', hashes: [] }));
    const r1 = add(repo, dl, 'Zxqvtest Quuxlast\nzxqvtest quuxlast\nab\n');
    expect(r1.status).toBe(0);
    expect(`${r1.stdout}${r1.stderr}`.toLowerCase()).not.toContain('zxqvtest');
    expect(`${r1.stdout}${r1.stderr}`.toLowerCase()).not.toContain('quuxlast');
    const saved = JSON.parse(readFileSync(dl, 'utf8'));
    expect(saved.salt).toMatch(/^[0-9a-f]{32}$/);
    // zxqvtest, quuxlast and the joined form; "ab" is too short.
    expect(saved.hashes).toHaveLength(3);
    expect([...saved.hashes].sort()).toEqual(saved.hashes);
    expect(saved.hashes).toContain(hashToken(saved.salt, 'zxqvtestquuxlast'));
    const r2 = add(repo, dl, 'Zxqvtest Quuxlast\n');
    expect(r2.status).toBe(0);
    expect(JSON.parse(readFileSync(dl, 'utf8')).hashes).toHaveLength(3);
    expect(JSON.parse(readFileSync(dl, 'utf8')).salt).toBe(saved.salt);
  });

  it('warns without printing the token when it already occurs in the tree', () => {
    const repo = makeRepo();
    writeFileSync(join(repo, 'a.txt'), `mentions ${TOKEN}\n`);
    const dl = join(tmp(), 'denylist.json');
    writeFileSync(dl, JSON.stringify({ version: 1, algorithm: 'sha256', minTokenLength: 3, salt: '', hashes: [] }));
    const r = add(repo, dl, `${TOKEN}\n`);
    const out = `${r.stdout}${r.stderr}`;
    expect(out.toLowerCase()).toContain('warning');
    expect(out).not.toContain(TOKEN);
  });
});
