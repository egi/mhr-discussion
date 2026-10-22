/**
 * The diagnostic vocabulary, and the total constructors every verdict goes
 * through.
 *
 * Validation never throws and never returns a boolean. A verdict is a value, so
 * a caller can render *why* a move was refused instead of catching an
 * exception. Two guarantees make the product's core promise — a definitive,
 * rule-cited answer — structurally true rather than conventionally true, and
 * they live in two different places because neither alone is sufficient:
 *
 * - Compile time: `RuleRef` is branded, so a bare string cannot stand where a
 *   citation is expected.
 * - Runtime: brands are erased when JavaScript runs. The runtime guarantee is
 *   that `reject()` is the ONLY constructor for a failing verdict, and it
 *   throws when the failure is uncited. `verdict.test.ts` asserts both throw
 *   paths, which is what turns "we forgot a citation" into a failing test in
 *   the engine's own suite rather than a product bug found in a shared link.
 *
 * Honest limitation, recorded so it is not mistaken for a solved problem:
 * branding is static-only — the zod documentation states that `.brand()` "does
 * not affect the runtime result of `.parse`" — so the brand does not enforce
 * anything at runtime, and `reject()` does not constrain what the type system
 * sees. A later phase should add a boundary rule forbidding rule modules from
 * returning hand-written `Verdict` object literals, which is what would close
 * the remaining gap between "this constructor throws" and "this constructor is
 * the only door".
 *
 * Language boundary: the engine emits a machine code plus parameters and never
 * user-facing prose. The app maps `(code, params)` to a localized string. See
 * the note on `Diagnostic` below.
 */
import { z } from 'zod';

import type { Zone } from '../state/gameState';
import type { RuleRef } from './ruleKey';

/**
 * The closed diagnostic vocabulary: exactly sixteen codes.
 *
 * These codes are stable FOREVER and they ARE the i18n message keys — every
 * one of them corresponds to a translated string in the app, so a code must
 * never be reused, and never renamed even if the rule it points at is
 * renumbered or rewritten. Renaming one silently breaks a translation into a
 * missing string at runtime; leaving the code stable turns the same change into
 * a compile error in the app's translation map, which is the whole reason the
 * engine emits codes instead of sentences.
 */
export const DiagnosticCodeSchema = z.enum([
  'CALL_COST_INSUFFICIENT',
  'ZONE_FULL',
  'ZONE_OCCUPIED',
  'ACTION_LIMIT_REACHED',
  'CARD_PLACED_THIS_TURN',
  'TARGET_OUT_OF_RANGE',
  'NOT_TURN_PLAYER',
  'HAND_LIMIT_EXCEEDED',
  'DECK_EMPTY',
  'UNIQUE_VIOLATION',
  'RULESET_STALE',
  'EFFECT_UNSUPPORTED',
  'EFFECT_UNEXECUTABLE',
  'ENGINE_UNKNOWN',
  /** Wrong priority-window actor (Counter Step/Phase alternation) — distinct from
   * `NOT_TURN_PLAYER`'s "wrong game-turn player". */
  'NOT_PRIORITY_ACTOR',
  /** A win condition (103.1) is already fulfilled, so the game has ended and no turn action
   * is accepted. */
  'GAME_OVER',
  /** An action that belongs to one phase (an ordinary Action CALL, 303.2.a.3.1.2) was
   * offered in another. */
  'NOT_ACTION_PHASE',
  /** A declared attack locks the battle process in (303.2.a.4.5): the action offered would
   * leave it. */
  'BATTLE_LOCKED',
  /** A Counter Step action was offered while no Counter Step is in the required state. The
   * diagnostic's params carry `reason`: 'no-battle' | 'not-open' | 'still-open'. */
  'COUNTER_STEP_STATE',
]);

/** One of the nineteen stable codes above. */
export type DiagnosticCode = z.infer<typeof DiagnosticCodeSchema>;

/**
 * One machine-readable reason a move was refused or flagged.
 *
 * There is deliberately NO prose field — no `message`, no `text`, no `title`.
 * Adding one would bake a single language into the engine and make the
 * bilingual product half-translated at the source: a citation path carrying an
 * English sentence cannot be rendered in Bahasa Indonesia without re-parsing
 * it. Callers that need words build them from `code` plus `params`, in the app,
 * where both languages exist.
 *
 * `ruleRefs` may be empty only for a `warning`; an `error` diagnostic without a
 * citation cannot reach a caller, because `reject()` — the only constructor for
 * a failing verdict — refuses to build one.
 */
export type Diagnostic = {
  readonly code: DiagnosticCode;
  readonly severity: 'error' | 'warning';
  /** At least one citation for `severity: 'error'` — enforced by `reject()`. */
  readonly ruleRefs: readonly RuleRef[];
  /** Values interpolated into the app's localized string for `code`. */
  readonly params: Readonly<Record<string, string | number>>;
  /** Where on the board the problem is, when the problem has a location. */
  readonly at?: {
    readonly player: 0 | 1;
    readonly zone?: Zone;
    readonly slot?: number;
    readonly iid?: number;
  };
};

/**
 * The result of validating an action.
 *
 * A discriminated union on `ok`, so a caller that handles the failure branch
 * necessarily narrows to the diagnostics, and a success carries nothing to
 * explain. Both branches carry the verdict-level `ruleRefs`: even a legal move
 * can be worth citing, and the failure branch needs at least one, which
 * `reject()` enforces.
 */
export type Verdict =
  | {
      readonly ok: true;
      readonly ruleRefs: readonly RuleRef[];
      readonly warnings: readonly Diagnostic[];
    }
  | {
      readonly ok: false;
      readonly ruleRefs: readonly RuleRef[];
      readonly diagnostics: readonly Diagnostic[];
    };

/**
 * The first error diagnostic that carries no citation, if there is one.
 *
 * Split out so the two throw paths in `reject()` read as two distinct rules
 * rather than one compound condition: an uncited *diagnostic* and an uncited
 * *verdict* are different authoring mistakes.
 */
const findUncitedError = (diagnostics: readonly Diagnostic[]): Diagnostic | undefined =>
  diagnostics.find((diagnostic) => diagnostic.severity === 'error' && diagnostic.ruleRefs.length === 0);

/**
 * Build a failing verdict. The ONLY way to do so.
 *
 * Throws when an `error` diagnostic is uncited, and again when the verdict's
 * own `ruleRefs` is empty even though every diagnostic is cited — the second
 * case is the one that catches a caller who cites the individual reasons but
 * forgets that the verdict as a whole must name its rule too.
 *
 * Both messages begin with `UNCITED_ERROR` and name the offending code, so a
 * test asserts on message content and a human reading a CI failure sees which
 * diagnostic was built wrong without re-running anything.
 *
 * `ENGINE_UNKNOWN` is the fallback name when the failing verdict carries no
 * error diagnostic at all — the failure is then the engine's own doing, and
 * saying so is more honest than blaming an arbitrary code.
 *
 * There is deliberately no `warnings` parameter: the failure branch of
 * `Verdict` carries `diagnostics` and nothing else, so a warning handed to a
 * rejection would have nowhere to go and would be dropped in silence. Flagging
 * something alongside a refusal means including it in `diagnostics` as a
 * `warning`-severity entry, where the caller can still see it.
 */
export function reject(
  diagnostics: readonly Diagnostic[],
  ruleRefs: readonly RuleRef[],
): Verdict {
  const uncited = findUncitedError(diagnostics);
  if (uncited) {
    throw new Error(
      `UNCITED_ERROR: ${uncited.code} — every error diagnostic must carry at least one RuleRef`,
    );
  }
  if (ruleRefs.length === 0) {
    const named = diagnostics.find((diagnostic) => diagnostic.severity === 'error')?.code ?? 'ENGINE_UNKNOWN';
    throw new Error(`UNCITED_ERROR: ${named} — a failing verdict must carry at least one RuleRef`);
  }
  return { ok: false, ruleRefs, diagnostics };
}

/**
 * Build a successful verdict.
 *
 * Present so callers never hand-write the success literal either: the shape of
 * a `Verdict` then has exactly one producer per branch, and a future change to
 * the shape is a change to two functions rather than a search across the
 * engine. `warnings` defaults to empty because the common legal move has
 * nothing to warn about.
 */
export function accept(
  ruleRefs: readonly RuleRef[],
  warnings: readonly Diagnostic[] = [],
): Verdict {
  return { ok: true, ruleRefs, warnings };
}
