/**
 * The effect IR: what a scripted card effect is, as data.
 *
 * A script never mutates the board. It emits a value of the types in this file, and an
 * interpreter decides whether that value can run against a given state. Nothing here
 * has runtime behaviour beyond a handful of const tables, and the file imports no React,
 * DOM or store code, so the vocabulary stays usable from Node, a Worker or a build script.
 *
 * ## Why these kinds
 *
 * The first 19 kinds are read off the literal English text of a 47-card pilot (TRIG, ACTI and
 * COUNTER-ACTI clauses, no AUTO text) recorded in `pilot.test.ts`, not imagined. That
 * file lists the kinds with their semantics and asserts that each one is exercised by a
 * real card. The kinds after `optional` were added from a survey of every unfinished effect
 * text; each is appended, never inserted, so a stored tag keeps its meaning. A new verb is a deliberate change to that evidence and to this union, never
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

/**
 * The engine action outcomes a script can be tagged with. Append-only: a stored tag must
 * keep its meaning.
 * - `enters-field-by-call`: the card was CALLed onto the field (a structural `call` action;
 *   a COUNTER CALL is the same action).
 * - `enters-field`: the card entered the field; today the engine can only express that as a
 *   CALL, so it fires on CALL only.
 * - `attacks`: the card was the attacker of a structural `attack`. An optional `attacker`
 *   filter on the trigger narrows which attacker counts ("when your red character attacks").
 * - `base-move`: a structural `base-move` where exactly one end is a BATTLE lane and the
 *   other is the BASE (301.24.a); BASE-to-BASE rearrangement does not count.
 * - `activate`: a player-initiated Activated Effect (201.10.f.2).
 * - `activate-counter`: a COUNTER-Activated Effect (201.10.f.3).
 *
 * The appended events fall in three groups. "Self" events name the carrier itself ("when this card
 * enters RETREAT"). "Seat" events are seen by every face-up card of one seat standing in the tag's
 * area ("when your opponent's character enters the field"); the optional `subject` filter narrows
 * which character counts. Turn events (`turn-starts`, `opponent-turn-starts`, `turn-ends`) have no
 * event card. `power-increases`, `power-decreases` and `would-be-attached` are named so a script can
 * be tagged, but the engine has no Power-change record or pre-attach window to emit them from.
 */
export const EFFECT_TRIGGER_EVENTS = [
  'enters-field-by-call',
  'enters-field',
  'attacks',
  'base-move',
  'activate',
  'activate-counter',
  // Appended after the first six; a stored tag keeps its meaning, so none of these is reordered.
  'attacks-weakness-successfully',
  'both-lose',
  'card-moved-to-deck-bottom',
  'enters-field-by-effect',
  'enters-field-from-retreat',
  'enters-retreat-by-call',
  'enters-retreat-by-discard-effect',
  'enters-retreat-by-losing-fight',
  'enters-retreat-from-field',
  'enters-retreat-from-field-by-effect',
  'follows-host-to-retreat',
  'host-attacks',
  'is-attacked',
  'opponent-base-move',
  'opponent-character-attacks',
  'opponent-character-enters-field',
  'opponent-character-enters-field-by-effect',
  'opponent-set-card-in-base-increases',
  'opponent-turn-starts',
  'own-character-attacked',
  'own-character-enters-field',
  'own-character-enters-retreat',
  'own-character-enters-retreat-by-losing-fight',
  'own-character-enters-void',
  'own-character-loses-fight',
  'own-weakness-attacked',
  'power-decreases',
  'power-increases',
  'this-card-attached',
  'this-card-enters-void',
  'turn-ends',
  'turn-starts',
  'wins-fight',
  'wins-fight-by-attacking',
  'would-be-attached',
] as const;
export type EffectTriggerEvent = (typeof EFFECT_TRIGGER_EVENTS)[number];

/**
 * When a script fires on its own: the event, and the Effect Location the card must stand in
 * when the event happens (201.10.d.2).
 */
export type EffectTrigger = {
  readonly event: EffectTriggerEvent;
  readonly area: EffectArea;
  /**
   * Narrows which attacker fires an `attacks` trigger. Append-only: left out when the text
   * does not ask for it, so a tag written before this field existed reads and hashes the
   * same. Valid only on the `attacks` event.
   */
  readonly attacker?: AttackerFilter | undefined;
  /**
   * Narrows which character an appended seat event counts ("your blue character", "an opponent
   * character with Lv4 or above"). Append-only and optional, so a tag written before it existed
   * reads and hashes the same. Not valid on `attacks` (which has `attacker`) or the two
   * activation events.
   */
  readonly subject?: TriggerSubjectFilter | undefined;
};

/**
 * Which character a seat event counts. Every present key must hold of the event's character;
 * colour, Lv and feature are the printed values, `lane` is where it stands when the event happens.
 */
export type TriggerSubjectFilter = {
  readonly color?: CardColor | undefined;
  readonly feature?: string | undefined;
  /** Printed Lv equal to this. */
  readonly level?: number | undefined;
  readonly levelAtLeast?: number | undefined;
  readonly levelAtMost?: number | undefined;
  readonly lane?: 'FRONT' | 'WING' | 'BACK' | undefined;
};

/**
 * Which attacker counts for an `attacks` trigger. `controller: 'self'` means the attacker
 * belongs to the same player as the card carrying the script; `color` is matched against the
 * attacker's printed colour. `feature`, when present, must equal one of the attacker's printed
 * traits (the feature field split on "/"); append-only, so absent means no feature requirement
 * and earlier tags read and hash as before.
 */
export type AttackerFilter = {
  readonly controller: 'self';
  readonly color?: CardColor | undefined;
  readonly feature?: string | undefined;
};

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
  // Appended after the first five; a stored tag keeps its meaning.
  'abilities-on-opponent-battle',
  'attached-cards-of-source',
  'cards-in-hand',
  'non-attacking-own-characters',
  'opponent-characters-on-wing',
  'opponent-front-power-per-3000',
  'original-r-of-host',
  'own-characters-in-battle-matching',
  'own-characters-in-field-matching',
  'own-characters-in-retreat-matching',
  'own-characters-with-original-power-500-in-battle',
  'power-increase-value',
  'power-of-selected-card',
  'pruned-lv-total',
  'retreated-card-count',
  'retreated-lv-total',
  'set-cards-in-base',
  'source-lv',
  'target-attached-cards-matching',
  'total-power-own-battle',
] as const;
export type EffectScaleSource = (typeof EFFECT_SCALE_SOURCES)[number];

/**
 * The names a pick can be bound to inside one effect ("pick A", "pick B"). Append-only: a
 * stored name keeps its meaning.
 */
export const EFFECT_PICK_NAMES = ['A', 'B'] as const;
export type EffectPickName = (typeof EFFECT_PICK_NAMES)[number];

/** What a restriction forbids for the rest of the turn. */
export const EFFECT_RESTRICTIONS = [
  'move',
  'attack',
  // Appended: the prevention-shaped restrictions a card can carry.
  /** The card cannot be affected by the effect of a character at or under `limit.lv`. */
  'affected-by-effects',
  /** The host can attack only the lane or Lv named by `limit`. */
  'attack-target',
  /** The card is not retreated by Both Lose. */
  'retreat-by-both-lose',
  /** The player cannot retreat the named character to pay a CALL cost. */
  'retreat-to-call',
] as const;
export type EffectRestriction = (typeof EFFECT_RESTRICTIONS)[number];

/** The lanes an `attack-target` restriction can name. */
export const EFFECT_RESTRICTION_LANES = ['FRONT', 'WING', 'BACK'] as const;
export type EffectRestrictionLane = (typeof EFFECT_RESTRICTION_LANES)[number];

/**
 * The operand of a restriction that needs one: a Lv bound ("Lv6 only", "Lv4 or below") and/or a
 * lane ("FRONT only"). `null` means the restriction does not name that part.
 */
export type RestrictionLimit = {
  readonly lv: number | null;
  readonly lane: EffectRestrictionLane | null;
};

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
  /**
   * Keeps cards whose name contains this text, ignoring case ("characters with Ultron in their
   * names"). A character's name is all the text in it (201.7.b). Left out when the text does not
   * ask for a name, so a filter written before this field existed reads and hashes the same.
   */
  readonly nameIncludes?: string | undefined;
  /**
   * Drops cards whose name contains this text, ignoring case ("without Wasp in its name").
   * Append-only, like `nameIncludes`.
   */
  readonly nameExcludes?: string | undefined;
  /**
   * Requires a name different from the effect's own card (`source`) or from the cards picked
   * earlier in the same effect (`selected`). Append-only.
   */
  readonly differentNameFrom?: 'source' | 'selected' | undefined;
  /** Requires the same name as a card picked earlier in the same effect. Append-only. */
  readonly sameNameAsSelected?: boolean | undefined;
  /** Which bound pick `sameNameAsSelected` and `lvOffsetFromSelected` read; pick A when left out. Append-only. */
  readonly ref?: EffectPickName | undefined;
  /** Requires the same Lv as a card shown earlier in the same effect. Append-only. */
  readonly lvSameAsRevealed?: boolean | undefined;
  /** Requires Lv equal to the Lv of a card picked earlier plus this offset ("Lv X+1"). Append-only. */
  readonly lvOffsetFromSelected?: number | undefined;
  /** One card per side with the same Lv ("1 of each player's characters with the same Lv"). Append-only. */
  readonly equalLvAcrossSides?: boolean | undefined;
  /** Keeps only the candidates with the highest or lowest value of a stat. Append-only. */
  readonly extreme?: { readonly stat: 'lv' | 'power'; readonly which: 'highest' | 'lowest' } | undefined;
  /** Lv ceiling (`max`) or exact Lv (`exact`) equal to a counted quantity X. Append-only. */
  readonly lvBy?: { readonly mode: 'max' | 'exact'; readonly source: EffectScaleSource } | undefined;
  /** Keeps only characters with no effects (vanilla). Append-only. */
  readonly noEffects?: boolean | undefined;
  /** Lv, Power and R bounds read the printed (original) value. Append-only. */
  readonly original?: boolean | undefined;
  /** Keeps only cards that have an AUTO effect in their text. Append-only. */
  readonly hasAutoEffect?: boolean | undefined;
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
      /**
       * The card is picked at random; the pick travels in the action so a replay is the same.
       * Append-only: left out for a chosen pick.
       */
      readonly random?: boolean | undefined;
      /**
       * Binds the picked card to a name so a later `named` target, reference facet or
       * `scaleFrom` can refer to it. Append-only: left out for an unnamed pick.
       */
      readonly bind?: EffectPickName | undefined;
    }
  /** The character the source card is attached to ("the character this card is attached to"). */
  | { readonly kind: 'host-of-source' }
  /** The card an earlier `selected` target bound to `name`. Append-only. */
  | { readonly kind: 'named'; readonly name: EffectPickName };

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
  | { readonly kind: 'subject-matches'; readonly filter: EffectFilter }
  // Appended below: each is named in the survey with the cards that print it.
  /** The attack target matches the filter, optionally with more Power than the source. */
  | {
      readonly kind: 'attack-target-matches';
      readonly filter: EffectFilter;
      readonly powerAboveSource: boolean;
    }
  /** The controller has any Weakness. */
  | { readonly kind: 'have-weakness' }
  /** The character the source is attached to did not attack this turn. */
  | { readonly kind: 'host-did-not-attack' }
  /** The controller has more set (face-down) cards in BASE than the opponent. */
  | { readonly kind: 'more-set-cards-than-opponent' }
  /** The controller did not call a character this turn. */
  | { readonly kind: 'no-call-this-turn' }
  /** The source card's owner is the opponent (a card the opponent took control of). */
  | { readonly kind: 'owner-is-opponent' }
  /** The previous step retreated its target. */
  | { readonly kind: 'previous-step-retreated' }
  /** The controller's set cards in BASE equal their characters in BASE. */
  | { readonly kind: 'set-equals-character-count-in-base' }
  /** The attack target was attacked earlier this turn. */
  | { readonly kind: 'target-attacked-before' }
  /** The card just shown from the top of the deck matches the filter. */
  | { readonly kind: 'top-card-matches'; readonly filter: EffectFilter }
  /** The total Lv of the controller's BATTLE characters is lower than the opponent's. */
  | { readonly kind: 'total-lv-lower-than-opponent' };

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
      /**
       * Scales `delta` by a stat of a bound pick ("Power+X where X is the pruned card's
       * Power"). Used together with `scaleBy: 'none'`. Append-only.
       */
      readonly scaleFrom?: { readonly name: EffectPickName; readonly stat: 'power' | 'lv' | 'r' } | undefined;
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
      /** Operand of `affected-by-effects` and `attack-target`. Append-only: left out when unused. */
      readonly limit?: RestrictionLimit | undefined;
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
  | { readonly kind: 'optional'; readonly op: EffectOp }
  // Appended below, in survey order. Existing kinds above keep their position.
  /** Retreat all (or one) of the cards attached to `host`, optionally except the source. */
  | {
      readonly kind: 'retreat-attached-of-host';
      readonly host: EffectTarget;
      readonly scope: 'all' | 'one';
      readonly exceptSource: boolean;
    }
  /** Show the top `count` cards, put some back on top in the chosen order and the rest at the bottom. */
  | { readonly kind: 'rearrange-deck-top'; readonly side: EffectSide; readonly count: number }
  /** The player with fewer characters in BATTLE draws `count`. */
  | { readonly kind: 'draw-by-board-comparison'; readonly count: number }
  /** Flip face-down or face-up cards in BASE. */
  | { readonly kind: 'flip'; readonly target: EffectTarget; readonly faceDown: boolean }
  /** Change the target of the attack in progress. */
  | { readonly kind: 'retarget-attack'; readonly target: EffectTarget }
  /** Skip the controller's Battle Phase this turn. */
  | { readonly kind: 'skip-phase'; readonly phase: 'battle'; readonly duration: 'this-turn' }
  /** Give the target the second chance to attack (not a named ability of rule 305). */
  | {
      readonly kind: 'grant-second-chance-attack';
      readonly target: EffectTarget;
      readonly duration: 'this-turn';
    }
  /** The target gets the effects of one of its attached cards this turn. */
  | {
      readonly kind: 'copy-attached-effects';
      readonly target: EffectTarget;
      readonly duration: 'this-turn';
    };

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
  'retreat-attached-of-host',
  'rearrange-deck-top',
  'draw-by-board-comparison',
  'flip',
  'retarget-attack',
  'skip-phase',
  'grant-second-chance-attack',
  'copy-attached-effects',
] as const satisfies readonly EffectOp['kind'][];

const everyKindListed: [Exclude<EffectOp['kind'], (typeof EFFECT_OP_KINDS)[number]>] extends [never]
  ? true
  : never = true;
void everyKindListed;

/** Every condition kind, in vocabulary order. A kind missing from this list is a compile error. */
export const EFFECT_CONDITION_KINDS = [
  'have',
  'fewer-than-opponent',
  'source-did-not-attack',
  'subject-matches',
  'attack-target-matches',
  'have-weakness',
  'host-did-not-attack',
  'more-set-cards-than-opponent',
  'no-call-this-turn',
  'owner-is-opponent',
  'previous-step-retreated',
  'set-equals-character-count-in-base',
  'target-attacked-before',
  'top-card-matches',
  'total-lv-lower-than-opponent',
] as const satisfies readonly EffectCondition['kind'][];

const everyConditionListed: [
  Exclude<EffectCondition['kind'], (typeof EFFECT_CONDITION_KINDS)[number]>,
] extends [never]
  ? true
  : never = true;
void everyConditionListed;

/** Every target kind, in vocabulary order. */
export const EFFECT_TARGET_KINDS = [
  'source',
  'subject',
  'selected',
  'host-of-source',
  'named',
] as const satisfies readonly EffectTarget['kind'][];

const everyTargetListed: [Exclude<EffectTarget['kind'], (typeof EFFECT_TARGET_KINDS)[number]>] extends [
  never,
]
  ? true
  : never = true;
void everyTargetListed;

/**
 * The optional facets of an `EffectFilter`, in the order they were added. The nine required
 * fields are not listed: they cannot be left out. A facet missing from this list is a compile
 * error.
 */
export const EFFECT_FILTER_FACETS = [
  'nameIncludes',
  'nameExcludes',
  'differentNameFrom',
  'sameNameAsSelected',
  'lvSameAsRevealed',
  'lvOffsetFromSelected',
  'equalLvAcrossSides',
  'extreme',
  'lvBy',
  'noEffects',
  'original',
  'hasAutoEffect',
  'ref',
] as const satisfies readonly (keyof EffectFilter)[];

const everyFacetListed: [
  Exclude<
    keyof EffectFilter,
    | (typeof EFFECT_FILTER_FACETS)[number]
    | 'color'
    | 'lvMin'
    | 'lvMax'
    | 'powerMin'
    | 'powerMax'
    | 'feature'
    | 'characterOnly'
    | 'faceDown'
    | 'exceptSource'
  >,
] extends [never]
  ? true
  : never = true;
void everyFacetListed;

/**
 * A scripted effect: the card it belongs to, the rules revision it was written against,
 * and the op it runs.
 */
export type EffectIR = {
  readonly cardNo: CardNo;
  readonly rulesVersion: string;
  readonly op: EffectOp;
  /**
   * ABSENT means the timing is not modelled and the effect is manual only. Event values are
   * append-only.
   */
  readonly trigger?: EffectTrigger | undefined;
  /**
   * Set by the script when the printed text says ONCE PER TURN; the engine refuses a second
   * start in the same turn on the declared path. Absent otherwise.
   *
   * Precondition: the use record is kept by the settle-step prune only while the source card is
   * on the FIELD (FIELD zones plus Characters attached under a FIELD card; BACK counts as FIELD),
   * so once-per-turn is enforced only for a source that sits on the FIELD when started. A flagged
   * IR started from HAND does not keep its record.
   */
  readonly oncePerTurn?: true | undefined;
};

/** An authored card script: a pure function producing the card's effect IR. */
export type CardScript = () => EffectIR;
