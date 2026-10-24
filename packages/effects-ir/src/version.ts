/**
 * The rules revision scripts are written against.
 *
 * An `EffectIR` carries the revision it was authored for, and the interpreter refuses one
 * that does not match this value instead of running a script that may no longer say what
 * the rules say. It is one constant so that moving to a new revision is a single edit plus
 * a pass over the scripts, never a hunt for string literals.
 */

import { asRuleRevision } from '@mhr/core';

/** The revision the engine's citations and scripts are currently read under. */
export const EFFECT_RULES_REVISION = asRuleRevision('1.03');

/**
 * The stamp an `EffectIR.rulesVersion` carries: the rules revision plus the script generation.
 *
 * The suffix marks the one-time move from scripts that covered a subset of the card pool to
 * scripts that cover the whole of it. The interpreter refuses an IR whose stamp differs, so a
 * script written before the move never runs under the new vocabulary. The rules revision itself
 * is unchanged, which keeps every citation and rule key as it was. A shared link stores no IR:
 * it replays by regenerating the IR from today's scripts, so an old link replays under the
 * current script semantics.
 */
export const EFFECT_RULES_VERSION: string = `${EFFECT_RULES_REVISION}+17.1`;
