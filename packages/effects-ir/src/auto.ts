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
 * - Only stat changes (Lv / R / Power plus, minus, change-to) are modelled. Granted abilities,
 *   restrictions, lose-effects and UNIQUE-style AUTOs stay on the manual path; an unscripted
 *   card is fully playable.
 * - A condition may read an EFFECTIVE (clamped) stat of the cards in an area (`stat-is`). That
 *   is why `derive` iterates: the set of applying AUTOs is re-evaluated against the stats the
 *   previous pass produced until it stops changing. Attached cards are not counted as the
 *   character standing in an area; the placed character is.
 */

import type { CardNo } from '@mhr/core';
import type { EffectArea, EffectFilter, EffectSide, EffectStat } from './ir';

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

/** How a stat moves: by a signed amount, or to a fixed value. */
export type AutoChange =
  | { readonly kind: 'add'; readonly delta: number }
  | { readonly kind: 'set'; readonly value: number };

/** Which cards a stat change lands on. */
export type AutoTarget =
  | { readonly kind: 'self' }
  | { readonly kind: 'host' }
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
    };

/** One scripted continuous stat change. */
export type AutoEffect = {
  readonly locations: readonly AutoLocation[];
  readonly condition: AutoCondition;
  readonly target: AutoTarget;
  readonly stat: EffectStat;
  readonly change: AutoChange;
  readonly clause: number;
};

/** Everything scripted for one card. */
export type AutoScript = {
  readonly cardNo: CardNo;
  readonly effects: readonly AutoEffect[];
  /** The printed AUTO clauses this script implements in full. */
  readonly coveredClauses: readonly number[];
};

/** A registry lookup; a card with no script answers `undefined`. */
export type AutoLookup = (cardNo: CardNo) => AutoScript | undefined;
