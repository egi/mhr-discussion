/**
 * The effect IR: what a scripted card effect is, as data.
 *
 * A script never mutates the board. It emits a value of the types in this file, and an
 * interpreter decides whether that value can run against a given state. Nothing here
 * has runtime behaviour beyond a handful of const tables, and the file imports no React,
 * DOM or store code, so the vocabulary stays usable from Node, a Worker or a build script.
 *
 * ## Why 19 kinds
 *
 * The vocabulary is read off the literal English text of a 47-card pilot (TRIG, ACTI and
 * COUNTER-ACTI clauses, no AUTO text) recorded in `pilot.test.ts`, not imagined. That
 * file lists the kinds with their semantics and asserts that each one is exercised by a
 * real card. A new verb is a deliberate change to that evidence and to this union, never
 * something a single card script can introduce on its own.
 *
 * ## Why closed
 *
 * `EffectOp` is a discriminated union on `kind`, and the interpreter's `switch` over it is
 * exhaustive, so a kind that is not handled is a compile error. No variant has a card-name
 * field or a free-text matcher: a target is a side, an area and a filter over the card
 * facts the rules actually use (colour, Lv, Power, feature, face-down). That makes
 * `if (card.name === ...)` unrepresentable rather than merely discouraged. A card whose
 * text needs a name match, or any other shape the vocabulary lacks, has no script; it
 * falls back to the manual path and stays fully playable.
 *
 * Every numeric change carries a `duration`, and the only duration is `this-turn`.
 * Anything that lasts longer or depends on a continuing condition is a continuous effect,
 * which this vocabulary deliberately does not model.
 *
 * ## `rulesVersion`
 *
 * An `EffectIR` records the rules revision its script was written against. The
 * interpreter compares it with the engine's current revision and refuses a mismatch as
 * stale instead of running a script that may no longer say what the rules say.
 */

import type { EditTarget, CardColor, CardNo, Ability } from '@mhr/core';

/** Which seat a selector or an effect refers to, relative to the effect's controller. */
export const EFFECT_SIDES = ['self', 'opponent'] as const;
export type EffectSide = (typeof EFFECT_SIDES)[number];

/**
 * The areas card text names, kept as the printed words rather than expanded into zones,
 * so a script reads like the card it implements. Resolving a word to board zones is the
 * interpreter's job.
 */
export const EFFECT_AREAS = [
  'FIELD',
  'BATTLE',
  'FRONT',
  'WING',
  'BACK',
  'BASE',
  'HAND',
  'DECK',
  'RETREAT',
  'VOID',
  'ATTACHED',
] as const;
export type EffectArea = (typeof EFFECT_AREAS)[number];

/** Where a relocated card can end up. The deck is addressed by end, as the text does. */
export const EFFECT_DESTINATION_AREAS = [
  'FIELD',
  'BATTLE',
  'FRONT',
  'WING',
  'BACK',
  'BASE',
  'HAND',
  'DECK-TOP',
  'DECK-BOTTOM',
  'RETREAT',
  'VOID',
] as const;
export type EffectDestinationArea = (typeof EFFECT_DESTINATION_AREAS)[number];

/** The three numbers an effect can change: Power, R and Lv. */
export const EFFECT_STATS = ['power', 'r', 'lv'] as const;
export type EffectStat = (typeof EFFECT_STATS)[number];

/** The stats a "changes to N" effect sets outright. Power is only ever modified. */
export const EFFECT_SETTABLE_STATS = ['r', 'lv'] as const satisfies readonly EffectStat[];
export type EffectSettableStat = (typeof EFFECT_SETTABLE_STATS)[number];

/**
 * What an "X is ..." clause counts, as a closed set. `none` means the delta is used as
 * written; any other source multiplies `delta` by the counted quantity, so "Power+X000"
 * is `delta: 1000` scaled by the source and "Power-X" is `delta: -1`.
 */
export const EFFECT_SCALE_SOURCES = [
  'none',
  'self-power',
  'characters-in-void',
  'opponent-characters-in-battle',
  'discarded-lv-total',
] as const;
export type EffectScaleSource = (typeof EFFECT_SCALE_SOURCES)[number];

/** What a restriction forbids for the rest of the turn. */
export const EFFECT_RESTRICTIONS = ['move', 'attack'] as const;
export type EffectRestriction = (typeof EFFECT_RESTRICTIONS)[number];

/** The named abilities an effect can hand out. Drawn from Rule 305, never extended here. */
export const EFFECT_GRANTABLE_ABILITIES = [
  'BLOCK',
  'DOUBLE ATTACK',
  'ASSAULT',
  'AIR-ATTACK',
] as const satisfies readonly Ability[];
export type EffectGrantableAbility = (typeof EFFECT_GRANTABLE_ABILITIES)[number];

/** Which end of a deck an effect works on. */
export const EFFECT_DECK_ENDS = ['top', 'bottom'] as const;
export type EffectDeckEnd = (typeof EFFECT_DECK_ENDS)[number];

/** What happens to milled cards: `discard` sends them to RETREAT, `prune` to VOID. */
export const EFFECT_MILL_DISPOSALS = ['discard', 'prune'] as const;
export type EffectMillDisposal = (typeof EFFECT_MILL_DISPOSALS)[number];

/** What happens to the cards a `dig` did not pick. */
export const EFFECT_DIG_REMAINDERS = ['discard', 'prune', 'bottom'] as const;
export type EffectDigRemainder = (typeof EFFECT_DIG_REMAINDERS)[number];

/** Whether a sequence step runs unconditionally or only if the previous step was done. */
export const EFFECT_STEP_GATES = ['always', 'if-done'] as const;
export type EffectStepGate = (typeof EFFECT_STEP_GATES)[number];

/**
 * A resolved board address, exactly what the manual primitives accept. An effect's
 * relative selectors are turned into these by the interpreter once it knows who controls
 * the effect and which cards are on the board. `EditTarget` stays the source of truth
 * for the shape.
 */
export type ResolvedTarget = EditTarget;

/**
 * Which cards a selector may pick, over the facts the rules use. Every field is required
 * and `null` means "no constraint", so a filter is always one flat literal and a missing
 * field is a type error rather than a silent wildcard. There is deliberately no name
 * field. `feature` is a trait such as `Human`, taken from the card's features.
 */
export type EffectFilter = {
  readonly color: CardColor | null;
  readonly lvMin: number | null;
  readonly lvMax: number | null;
  readonly powerMin: number | null;
  readonly powerMax: number | null;
  readonly feature: string | null;
  /** `true` restricts to characters, `false` allows any card ("cards" rather than "characters"). */
  readonly characterOnly: boolean;
  /** `true` only face-down ("set") cards, `false` only face-up, `null` either. */
  readonly faceDown: boolean | null;
  /** Excludes the effect's own card ("except this card"). */
  readonly exceptSource: boolean;
};

/**
 * What an op acts on.
 *
 * `source` is the card the script belongs to. `subject` is the card the effect's trigger
 * or an earlier step already pinned down ("that character", "its target"). `selected`
 * picks cards by side, area and filter; `count: null` means every match ("all"), and
 * `upTo` allows fewer than `count` ("up to 3").
 */
export type EffectTarget =
  | { readonly kind: 'source' }
  | { readonly kind: 'subject' }
  | {
      readonly kind: 'selected';
      readonly side: EffectSide;
      readonly area: EffectArea;
      readonly count: number | null;
      readonly upTo: boolean;
      readonly filter: EffectFilter;
    };

/** Where a relocated card goes, and whether it lands face down. */
export type EffectDestination = {
  readonly side: EffectSide;
  readonly area: EffectDestinationArea;
  readonly faceDown: boolean;
};

/** The closed set of conditions an effect can test. */
export type EffectCondition =
  /** The side has between `min` and `max` matching cards in the area (`max: null` is no upper bound). */
  | {
      readonly kind: 'have';
      readonly side: EffectSide;
      readonly area: EffectArea;
      readonly filter: EffectFilter;
      readonly min: number;
      readonly max: number | null;
    }
  /** The controller has fewer matching cards in the area than the opponent. */
  | {
      readonly kind: 'fewer-than-opponent';
      readonly area: EffectArea;
      readonly filter: EffectFilter;
    }
  /** The effect's own card did not attack this turn. */
  | { readonly kind: 'source-did-not-attack' }
  /** The subject card matches the filter. */
  | { readonly kind: 'subject-matches'; readonly filter: EffectFilter };

/** One step of a sequence. */
export type EffectStep = {
  readonly gate: EffectStepGate;
  readonly op: EffectOp;
};

/**
 * The closed verb vocabulary. Every variant is a flat object literal discriminated only
 * on `kind`; none carries a card name or free text.
 */
export type EffectOp =
  | {
      readonly kind: 'stat-mod';
      readonly target: EffectTarget;
      readonly stat: EffectStat;
      readonly delta: number;
      readonly scaleBy: EffectScaleSource;
      readonly duration: 'this-turn';
    }
  | {
      readonly kind: 'stat-set';
      readonly target: EffectTarget;
      readonly stat: EffectSettableStat;
      readonly value: number;
      readonly duration: 'this-turn';
    }
  | { readonly kind: 'draw'; readonly side: EffectSide; readonly count: number }
  | { readonly kind: 'discard'; readonly target: EffectTarget }
  | {
      readonly kind: 'mill';
      readonly side: EffectSide;
      readonly end: EffectDeckEnd;
      readonly count: number;
      readonly disposal: EffectMillDisposal;
    }
  | { readonly kind: 'prune'; readonly target: EffectTarget }
  | { readonly kind: 'retreat'; readonly target: EffectTarget }
  | {
      readonly kind: 'relocate';
      readonly target: EffectTarget;
      readonly to: EffectDestination;
    }
  | { readonly kind: 'attach'; readonly card: EffectTarget; readonly host: EffectTarget }
  | { readonly kind: 'cover'; readonly target: EffectTarget }
  | { readonly kind: 'swap'; readonly a: EffectTarget; readonly b: EffectTarget }
  | {
      readonly kind: 'dig';
      readonly side: EffectSide;
      readonly count: number;
      readonly pick: EffectFilter;
      readonly rest: EffectDigRemainder;
    }
  | { readonly kind: 'show'; readonly target: EffectTarget }
  | { readonly kind: 'battle-move'; readonly target: EffectTarget }
  | {
      readonly kind: 'restrict';
      readonly target: EffectTarget;
      readonly restriction: EffectRestriction;
      readonly duration: 'this-turn';
    }
  | {
      readonly kind: 'grant-ability';
      readonly target: EffectTarget;
      readonly ability: EffectGrantableAbility;
      readonly duration: 'this-turn';
    }
  | { readonly kind: 'sequence'; readonly steps: readonly EffectStep[] }
  | {
      readonly kind: 'conditional';
      readonly condition: EffectCondition;
      readonly then: EffectOp;
      readonly otherwise: EffectOp | null;
    }
  | { readonly kind: 'optional'; readonly op: EffectOp };

/** Every op kind, in vocabulary order. A kind missing from this list is a compile error. */
export const EFFECT_OP_KINDS = [
  'stat-mod',
  'stat-set',
  'draw',
  'discard',
  'mill',
  'prune',
  'retreat',
  'relocate',
  'attach',
  'cover',
  'swap',
  'dig',
  'show',
  'battle-move',
  'restrict',
  'grant-ability',
  'sequence',
  'conditional',
  'optional',
] as const satisfies readonly EffectOp['kind'][];

const everyKindListed: [Exclude<EffectOp['kind'], (typeof EFFECT_OP_KINDS)[number]>] extends [never]
  ? true
  : never = true;
void everyKindListed;

/**
 * A scripted effect: the card it belongs to, the rules revision it was written against,
 * and the op it runs.
 */
export type EffectIR = {
  readonly cardNo: CardNo;
  readonly rulesVersion: string;
  readonly op: EffectOp;
};

/** An authored card script: a pure function producing the card's effect IR. */
export type CardScript = () => EffectIR;
