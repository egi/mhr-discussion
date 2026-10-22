/**
 * Builders for the effect IR: one plain function per `EffectOp` kind.
 *
 * A card script is written by calling these. Each call returns a value; none reads or
 * writes a `GameState`, and none calls into the manual primitives. Turning a value into a
 * board change is the interpreter's job, one layer down, so a script can be type-checked,
 * serialised and inspected without ever running.
 *
 * Every function has an explicit return type of `EffectOp` (or the narrower value it
 * builds), so a drift between a builder and the frozen union is a compile error at the
 * builder, not a surprise at the interpreter.
 */

import type { CardColor, CardNo } from '@mhr/core';
import type {
  EffectArea,
  EffectCondition,
  EffectDeckEnd,
  EffectDestination,
  EffectDigRemainder,
  EffectFilter,
  EffectGrantableAbility,
  EffectIR,
  EffectMillDisposal,
  EffectOp,
  EffectRestriction,
  EffectScaleSource,
  EffectSettableStat,
  EffectSide,
  EffectStat,
  EffectStep,
  AttackerFilter,
  EffectTrigger,
  EffectTriggerEvent,
  EffectStepGate,
  EffectTarget,
} from './ir';
import { EFFECT_RULES_VERSION } from './version';

// --- selectors -------------------------------------------------------------------------------

/** A filter that constrains nothing. Spread it and override the fields a card names. */
export const ANY_CARD: EffectFilter = {
  color: null,
  lvMin: null,
  lvMax: null,
  powerMin: null,
  powerMax: null,
  feature: null,
  characterOnly: false,
  faceDown: null,
  exceptSource: false,
};

/** A filter over characters only, optionally narrowed. */
export function characters(narrow: Partial<EffectFilter> = {}): EffectFilter {
  return { ...ANY_CARD, characterOnly: true, ...narrow };
}

/** A filter over characters of one colour. */
export function colored(color: CardColor, narrow: Partial<EffectFilter> = {}): EffectFilter {
  return characters({ color, ...narrow });
}

/** The card the script belongs to. */
export function source(): EffectTarget {
  return { kind: 'source' };
}

/** The card the trigger or an earlier step already pinned down. */
export function subject(): EffectTarget {
  return { kind: 'subject' };
}

/** Exactly `count` matching cards ("1 of your red characters in BATTLE"). */
export function select(
  side: EffectSide,
  area: EffectArea,
  filter: EffectFilter,
  count = 1,
): EffectTarget {
  return { kind: 'selected', side, area, count, upTo: false, filter };
}

/** Up to `count` matching cards ("up to 2 ..."). */
export function selectUpTo(
  side: EffectSide,
  area: EffectArea,
  filter: EffectFilter,
  count: number,
): EffectTarget {
  return { kind: 'selected', side, area, count, upTo: true, filter };
}

/** Every matching card ("all of your ..."). */
export function selectAll(side: EffectSide, area: EffectArea, filter: EffectFilter): EffectTarget {
  return { kind: 'selected', side, area, count: null, upTo: false, filter };
}

// --- ops -------------------------------------------------------------------------------------

/** Change a stat by `delta` for this turn, optionally scaled by a counted quantity. */
export function statMod(
  target: EffectTarget,
  stat: EffectStat,
  delta: number,
  scaleBy: EffectScaleSource = 'none',
): EffectOp {
  return { kind: 'stat-mod', target, stat, delta, scaleBy, duration: 'this-turn' };
}

/** Shorthand for `statMod(target, 'power', delta)`: "gets Power+3000 in this turn". */
export function power(target: EffectTarget, delta: number): EffectOp {
  return statMod(target, 'power', delta);
}

/** Set R or Lv outright for this turn. */
export function statSet(target: EffectTarget, stat: EffectSettableStat, value: number): EffectOp {
  return { kind: 'stat-set', target, stat, value, duration: 'this-turn' };
}

/** Draw `count` cards. */
export function draw(side: EffectSide, count: number): EffectOp {
  return { kind: 'draw', side, count };
}

/** Discard the target from the HAND or DECK into the RETREAT. */
export function discard(target: EffectTarget): EffectOp {
  return { kind: 'discard', target };
}

/** Send cards from one end of a deck to the RETREAT or the VOID. */
export function mill(
  side: EffectSide,
  end: EffectDeckEnd,
  count: number,
  disposal: EffectMillDisposal,
): EffectOp {
  return { kind: 'mill', side, end, count, disposal };
}

/** Place the target into the VOID. */
export function prune(target: EffectTarget): EffectOp {
  return { kind: 'prune', target };
}

/** Retreat the target from the FIELD into the RETREAT. */
export function retreat(target: EffectTarget): EffectOp {
  return { kind: 'retreat', target };
}

/** Move the target to another area. */
export function relocate(target: EffectTarget, to: EffectDestination): EffectOp {
  return { kind: 'relocate', target, to };
}

/** Stack `card` underneath `host`. */
export function attach(card: EffectTarget, host: EffectTarget): EffectOp {
  return { kind: 'attach', card, host };
}

/** Cover the target. */
export function cover(target: EffectTarget): EffectOp {
  return { kind: 'cover', target };
}

/** Swap the positions of two cards. */
export function swap(a: EffectTarget, b: EffectTarget): EffectOp {
  return { kind: 'swap', a, b };
}

/** Look at the top `count` cards, take those matching `pick`, send the rest to `rest`. */
export function dig(
  side: EffectSide,
  count: number,
  pick: EffectFilter,
  rest: EffectDigRemainder,
): EffectOp {
  return { kind: 'dig', side, count, pick, rest };
}

/** Reveal the target. */
export function show(target: EffectTarget): EffectOp {
  return { kind: 'show', target };
}

/** Move the target between BATTLE and BASE. */
export function battleMove(target: EffectTarget): EffectOp {
  return { kind: 'battle-move', target };
}

/** Forbid the target from moving or attacking for the rest of the turn. */
export function restrict(target: EffectTarget, restriction: EffectRestriction): EffectOp {
  return { kind: 'restrict', target, restriction, duration: 'this-turn' };
}

/** Give the target a named ability for the rest of the turn. */
export function grantAbility(target: EffectTarget, ability: EffectGrantableAbility): EffectOp {
  return { kind: 'grant-ability', target, ability, duration: 'this-turn' };
}

/** One step of a sequence. */
export function step(op: EffectOp, gate: EffectStepGate = 'always'): EffectStep {
  return { gate, op };
}

/** A step that runs only if the previous step did something ("If you do, ..."). */
export function ifDone(op: EffectOp): EffectStep {
  return { gate: 'if-done', op };
}

/** Run steps in order. */
export function sequence(...steps: readonly EffectStep[]): EffectOp {
  return { kind: 'sequence', steps };
}

/** Run `then` when the condition holds, otherwise `otherwise` (or nothing). */
export function conditional(
  condition: EffectCondition,
  then: EffectOp,
  otherwise: EffectOp | null = null,
): EffectOp {
  return { kind: 'conditional', condition, then, otherwise };
}

/** "You may": the player chose to run the wrapped op by taking the action. */
export function optional(op: EffectOp): EffectOp {
  return { kind: 'optional', op };
}

// --- the script envelope ---------------------------------------------------------------------

/** Wrap an op as the IR of one card's effect, stamped with the current rules revision. */
export function effect(cardNo: CardNo, op: EffectOp, trigger?: EffectTrigger): EffectIR {
  return {
    cardNo,
    rulesVersion: EFFECT_RULES_VERSION,
    op,
    ...(trigger === undefined ? {} : { trigger }),
  };
}

/** Tag a script with the action outcome it fires on and the area its card must stand in. */
export function trigger(
  event: EffectTriggerEvent,
  area: EffectArea,
  attacker?: AttackerFilter,
): EffectTrigger {
  return attacker === undefined ? { event, area } : { event, area, attacker };
}
