/**
 * Pure consistency evaluation: compares each script's rule declaration with the snapshot of
 * rule hashes and the status board. Ruling status comes from the board on every run and is
 * never stored in a script. Unresolved rulings are flagged and never fail.
 */

import { RuleDeclarationSchema } from '../../packages/effects-ir/src/declaration';
import type { BoardRow } from './board';
import type { Snapshot } from './snapshot';

export type FailureCode =
  | 'SCRIPT_UNDECLARED'
  | 'SCRIPT_NO_RULES'
  | 'DECLARATION_INVALID'
  | 'RULE_KEY_UNKNOWN'
  | 'RULE_HASH_DRIFT'
  | 'RULING_RULE_NOT_DECLARED'
  | 'RULING_DISCUSSION_UNKNOWN'
  | 'RULING_DISCUSSION_WITHHELD';

export type Failure = { code: FailureCode; cardNo: string; detail: string };

export type ScriptInput = { cardNo: string; file: string; declaration: unknown | undefined };

export type RuleEntry = {
  key: string;
  reviewedHash: string;
  currentHash: string | null;
  drift: boolean;
};

export type RulingEntry = { discussion: string; rule: string; status: string | null };

export type ScriptReport = {
  cardNo: string;
  file: string;
  declared: boolean;
  rules: RuleEntry[];
  rulings: RulingEntry[];
  flags: string[];
  failures: string[];
};

export type Report = {
  revision: string | null;
  totals: {
    scripts: number;
    declared: number;
    undeclared: number;
    withRulingFlags: number;
    withDrift: number;
    failing: number;
  };
  scripts: ScriptReport[];
  failures: Failure[];
};

export type EvaluateInput = {
  scripts: ScriptInput[];
  snapshot: Snapshot;
  board: Map<string, BoardRow>;
  only?: string[];
};

const OPEN_MARKS = new Set(['ESCALATE', 'ESCALATE-OPEN']);

const evaluateScript = (
  script: ScriptInput,
  snapshot: Snapshot,
  board: Map<string, BoardRow>,
): { report: ScriptReport; failures: Failure[] } => {
  const report: ScriptReport = {
    cardNo: script.cardNo,
    file: script.file,
    declared: false,
    rules: [],
    rulings: [],
    flags: [],
    failures: [],
  };
  const failures: Failure[] = [];
  const fail = (code: FailureCode, detail: string): void => {
    failures.push({ code, cardNo: script.cardNo, detail });
    report.failures.push(code);
  };

  if (script.declaration === undefined) {
    fail('SCRIPT_UNDECLARED', 'no RULE_DECLARATION export');
    return { report, failures };
  }
  const parsed = RuleDeclarationSchema.safeParse(script.declaration);
  if (!parsed.success) {
    fail('DECLARATION_INVALID', parsed.error.issues.map((i) => i.message).join('; '));
    return { report, failures };
  }
  report.declared = true;
  const declaration = parsed.data;

  if (declaration.rules.length === 0) fail('SCRIPT_NO_RULES', 'declaration lists no rules');

  const declaredKeys = new Set(declaration.rules.map((r) => r.key));
  for (const rule of declaration.rules) {
    const current = snapshot.get(rule.key);
    if (current === undefined) {
      report.rules.push({ key: rule.key, reviewedHash: rule.reviewedHash, currentHash: null, drift: false });
      fail('RULE_KEY_UNKNOWN', rule.key);
      continue;
    }
    const drift = current.textHash !== rule.reviewedHash;
    report.rules.push({
      key: rule.key,
      reviewedHash: rule.reviewedHash,
      currentHash: current.textHash,
      drift,
    });
    if (drift) {
      fail('RULE_HASH_DRIFT', `${rule.key} reviewed ${rule.reviewedHash} current ${current.textHash}`);
    }
  }

  for (const ruling of declaration.rulings) {
    const row = board.get(ruling.discussion);
    report.rulings.push({
      discussion: ruling.discussion,
      rule: ruling.rule,
      status: row?.mark ?? null,
    });
    if (!declaredKeys.has(ruling.rule)) {
      fail('RULING_RULE_NOT_DECLARED', `${ruling.discussion} ${ruling.rule}`);
    }
    if (row === undefined) {
      fail('RULING_DISCUSSION_UNKNOWN', ruling.discussion);
    } else if (row.mark === 'WITHHELD') {
      fail('RULING_DISCUSSION_WITHHELD', ruling.discussion);
    } else if (OPEN_MARKS.has(row.mark)) {
      const flag = 'RULING_OPEN';
      if (!report.flags.includes(flag)) report.flags.push(flag);
    }
  }
  return { report, failures };
};

export const evaluate = (input: EvaluateInput): Report => {
  const sorted = [...input.scripts].sort((a, b) => (a.cardNo < b.cardNo ? -1 : a.cardNo > b.cardNo ? 1 : 0));
  const scripts: ScriptReport[] = [];
  const all: Failure[] = [];
  for (const script of sorted) {
    const { report, failures } = evaluateScript(script, input.snapshot, input.board);
    scripts.push(report);
    all.push(...failures);
  }
  const only = input.only;
  const failures = only === undefined ? all : all.filter((f) => only.includes(f.cardNo));
  const revisions = new Set([...input.snapshot.values()].map((v) => v.revision));
  const revision = revisions.size === 1 ? ([...revisions][0] ?? null) : null;
  const failingCards = new Set(failures.map((f) => f.cardNo));
  return {
    revision,
    totals: {
      scripts: scripts.length,
      declared: scripts.filter((s) => s.declared).length,
      undeclared: scripts.filter((s) => s.failures.includes('SCRIPT_UNDECLARED')).length,
      withRulingFlags: scripts.filter((s) => s.flags.length > 0).length,
      withDrift: scripts.filter((s) => s.rules.some((r) => r.drift)).length,
      failing: failingCards.size,
    },
    scripts,
    failures,
  };
};
