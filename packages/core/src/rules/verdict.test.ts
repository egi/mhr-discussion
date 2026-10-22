/**
 * The two guarantees behind "an uncited error is unrepresentable", asserted
 * rather than assumed.
 *
 * The throw paths are the whole point of `reject()`: a brand alone enforces
 * nothing once JavaScript is running, so the runtime control of record is that
 * building a failure without a citation throws, and that this file proves it.
 * Each throw path is its own named test, because a combined assertion would
 * report only that *something* threw.
 */
import { describe, expect, it } from 'vitest';

import { asRuleKey, asRuleRevision, type RuleRef } from './ruleKey';
import { accept, DiagnosticCodeSchema, reject, type Diagnostic } from './verdict';

/**
 * A fixture citation. Its brands come from the sanctioned constructors in
 * `ruleKey.ts` rather than from a cast, so this file cannot accidentally
 * demonstrate that a bare string works.
 */
const REF: RuleRef = {
  key: asRuleKey('301.19'),
  revision: asRuleRevision('1.03'),
  number: '301.19',
  textHash: '000000000000',
  anchor: '#301.19',
};

describe('reject() — the only door to a failing verdict', () => {
  it('throws on an error diagnostic that carries no citation', () => {
    const uncited: Diagnostic = {
      code: 'ZONE_FULL',
      severity: 'error',
      ruleRefs: [],
      params: { zone: 'BATTLE' },
    };

    expect(() => reject([uncited], [REF])).toThrow(/UNCITED_ERROR: ZONE_FULL/);
  });

  it('throws when the verdict itself is uncited, even with every diagnostic cited', () => {
    const cited: Diagnostic = {
      code: 'TARGET_OUT_OF_RANGE',
      severity: 'error',
      ruleRefs: [REF],
      params: { distance: 3 },
    };

    expect(() => reject([cited], [])).toThrow(/UNCITED_ERROR: TARGET_OUT_OF_RANGE/);
  });

  it('still names a code when a failing verdict has no error diagnostic to blame', () => {
    const warning: Diagnostic = {
      code: 'RULESET_STALE',
      severity: 'warning',
      ruleRefs: [],
      params: {},
    };

    expect(() => reject([warning], [])).toThrow(/UNCITED_ERROR: ENGINE_UNKNOWN/);
  });

  it('builds the failing verdict once every error diagnostic is cited', () => {
    const cited: Diagnostic = {
      code: 'HAND_LIMIT_EXCEEDED',
      severity: 'error',
      ruleRefs: [REF],
      params: { limit: 7, held: 8 },
    };

    expect(reject([cited], [REF])).toEqual({
      ok: false,
      ruleRefs: [REF],
      diagnostics: [cited],
    });
  });

  it('permits a warning with no citation, provided the verdict carries one', () => {
    const warning: Diagnostic = {
      code: 'RULESET_STALE',
      severity: 'warning',
      ruleRefs: [],
      params: { revision: '1.02' },
    };

    expect(reject([warning], [REF])).toEqual({
      ok: false,
      ruleRefs: [REF],
      diagnostics: [warning],
    });
  });
});

describe('accept() — the success constructor', () => {
  it('carries its warnings', () => {
    const warning: Diagnostic = {
      code: 'EFFECT_UNSUPPORTED',
      severity: 'warning',
      ruleRefs: [],
      params: { cardNo: 'AA01-001' },
    };

    expect(accept([REF], [warning])).toEqual({
      ok: true,
      ruleRefs: [REF],
      warnings: [warning],
    });
  });

  it('defaults to no warnings', () => {
    expect(accept([REF])).toEqual({ ok: true, ruleRefs: [REF], warnings: [] });
  });
});

describe('the diagnostic vocabulary', () => {
  /**
   * Compared as the full sorted list, not as a count: a count check passes if
   * two codes are swapped, and a swap is precisely the change that silently
   * re-points a translation at the wrong message.
   */
  it('is exactly the nineteen stable codes', () => {
    const expected = [
      'ACTION_LIMIT_REACHED',
      'BATTLE_LOCKED',
      'CALL_COST_INSUFFICIENT',
      'CARD_PLACED_THIS_TURN',
      'COUNTER_STEP_STATE',
      'DECK_EMPTY',
      'EFFECT_UNEXECUTABLE',
      'EFFECT_UNSUPPORTED',
      'ENGINE_UNKNOWN',
      'GAME_OVER',
      'HAND_LIMIT_EXCEEDED',
      'NOT_ACTION_PHASE',
      'NOT_PRIORITY_ACTOR',
      'NOT_TURN_PLAYER',
      'RULESET_STALE',
      'TARGET_OUT_OF_RANGE',
      'UNIQUE_VIOLATION',
      'ZONE_FULL',
      'ZONE_OCCUPIED',
    ];

    expect(expected).toHaveLength(19);
    expect([...DiagnosticCodeSchema.options].sort()).toEqual(expected);
  });
});

describe('the RuleRef brand', () => {
  /**
   * The compile-time half of the guarantee, as a probe rather than a claim.
   * The assertion that matters is the one `tsc` makes: deleting the
   * `@ts-expect-error` marker must make `pnpm --filter @mhr/engine typecheck`
   * fail, which is what proves a bare string cannot stand in for a citation.
   */
  it('refuses a bare string where a RuleRef is expected (compile-time probe)', () => {
    // @ts-expect-error — RuleRef is branded; a plain string is not assignable,
    // which is the whole reason a forgotten citation cannot compile.
    const bare: RuleRef = '301.19';

    expect(bare).toBe('301.19');
  });
});
