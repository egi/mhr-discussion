/**
 * The alternating-priority window type shared by the Counter Step and the Counter Phase
 * (303.2.a.4.3.2 and 303.2.a.5). `kind` tells the two apart for citation purposes only.
 */

import type { PlayerId } from './player';

/**
 * Whose turn it is to act within an open Counter Step/Counter Phase, and how close the
 * window is to closing.
 */
export type PriorityWindow = {
  readonly kind: 'counter-step' | 'counter-phase';
  /**
   * Whose turn it is to choose an action right now. Opens with the opponent, not the
   * turn player — 303.2.a.4.3.2.1 and 303.2.a.5.1 both say the window begins with "the
   * opponent" alternating from there.
   */
  readonly actor: PlayerId;
  /**
   * Resets to 0 on any non-pass action; two consecutive passes — by different actors,
   * since the two alternate — closes the window.
   */
  readonly consecutivePasses: 0 | 1 | 2;
};
