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

/** The same revision as the plain string an `EffectIR.rulesVersion` carries. */
export const EFFECT_RULES_VERSION: string = EFFECT_RULES_REVISION;
