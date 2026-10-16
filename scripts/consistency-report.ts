/**
 * Consistency report: which card scripts depend on which rules, the status of the rulings
 * they implement (read from the public board), hash drift, and undeclared scripts.
 *
 * Usage: tsx scripts/consistency-report.ts [--root <dir>] [--json <path>] [--summary <path>]
 *        [--only CARD,CARD] [--lookup KEY...] [--no-fail]
 */

import { appendFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseBoard } from './community/board';
import { evaluate, type ScriptInput } from './community/evaluate';
import { renderSummary } from './community/render';
import { parseSnapshot } from './community/snapshot';

type Args = {
  root: string;
  json: string;
  summary: string | undefined;
  only: string[] | undefined;
  lookup: string[] | undefined;
  noFail: boolean;
};

const parseArgs = (argv: string[]): Args => {
  const args: Args = {
    root: resolve(import.meta.dirname, '..'),
    json: 'reports/consistency.json',
    summary: undefined,
    only: undefined,
    lookup: undefined,
    noFail: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root') args.root = resolve(argv[++i] ?? '');
    else if (arg === '--json') args.json = argv[++i] ?? args.json;
    else if (arg === '--summary') args.summary = argv[++i];
    else if (arg === '--only') args.only = (argv[++i] ?? '').split(',').filter(Boolean);
    else if (arg === '--no-fail') args.noFail = true;
    else if (arg === '--lookup') {
      args.lookup = [];
      while (i + 1 < argv.length && !(argv[i + 1] ?? '').startsWith('--')) {
        args.lookup.push(argv[++i] ?? '');
      }
    } else {
      console.error(`unknown argument ${arg}`);
      process.exit(2);
    }
  }
  return args;
};

const args = parseArgs(process.argv.slice(2));

let snapshot;
try {
  snapshot = parseSnapshot(JSON.parse(readFileSync(join(args.root, 'rules/rule-key-snapshot.json'), 'utf8')));
} catch (error) {
  console.error(`SNAPSHOT_UNREADABLE ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

if (args.lookup !== undefined) {
  let missing = false;
  for (const key of args.lookup) {
    const entry = snapshot.get(key);
    if (entry === undefined) missing = true;
    console.log(`${key}\t${entry?.textHash ?? 'UNKNOWN'}`);
  }
  process.exit(missing ? 1 : 0);
}

let board;
try {
  board = parseBoard(readFileSync(join(args.root, 'discussions/00-README.md'), 'utf8'));
} catch (error) {
  console.error(`BOARD_UNREADABLE ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

const scriptsDir = join(args.root, 'packages/effects-ir/src/scripts');
const scripts: ScriptInput[] = [];
for (const name of readdirSync(scriptsDir).filter((n) => n.endsWith('.ts') && n !== 'index.ts').sort()) {
  const file = join(scriptsDir, name);
  const mod = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
  scripts.push({
    cardNo: typeof mod.CARD_NO === 'string' ? mod.CARD_NO : name.replace(/\.ts$/, ''),
    file: `packages/effects-ir/src/scripts/${name}`,
    declaration: mod.RULE_DECLARATION,
  });
}

if (args.only !== undefined && !scripts.some((s) => args.only?.includes(s.cardNo))) {
  console.error(`note: no script matched --only ${args.only.join(',')}`);
}

const report = evaluate({ scripts, snapshot, board, only: args.only });

const jsonPath = resolve(args.root, args.json);
mkdirSync(dirname(jsonPath), { recursive: true });
const { failures: _failures, ...serialisable } = report;
writeFileSync(jsonPath, `${JSON.stringify(serialisable, null, 2)}\n`);
if (args.summary !== undefined) appendFileSync(args.summary, `${renderSummary(report)}\n`);

for (const f of report.failures) console.log(`${f.code} ${f.cardNo} ${f.detail}`);
for (const s of report.scripts) for (const flag of s.flags) console.log(`${flag} ${s.cardNo}`);
const t = report.totals;
console.log(
  `scripts ${t.scripts}, declared ${t.declared}, undeclared ${t.undeclared}, drift ${t.withDrift}, flagged ${t.withRulingFlags}, failing ${t.failing}`,
);

process.exit(args.noFail || report.failures.length === 0 ? 0 : 1);
