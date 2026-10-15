/**
 * Scripted one-shot stat modifiers.
 *
 * A card effect such as "this character gets Power +3000 until the end of the turn" has to
 * be recorded somewhere that survives a share link and can be cleared at a defined moment.
 * `PlayerState.modifiers` is that place. This module owns the modifier's shape; the two
 * pure transitions over it live in the engine.
 *
 * ## Scope
 *
 * A modifier is *recorded*, never *applied to stored stats*: no field on `CardInstance`
 * changes, and nothing here is read by the structural fact lookup. Modifiers and the AUTO
 * activation log are the two source-state records the `derive()` view folds into effective
 * stats; nothing here is stored as a stat. The engine keeps the bookkeeping that
 * view reads.
 *
 * ## `expires` is a union of one
 *
 * `'end-of-turn'` is the only lifetime today. It is written as a union rather than a bare
 * string so a longer-lived lifetime is an added member, not a rename of every stored value.
 */

/** The stats a one-shot modifier can move. */
export const MODIFIER_STATS = ['power', 'r', 'level'] as const;
export type ModifierStat = (typeof MODIFIER_STATS)[number];

/** How long a modifier lasts. One member today; see the module comment. */
export const MODIFIER_LIFETIMES = ['end-of-turn'] as const;
export type ModifierLifetime = (typeof MODIFIER_LIFETIMES)[number];

/**
 * How a modifier changes its stat. `'add'` is an increase or decrease by `delta`; `'set'`
 * is a change to the value `delta` holds (301.41: a change is not an increase or decrease).
 */
export const MODIFIER_MODES = ['add', 'set'] as const;
export type ModifierMode = (typeof MODIFIER_MODES)[number];

/** A temporary change to one stat of one card instance. */
export type EffectModifier = {
  /** The card instance the modifier is attached to. */
  readonly iid: number;
  readonly stat: ModifierStat;
  /** Signed amount added to the stat; for mode `'set'`, the value the stat changes to. */
  readonly delta: number;
  readonly expires: ModifierLifetime;
  readonly mode: ModifierMode;
  /** Monotonic stamp: the order effects began applying, shared with `AutoActivation.seq` (D-07). */
  readonly seq: number;
};

/**
 * One entry of the AUTO activation log (D-08): which card's effect began applying, and when.
 * `effect` is the ordinal in the card's `AutoScript.effects`.
 */
export type AutoActivation = {
  readonly iid: number;
  readonly effect: number;
  readonly seq: number;
};
