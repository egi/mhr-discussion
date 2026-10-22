/**
 * The battle a declared attack opens. It exists from the moment the Turn Player declares an
 * attack until the Confirmation Step ends the battle process, and is absent from `GameState`
 * (never `null`) when no battle is open.
 */

import type { BattleSlotName } from './slots';

/**
 * Where an open battle is in the attack process (303.2.a.4.3).
 *
 * The attacker's seat is `GameState.activePlayerId` and the target's seat is the other seat, so
 * neither is stored here.
 *
 * - `select`: the Select Target Step is open and the Turn Player must (re)select a target
 *   (303.2.a.4.3.1, 303.2.a.4.3.1.6, 303.2.a.4.3.2.2).
 * - `declared`: the target is chosen and the effects triggered by the declaration are still
 *   resolving. No priority window is open yet; the Select Target Step ends only when they have
 *   all finished (303.2.a.4.3.1.2).
 * - `counter`: the Counter Step window is open (303.2.a.4.3.2).
 * - `counter-closed`: two consecutive passes closed the Counter Step and only the Confirmation
 *   Step (303.2.a.4.3.3) remains.
 */
export type OpenBattle = {
  readonly attackerSlot: BattleSlotName;
  readonly attackerIid: number;
  readonly targetSlot: BattleSlotName;
  /** The target Character's instance id, or `null` for a Weakness (no Character targeted). */
  readonly targetIid: number | null;
  readonly step: 'select' | 'declared' | 'counter' | 'counter-closed';
};
