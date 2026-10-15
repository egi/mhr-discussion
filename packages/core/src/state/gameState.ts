/**
 * The game state model.
 *
 * ## Source state only
 *
 * This module declares what the game *is*, never what can be computed from it. There is
 * deliberately no `effectiveLevel`, no card-count cache, and no running total: every
 * such value is a second source of truth that desynchronizes the moment a card is
 * flipped or moved. Rules 301.45.b ("When a card leaves the FIELD, all of its states are
 * refreshed … and it becomes a new card") and 301.45.c make the printed/current split a
 * *rules* requirement rather than a performance preference. Derived values belong in a
 * `derive()` view, which is never serialized and never patched back into state.
 *
 * ## Plain, serializable data
 *
 * Everything here is a JSON-serializable plain value: no class instances, no `Map`, no
 * `Set`, no functions, and no `undefined`-valued fields (a slot that can be empty is
 * `null`, because `JSON.stringify` drops `undefined` and would silently change the
 * shape on a round trip). The share-link codec in a later phase depends on this.
 * Deliberately absent, and not precluded by this shape: the action log,
 * `(state, action) => state`, `legalMoves`, and the effect DSL.
 *
 * ## Per-character turn state is not modelled yet
 *
 * Attack opportunities (303.2.a.4.4), BATTLE-BASE MOVE opportunities
 * (303.2.a.3.1.3.2) and "placed on the field this turn" (303.2.a.3.1.3.3) are
 * per-*character* facts, not per-player counters. They belong on the card instance
 * alongside `faceDown`, and arrive with the action layer that first needs them. A
 * schema-version bump is the expected cost of adding them; guessing their shape now
 * and getting it wrong would cost the same bump for nothing.
 */

import type { CardInstance } from '../cards/identity';
import type { PlayerId } from './player';
import type { PriorityWindow } from './priority';
import type { AutoActivation, EffectModifier } from './modifiers';

export { PLAYER_IDS } from './player';
export type { PlayerId } from './player';

/**
 * Every rulebook area. Rules 302.3.a–302.13.a.
 *
 * `WING` covers both wing slots; `ATTACHED` is listed because cards can be placed into
 * it, though 301.25.k is explicit that attached cards do **not** count against the
 * area limit of the Character they are attached to.
 */
export const ZONE_NAMES = [
  'FRONT',
  'WING',
  'BACK',
  'BASE',
  'HAND',
  'DECK',
  'RUSH_POINT_DECK',
  'TIMELINE',
  'RETREAT',
  'VOID',
  'ATTACHED',
] as const;
export type Zone = (typeof ZONE_NAMES)[number];

/**
 * The phase order of a turn, in order. Rule 303.2.a:
 * Start of Turn → Draw → Action → Battle → Counter → End.
 *
 * `Phase` is derived from this array so the type and the runtime order cannot drift.
 */
export const PHASE_ORDER = ['start-of-turn', 'draw', 'action', 'battle', 'counter', 'end'] as const;
export type Phase = (typeof PHASE_ORDER)[number];

/**
 * The closed set of named abilities. Rule 305 defines exactly these six, and Phase 6's
 * effect IR must not be able to invent a seventh. Written verbatim as the rules name
 * them so they stay greppable against the document.
 */
export const ABILITIES = [
  'COUNTER',
  'BLOCK',
  'DOUBLE ATTACK',
  'ASSAULT',
  'AIR-ATTACK',
  'UNIQUE',
] as const;
export type Ability = (typeof ABILITIES)[number];

/**
 * Every limit the rules pin down, as data. Nothing in the kernel may inline one of
 * these numbers; a test asserts the type carries no derived value, and reviews of this
 * object are where a rules revision lands.
 *
 * Win conditions (103.1) are three: 9 Rush Points in a player's Timeline (103.1.a), the
 * opposing player's Deck containing 0 cards (103.1.b), and a card effect declaring a
 * player the winner (103.1.c). Only the first is a number, and it is encoded below as
 * `rushPointsToWin`; the other two are conditions over state the engine evaluates.
 */
export const GAME_STATE_LIMITS = Object.freeze({
  /** 302.3.a + 302.4.a + 302.5.a — FRONT 1, each WING 1, BACK 1. */
  battleSlotsPerPlayer: 4,
  /** 302.3.a. */
  frontSlotsPerPlayer: 1,
  /** 302.4.a — two WING slots. */
  wingSlotsPerPlayer: 2,
  /** 302.5.a. */
  backSlotsPerPlayer: 1,
  /**
   * 302.6.a — Characters and Face-Down Cards share the same pool, so a face-down card
   * (301.21.g) consumes one of these six.
   */
  baseCapacity: 6,
  /** 101.1.b — deck size at construction. */
  deckSize: 50,
  /** 101.2.b — Rush Point deck size at construction. */
  rushPointDeckSize: 9,
  /**
   * 303.2.a.6.1.3 — the hand limit is enforced only at the End Phase, by discarding
   * down to it; 302.13.a makes the hand otherwise unlimited.
   */
  handLimit: 9,
  /** 302.10.a — a Timeline holds any number of Rush Points. */
  timelineRushPointsMin: 0,
  /** 103.1.a — but 9 of them wins, which is also the maximum that can matter. */
  timelineRushPointsMax: 9,
  /** 103.1.a — the win threshold. */
  rushPointsToWin: 9,
  /** 303.2.a.3.1.2.2 — Action CALLs per Action Phase. */
  actionCallsPerActionPhase: 3,
  /** 303.2.a.3.1.2.3 — the first player's first turn is restricted to one. */
  actionCallsFirstTurn: 1,
  /** 303.2.a.3.1.1.2 — Base Deployment, once per Action Phase. */
  baseDeploymentsPerActionPhase: 1,
  /** 303.2.a.2.1 — draws in the Draw Phase. Not an "action". */
  drawPerDrawPhase: 2,
  /** 303.2.a.4.2.1 — a BATTLE rearrangement, once per turn, consumes no action. */
  battleRearrangesPerTurn: 1,
  /** 101.1.d — copies of one name per deck, read through `CardInstance.nameKey`. */
  copiesPerName: 3,
  /**
   * 303.2.a.4.3.2.3.1.1 and 303.2.a.5.2.1.1 — one COUNTER CALL per turn. The two rules
   * scope "once per turn" to a phase each (the Counter Step and the Counter Phase), and
   * the document does not settle which reading governs. See `TurnState.counterCallPhase`.
   */
  counterCallsPerTurn: 1,
} as const);

/**
 * The resolved per-turn limits.
 *
 * First-turn carve-outs are read from here rather than written as `if` statements
 * scattered through the kernel: the first player skips the Battle Phase on their first
 * turn (303.2.a.4.1) and may make only one Action CALL (303.2.a.3.1.2.3). Both are
 * data, keyed on the two facts that determine them.
 */
export type TurnLimits = {
  readonly battlePhase: boolean;
  readonly draws: number;
  readonly actionCalls: number;
  readonly baseDeployments: number;
  readonly battleRearranges: number;
  readonly counterCalls: number;
};

/**
 * Resolve the limits for a turn from its two determining facts.
 *
 * `turnNumber` lives on the shared state and `isFirstPlayer` on the player, because
 * neither belongs to the other, and this function is the single place the two combine.
 */
export function limitsForTurn(turnNumber: number, isFirstPlayer: boolean): TurnLimits {
  const isFirstTurnOfFirstPlayer = turnNumber === 1 && isFirstPlayer;
  return {
    battlePhase: !isFirstTurnOfFirstPlayer,
    draws: GAME_STATE_LIMITS.drawPerDrawPhase,
    actionCalls: isFirstTurnOfFirstPlayer
      ? GAME_STATE_LIMITS.actionCallsFirstTurn
      : GAME_STATE_LIMITS.actionCallsPerActionPhase,
    baseDeployments: GAME_STATE_LIMITS.baseDeploymentsPerActionPhase,
    battleRearranges: GAME_STATE_LIMITS.battleRearrangesPerTurn,
    counterCalls: GAME_STATE_LIMITS.counterCallsPerTurn,
  };
}

/**
 * The BATTLE area: four slots, one Character each.
 *
 * `wings` is a fixed two-element tuple rather than two named fields. The rules fix only
 * that there are two WING slots (302.4.a) — they do not name a left and a right — and a
 * guessed label would be baked into every saved link. Positional order is preserved, so
 * the lane geometry R-based targeting needs can be built on it.
 */
export type BattleField = {
  /** 302.3.a. */
  readonly front: CardInstance | null;
  /** 302.4.a — two slots, in positional order. */
  readonly wings: readonly [CardInstance | null, CardInstance | null];
  /** 302.5.a. */
  readonly back: CardInstance | null;
};

/**
 * A player's per-turn counters.
 *
 * The COUNTER CALL is the one modelled ambiguity: 303.2.a.4.3.2.3.1.1 (Counter Step) and
 * 303.2.a.5.2.1.1 (Counter Phase) each grant "at most once per turn" *within a phase*.
 * A single field records the phase in which it was spent, so either reading — once per
 * turn, or once in each of the two phases — is a one-line change here rather than a
 * re-shape. **Open question; deliberately not resolved.**
 */
export type TurnState = {
  /** 303.2.a.3.1.2.2, narrowed to 1 by 303.2.a.3.1.2.3 on the first player's first turn. */
  readonly actionCallsUsed: number;
  /** 303.2.a.3.1.1.2. */
  readonly baseDeploymentsUsed: number;
  /** 303.2.a.2.1. */
  readonly drawsUsed: number;
  /** 303.2.a.4.2.1. */
  readonly battleRearrangesUsed: number;
  /** The phase the COUNTER CALL was spent in, or `null` if it has not been. */
  readonly counterCallPhase: Phase | null;
  /**
   * The FIELD characters (by iid) that have already attacked this turn (303.2.a.4.4);
   * cleared when a new turn starts for this player (303.2.a.4.7's forfeiture is then
   * moot — the opportunity simply did not renew).
   */
  readonly attackedIids: readonly number[];
};

/**
 * One player: every zone the rules give them, plus their per-turn counters.
 *
 * There is no `id` field: the key in `GameState.players` *is* the id, and duplicating it
 * would create a second source of truth that could disagree with the first.
 */
export type PlayerState = {
  /**
   * Did this player take the first turn? Chosen at setup, so it is source state — the
   * first-turn carve-outs (303.2.a.4.1, 303.2.a.3.1.2.3) are read from it via
   * `limitsForTurn` rather than inferred from a turn count or written as `if`s.
   */
  readonly isFirstPlayer: boolean;
  /** 302.11.b — face-down single stack; order fixed except by instruction. */
  readonly deck: CardInstance[];
  /** 302.13.a — non-public (302.13.c), otherwise unlimited. */
  readonly hand: CardInstance[];
  /** 302.6.a — up to 6, Characters and Face-Down Cards sharing the pool. */
  readonly base: CardInstance[];
  /** 302.3.a–302.5.a — four slots. */
  readonly battle: BattleField;
  /** 302.8.a — unlimited, face-up, any order. */
  readonly retreat: CardInstance[];
  /** 302.9.a — unlimited, face-up, any order. The VOID area. */
  readonly voidZone: CardInstance[];
  /** 302.10.a — Rush Points; 9 of them wins (103.1.a). */
  readonly timeline: CardInstance[];
  /** 302.12.b — face-down single stack, 9 at construction (101.2.b). */
  readonly rushPointDeck: CardInstance[];
  readonly turn: TurnState;
  /**
   * Scripted one-shot stat modifiers on this player's cards. Source state: the effect that
   * created each one is not replayed, so the record is the only place it lives. Cleared by
   * `expireModifiers`; never folded into a stored stat.
   */
  readonly modifiers: readonly EffectModifier[];
  /**
   * The controller's own log of AUTO effects in the order they began applying. Source
   * state, not derived: "latter" in 301.41 means began-applying-first, and only this
   * record remembers it.
   */
  readonly autoActivations: readonly AutoActivation[];
};

/** The players, keyed by id. Both are always present. */
export type Players = Record<PlayerId, PlayerState>;

/**
 * The randomness cursor — **source state**, not a derived value.
 *
 * This is part of the wire payload. Restoring a seed without its call count replays a
 * *different* stream, because a step's number of draws varies, so the count must be
 * stored rather than recomputed. Structurally identical to `Rng` in `../rng`; the two
 * are held together by a bidirectional type-equivalence assertion in `rng.test.ts`, so
 * neither can drift. Declared here rather than imported so this module stays free of a
 * dependency on a module that is the consumer of it.
 */
export type GameStateRng = {
  readonly seed: number;
  /** Non-negative: the number of draws taken from the stream so far. */
  readonly callCount: number;
};

/**
 * The whole game.
 *
 * Every zone of both players is present and typed — an absent zone and an empty zone
 * must not be the same thing, or "this player has no deck" and "this player's deck was
 * not serialized" become indistinguishable in a shared link.
 */
export type GameState = {
  /** 1-based. Turn 1 is the first player's first turn. */
  readonly turnNumber: number;
  readonly activePlayerId: PlayerId;
  readonly phase: Phase;
  /**
   * A monotonic counter of accepted state transitions.
   *
   * Source state, not a derived value, and deterministic under replay: replaying the
   * same actions produces the same sequence. Its purpose is to give a cached derived
   * view something to compare against — the dirty flag the `derive()` step is gated on
   * — without reading the wall clock, which the determinism gate forbids.
   */
  readonly invariantCount: number;
  readonly players: Players;
  readonly rng: GameStateRng;
  /**
   * The open Counter Step/Counter Phase priority window, or `null` outside one
   * (303.2.a.4.3.2, 303.2.a.5). See `./rules/turn/priority` for `PriorityWindow`'s shape
   * and the pure `advancePriority` transition over it.
   */
  readonly priorityWindow: PriorityWindow | null;
};
