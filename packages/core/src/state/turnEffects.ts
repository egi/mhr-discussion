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

/**
 * What a restriction recorded for the turn forbids. Append only: `'retreat-to-call'` forbids a
 * Character to be retreated as the cost of a CALL (301.19.b). The "this turn" lifetime of such a
 * record rests on 303.2.a.6.1.2; discussion 14 (community-rulings) settles, at HEAD-JUDGE tier, only
 * that a card leaving the FIELD is a new card for once-per-turn triggers, and marks the application
 * to "this turn" records as ESCALATE-OPEN, so the pruning of these records is inference.
 */
export const TURN_RESTRICTIONS = ['move', 'attack', 'retreat-to-call'] as const;
export type TurnRestriction = (typeof TURN_RESTRICTIONS)[number];

/** The comparison a `restriction-limit` makes against a Character's Lv. Append only. */
export const TURN_RESTRICTION_DIRECTIONS = ['at-least', 'at-most', 'exact'] as const;
export type TurnRestrictionDirection = (typeof TURN_RESTRICTION_DIRECTIONS)[number];

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
  'battle-base-moved',
  'placed-this-turn',
  'restriction-limit',
] as const;
export type TurnEffectKind = (typeof TURN_EFFECT_KINDS)[number];

/**
 * Which of a card's once-per-turn effects an `effect-used` entry records. Absent is the card's
 * primary (scripted, or plain [BLOCK] holder) effect; 'block' is the [BLOCK] retarget used on a
 * card whose scripted COUNTER effect is a different one.
 */
export type EffectUsedTag = 'block';

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
  /**
   * The card `iid` has started its once-per-turn effect this turn. `effect` names which one;
   * absent means the card's primary effect (writers omit the key rather than set it undefined).
   */
  | { readonly kind: 'effect-used'; readonly iid: number; readonly effect?: EffectUsedTag | undefined }
  /** The card `iid` has been the defender of an attack declared this turn. */
  | { readonly kind: 'defended'; readonly iid: number }
  /** The card `iid` has used its one BATTLE-BASE MOVE opportunity this turn (303.2.a.3.1.3.2). */
  | { readonly kind: 'battle-base-moved'; readonly iid: number }
  /** The card `iid` was placed onto the FIELD this turn (303.2.a.3.1.3.3). */
  | { readonly kind: 'placed-this-turn'; readonly iid: number }
  /**
   * A restriction that names no card, only a Lv and a direction: every Character of the seat that
   * holds the record whose Lv matches is forbidden the named restriction, including Characters that
   * enter the FIELD later this turn (user decision 2026-11-13; not ruled in Comprehensive Rules v1.03,
   * and discussion 14's application to "this turn" records is ESCALATE-OPEN). `limit.lv` is the
   * effective Lv, read when the restriction is checked, not when it is recorded. It ends with the
   * turn (303.2.a.6.1.2). Only `'retreat-to-call'` carries a limit.
   */
  | {
      readonly kind: 'restriction-limit';
      readonly restriction: TurnRestriction;
      readonly limit: { readonly lv: number; readonly direction: TurnRestrictionDirection };
    };
