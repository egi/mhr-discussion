/**
 * SP01-042, a character that prunes the top of its deck to draw and cross over to the opponent.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/ONCE PER TURN】:You prune the top 1 card of your deck. If you do, you draw 2
 *   cards and move this card from BATTLE to your opponent's BASE.
 *   TRIG【FIELD/ONCE PER TURN】:When your turn starts, if this card's owner is your opponent, you
 *   prune the bottom 3 cards of your deck.
 *
 * A script carries one effect, so this one is the ACTI. The TRIG (turn start, owner is the
 * opponent, prune the bottom 3) is not scripted and stays with the engine as an unscripted
 * effect; the owner reading it rests on is the engine reading `sp01-042-owner-controller`
 * (UNRULED, rulebook definitions 301.3.a and 301.4.a).
 *
 * The top card is pruned first. Only if that was done do the two results run; they are
 * independent parts of one "If you do" (Reading B, nested shape with `always` inner steps), so a
 * draw with nothing left to draw does not stop the move to the opponent's BASE (304.1.d,
 * discussions 09 and 10; discussion 10 is ESCALATE-OPEN). ONCE PER TURN is the `oncePerTurn`
 * marker on the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  draw,
  effect,
  ifDone,
  mill,
  relocate,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-042');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect: printed Condition (ONCE PER TURN) is an additional Condition
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw from DECK top
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(mill('self', 'top', 1, 'prune')),
      ifDone(
        sequence(
          step(draw('self', 2), 'always'),
          step(relocate(source(), { side: 'opponent', area: 'BASE', faceDown: false }), 'always'),
        ),
      ),
    ),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true },
  );
}
