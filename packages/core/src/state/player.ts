/**
 * The seat identifiers. They sit in a module of their own so that `gameState` and
 * `priority` can both name a `PlayerId` without importing each other.
 */

/** The two seats. Player ids are positional; who moved first is a separate fact. */
export const PLAYER_IDS = ['p0', 'p1'] as const;
export type PlayerId = (typeof PLAYER_IDS)[number];
