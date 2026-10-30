/**
 * AUTO effect data: the vocabulary a scripted continuous stat change is written in.
 *
 * Types and constant tables only. Nothing here imports React, the DOM, a store or the
 * interpreter, so the table of scripted cards can be read from Node, a test, or a worker.
 *
 * ## Conventions a script author relies on
 *
 * - An effect's ordinal is its index in `AutoScript.effects`. Ordinals become wire-visible
 *   once a player's chosen order of simultaneous AUTOs is stored, so a card's effects are
 *   append-only: never reorder or remove one.
 * - `clause` is the zero-based index among the card's printed text lines that begin with the
 *   word AUTO, which ties each effect back to the sentence it implements.
 * - A stat change (Lv / R / Power plus, minus, change-to, optionally scaled by a counted
 *   quantity or copied from another stat) is `AutoEffect`. The other things an AUTO can do are
 *   separate forms, each with its own `form` discriminant: `grant` (an ability), `restrict`,
 *   `lose-effects` and `reduce` (how Power-reductions apply). A form is appended, never an
 *   optional field of an older one, so a script written before it existed reads the same.
 *   UNIQUE-style AUTOs and the distance-set AUTO stay on the manual path; an unscripted card is
 *   fully playable.
 * - A condition may read an EFFECTIVE (clamped) stat of the cards in an area (`stat-is`). That
 *   is why `derive` iterates: the set of applying AUTOs is re-evaluated against the stats the
 *   previous pass produced until it stops changing. Attached cards are not counted as the
 *   character standing in an area; the placed character is.
 */

import type { CardNo, Phase } from '@mhr/core';
import type {
  EffectArea,
  EffectFilter,
  EffectGrantableAbility,
  EffectSide,
  EffectStat,
  EffectRestrictionLane,
} from './ir';

/**
 * Where a card has to be standing for its AUTO to apply. `FIELD` is the BATTLE lanes plus the
 * BASE, `BATTLE` is the three lanes, the rest name one area exactly.
 */
export const AUTO_LOCATIONS = ['FIELD', 'BATTLE', 'FRONT', 'WING', 'BACK', 'BASE', 'HAND'] as const;
export type AutoLocation = (typeof AUTO_LOCATIONS)[number];

/** The sub-rule letters of 301.41, which orders the application of simultaneous AUTO effects. */
export const RULE_301_41_LETTERS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
] as const;
export type Rule301_41Letter = (typeof RULE_301_41_LETTERS)[number];

/**
 * Whose stat a quantity reads. `placed` is the face-up character standing in an area (the
 * `index`-th one, in board order, for an area with two such as WING); `target` is the card the
 * change lands on.
 */
export type AutoStatSubject =
  | { readonly kind: 'source' }
  | { readonly kind: 'host' }
  | { readonly kind: 'target' }
  | {
      readonly kind: 'placed';
      readonly side: EffectSide;
      readonly area: EffectArea;
      readonly filter: EffectFilter;
      readonly index: number;
    };

/**
 * A number read off the board: the "X" of "X is the number of ...", a side of a comparison, or
 * the operand of a cross-stat change. Always an integer; a quantity that cannot be read (the
 * subject is not on the board) makes the AUTO not apply.
 */
export type AutoQuantity =
  | { readonly kind: 'literal'; readonly value: number }
  /** Cards matching `filter` in the area (`filter.exceptSource` leaves out this card). */
  | {
      readonly kind: 'count';
      readonly side: EffectSide;
      readonly area: EffectArea;
      readonly filter: EffectFilter;
    }
  /** The cards attached to the AUTO's own card. */
  | { readonly kind: 'attached-of-source' }
  /** The cards attached to the character this card is attached to. */
  | { readonly kind: 'attached-of-host' }
  /** The cards attached to the card the change lands on, matching `filter`. */
  | { readonly kind: 'attached-of-target'; readonly filter: EffectFilter }
  /** A stat of one card; `original` reads the printed value instead of the effective one. */
  | {
      readonly kind: 'stat-of';
      readonly of: AutoStatSubject;
      readonly stat: EffectStat;
      readonly original: boolean;
    }
  /** The sum of a stat over the matching cards in an area (effective values). */
  | {
      readonly kind: 'total-stat';
      readonly side: EffectSide;
      readonly area: EffectArea;
      readonly filter: EffectFilter;
      readonly stat: EffectStat;
    }
  /** The abilities the face-up characters in the area print, counted with repeats. */
  | { readonly kind: 'abilities-in-area'; readonly side: EffectSide; readonly area: EffectArea };

/**
 * How a stat moves: by a signed amount, to a fixed value, by an amount scaled by a counted
 * quantity (`per * floor(quantity / divisor)`), or to a counted quantity (which is also how one
 * stat is copied from another: "the Lv of this card changes to the R of this card").
 */
export type AutoChange =
  | { readonly kind: 'add'; readonly delta: number }
  | { readonly kind: 'set'; readonly value: number }
  | {
      readonly kind: 'add-scaled';
      readonly per: number;
      readonly quantity: AutoQuantity;
      /** Defaults to 1; 3000 reads "for every 3000 Power". */
      readonly divisor?: number;
    }
  | { readonly kind: 'set-quantity'; readonly quantity: AutoQuantity };

/** An `AutoChange` once its quantity has been read: what is actually folded into a stat. */
export type AutoResolvedChange = Extract<AutoChange, { readonly kind: 'add' | 'set' }>;

/** Which cards a stat change lands on. */
export type AutoTarget =
  | { readonly kind: 'self' }
  | { readonly kind: 'host' }
  /** The character this card is attached to and every card attached to that character. */
  | { readonly kind: 'host-and-attached' }
  | {
      readonly kind: 'selected';
      readonly side: EffectSide;
      readonly area: EffectArea;
      readonly filter: EffectFilter;
    };

/** When an effect applies, beyond where its card stands. */
export type AutoCondition =
  | { readonly kind: 'always' }
  | {
      readonly kind: 'have';
      readonly side: EffectSide;
      readonly area: EffectArea;
      readonly filter: EffectFilter;
      readonly min: number;
      readonly max: number | null;
    }
  | {
      readonly kind: 'stat-is';
      readonly side: EffectSide;
      readonly area: EffectArea;
      readonly filter: EffectFilter;
      readonly stat: EffectStat;
      readonly value: number;
    }
  // Appended below.
  /**
   * "You have only ...": every character standing in the area passes `filter`, and there is at
   * least one (an empty area is not "only X"; no ruling covers it). `count` demands exactly that
   * many characters, `thisCard` demands that the one character is this card.
   */
  | {
      readonly kind: 'only';
      readonly side: EffectSide;
      readonly area: EffectArea;
      readonly filter: EffectFilter;
      readonly count: number | null;
      readonly thisCard: boolean;
    }
  /** The turn and phase: `turn` is relative to the AUTO's controller; `phase: null` is any phase. */
  | {
      readonly kind: 'phase';
      readonly turn: 'own' | 'opponent' | 'any';
      readonly phase: Phase | null;
    }
  /** Two counted quantities compare; `odd` / `even` read the left one alone. */
  | {
      readonly kind: 'compare';
      readonly left: AutoQuantity;
      readonly op: 'eq' | 'ne' | 'gte' | 'lte' | 'odd' | 'even';
      readonly right: AutoQuantity;
    }
  /** The character this card is attached to passes `filter`. */
  | { readonly kind: 'host-matches'; readonly filter: EffectFilter }
  /** The character standing in the area has a different colour from this card. */
  | { readonly kind: 'color-differs'; readonly side: EffectSide; readonly area: EffectArea }
  | { readonly kind: 'all'; readonly of: readonly AutoCondition[] }
  | { readonly kind: 'not'; readonly of: AutoCondition };

/** One scripted continuous stat change. */
export type AutoEffect = {
  readonly locations: readonly AutoLocation[];
  readonly condition: AutoCondition;
  readonly target: AutoTarget;
  readonly stat: EffectStat;
  readonly change: AutoChange;
  readonly clause: number;
  /** Absent on every effect written before the other forms existed. */
  readonly form?: 'stat';
};

/** The abilities an AUTO can hand out: Rule 305's, and COUNTER (which a HAND card can be given). */
export type AutoGrantableAbility = EffectGrantableAbility | 'COUNTER';

/** What a restricting AUTO forbids. */
export type AutoRestriction =
  /** The card cannot be moved by any effect or move (301.18.h for a swap). */
  | { readonly kind: 'cannot-move' }
  /**
   * The effects of cards whose Lv is at most `lvAtMost` do not affect the card; `lvIs` instead
   * names one exact Lv ("cards with Lv1"), so a Lv0 card still affects it. Give exactly one.
   */
  | {
      readonly kind: 'cannot-be-affected';
      readonly lvAtMost?: number | undefined;
      readonly lvIs?: number | undefined;
    }
  /** The card can attack only a target in `lane` (the opponent's) and/or with Lv `lv`. */
  | {
      readonly kind: 'attack-only';
      readonly lane: EffectRestrictionLane | null;
      readonly lv: number | null;
    }
  /** The card cannot be retreated to pay a CALL cost. */
  | { readonly kind: 'cannot-retreat-to-call' }
  /** The card is not retreated by a Both Lose. */
  | { readonly kind: 'not-retreated-by-both-lose' };

type AutoFormBase = {
  readonly locations: readonly AutoLocation[];
  readonly condition: AutoCondition;
  readonly target: AutoTarget;
  readonly clause: number;
};

/** An AUTO that gives its target an ability while the condition holds. */
export type AutoGrantEffect = AutoFormBase & {
  readonly form: 'grant';
  readonly ability: AutoGrantableAbility;
};

/** An AUTO that restricts its target while the condition holds. */
export type AutoRestrictEffect = AutoFormBase & {
  readonly form: 'restrict';
  readonly restriction: AutoRestriction;
};

/** An AUTO that makes its target lose its effects while the condition holds. */
export type AutoLoseEffectsEffect = AutoFormBase & { readonly form: 'lose-effects' };

/**
 * An AUTO that changes how Power-reductions to its target apply: reduced by `subtract` (times
 * the counted quantity, when there is one) or multiplied by `multiply`. Exactly one is set.
 */
export type AutoReduceEffect = AutoFormBase & {
  readonly form: 'reduce';
  readonly subtract: { readonly per: number; readonly quantity: AutoQuantity | null } | null;
  readonly multiply: number | null;
};

/**
 * An AUTO that changes the distance from its target (the attacker) to the opponent's character
 * in `lane` to `distance` while the condition holds.
 */
export type AutoDistanceSetEffect = AutoFormBase & {
  readonly form: 'distance-set';
  readonly lane: EffectRestrictionLane;
  readonly distance: number;
};

/** Every form an AUTO script entry can take. */
export type AutoAnyEffect =
  | AutoEffect
  | AutoGrantEffect
  | AutoRestrictEffect
  | AutoLoseEffectsEffect
  | AutoReduceEffect
  | AutoDistanceSetEffect;

/** The names of the forms other than the stat change, in the order they were appended. */
export const AUTO_FORMS = ['grant', 'restrict', 'lose-effects', 'reduce', 'distance-set'] as const;

/** A stat-change effect (the form every AUTO script had before the others were added). */
export const isAutoStatEffect = (effect: AutoAnyEffect): effect is AutoEffect =>
  effect.form === undefined || effect.form === 'stat';

/** Everything scripted for one card. */
export type AutoScript = {
  readonly cardNo: CardNo;
  readonly effects: readonly AutoAnyEffect[];
  /** The printed AUTO clauses this script implements in full. */
  readonly coveredClauses: readonly number[];
};

/** A registry lookup; a card with no script answers `undefined`. */
export type AutoLookup = (cardNo: CardNo) => AutoScript | undefined;
