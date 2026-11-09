/**
 * SP01-049, a Lv1 character whose activation lets the player behind on the board draw and then
 * discard from the bottom of their own deck.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/ONCE PER TURN】:The player who has fewer characters on BATTLE than their
 *   opponent draws 1 card. If they do, that player discards the bottom 1 card of their deck.
 *
 * Event tag: activate, BATTLE. The player with strictly fewer BATTLE characters draws 1 card
 * (302.13.b); with equal counts nobody draws and nothing is discarded. If a card was drawn, the
 * same player discards the bottom card of their own deck. `mill` has a fixed side, so a
 * conditional on the controller having fewer picks the side: the controller's deck when they have
 * fewer, otherwise the opponent's deck (a draw that was done with the controller not behind means
 * the opponent was behind). A player with an empty deck draws nothing, so nothing is discarded.
 * Characters on the FRONT, WING and BACK all count as BATTLE. The effect type and ONCE PER TURN are
 * 201.10.f.2 (the `oncePerTurn` marker on the IR is enforced by the engine). With no target the
 * activation is still usable (discussion 25, applied by principle: F-30; tier HEAD-JUDGE,
 * provisional, reverse if an official ruling differs; the discussion names other cards, so this
 * card is an application of the principle, not a named case).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  conditional,
  drawByBoardComparison,
  effect,
  ifDone,
  mill,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-049');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect, ONCE PER TURN
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('301.15.a.3'), reviewedHash: '9ac3aa7c9412' }, // discard from the deck
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [{ discussion: '25', rule: asRuleKey('201.10.f.2') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(drawByBoardComparison(1)),
      ifDone(
        conditional(
          { kind: 'fewer-than-opponent', area: 'BATTLE', filter: characters() },
          mill('self', 'bottom', 1, 'discard'),
          mill('opponent', 'bottom', 1, 'discard'),
        ),
      ),
    ),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true },
  );
}
