/**
 * The four BATTLE lanes, in the order R-based targeting walks them.
 *
 * 302.3.a–302.5.a: one FRONT, two WING, one BACK. The rules never name a left and a
 * right wing, so the two WING slots are positional — `wing-0` and `wing-1` — and the
 * board renders them from `BattleField.wings` rather than from a guessed label.
 *
 * The order is load-bearing: the lane-distance chain (303.2.a.4.3.1.1.1–.5,
 * `BACK—WING—FRONT—FRONT—WING—BACK`) is walked by indexing into it, and 301.19.b
 * retreats are ordered by it. It is not a display order and must not be sorted.
 */
export const BATTLE_SLOT_NAMES = ['front', 'wing-0', 'wing-1', 'back'] as const;
export type BattleSlotName = (typeof BATTLE_SLOT_NAMES)[number];
