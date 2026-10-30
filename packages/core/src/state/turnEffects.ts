/**
 * The per-turn record of effects that last "in this turn".
 *
 * A card effect such as "1 of your opponent's characters can not move in this turn", "this card
 * gets the ability [ASSAULT] in this turn", "you skip your Battle Phase in this turn" or "this
 * card gets the second chance to attack in this turn" changes what the players may do for the
 * rest of the turn but does not change any stored stat. Like a scripted stat modifier it is
 * source state: the effect that created it is not replayed, so a shared mid-turn link would lose
 * it unless the record travels with the board.
 *
 * `PlayerState.turnEffects` holds the record of the player who controlled the effect. The key is
 * absent (never an empty array) when there is none, so a state without one keeps the exact bytes
 * and digest it always had. Every entry ends with the turn: the End Phase clears both seats
 * (303.2.a.6.1.2).
 *
 * The list of kinds is append-only. A new kind is a new member here, a new wire tag in the share
 * codec and a schema version, never a change to an existing member.
 */

/** What a restriction recorded for the turn forbids. */
export const TURN_RESTRICTIONS = ['move', 'attack'] as const;
export type TurnRestriction = (typeof TURN_RESTRICTIONS)[number];

/** The abilities an effect can hand out for the turn (the grantable subset of rule 305). */
export const TURN_GRANTABLE_ABILITIES = ['BLOCK', 'DOUBLE ATTACK', 'ASSAULT', 'AIR-ATTACK'] as const;
export type TurnGrantableAbility = (typeof TURN_GRANTABLE_ABILITIES)[number];

/** The wire order of the entry kinds. Append only. */
export const TURN_EFFECT_KINDS = [
  'restriction',
  'ability',
  'second-chance-attack',
  'skip-battle-phase',
  'effect-used',
  'defended',
] as const;
export type TurnEffectKind = (typeof TURN_EFFECT_KINDS)[number];

/** One effect that lasts until the end of the turn. */
export type TurnEffect =
  /** The card `iid` cannot make the named move or attack for the turn. */
  | { readonly kind: 'restriction'; readonly iid: number; readonly restriction: TurnRestriction }
  /** The card `iid` has the named ability for the turn. */
  | { readonly kind: 'ability'; readonly iid: number; readonly ability: TurnGrantableAbility }
  /** The card `iid` has one more attack opportunity this turn, against a character only. */
  | { readonly kind: 'second-chance-attack'; readonly iid: number }
  /** The controller skips their Battle Phase this turn. */
  | { readonly kind: 'skip-battle-phase' }
  /** The card `iid` has started its once-per-turn effect this turn. */
  | { readonly kind: 'effect-used'; readonly iid: number }
  /** The card `iid` has been the defender of an attack declared this turn. */
  | { readonly kind: 'defended'; readonly iid: number };
