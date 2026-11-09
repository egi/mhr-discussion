/**
 * SP01-006 Red Goblin, a character that prunes itself and a second card to prune an opposing
 * character of the matching Lv.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/ONCE PER TURN】:You prune this card on BATTLE, as well as either one other
 *   character or an attached card on your field. If you do, you prune 1 of your opponent's
 *   charcaters with LvX on BATTLE. X is the total Lv values of the cards pruned by this effect.
 *
 * The script prunes the card itself, then one other card of the controller's FIELD (a character
 * in a lane or in the BASE, or a card attached to one of them; the FIELD is the BATTLE and the
 * BASE, 302.1.a), and, only if that was done, prunes one opposing BATTLE character whose Lv equals
 * the total Lv of the cards pruned by this effect. A face-down card in the BASE is neither a
 * character nor an attached card, so it is not offered. The source is already pruned when the
 * second card is chosen, so it is never offered as the second card.
 *
 * The Lv source is the engine's existing 'pruned-lv-total' reading (the Lv the card has when it is
 * pruned) with an exact match. The exact match is CONSENSUS-RELAYED (discussion 34); which Lv
 * counts for a card that is already pruned (at-prune or printed) is ESCALATE-OPEN there and is not
 * settled by this script. Only the scale source below needs to change if an official answer
 * differs. An empty opposing side after both prunes is "nothing to do" (discussion 25, F-30); a
 * missing second card keeps the first prune done and the result does not run (discussion 10 item
 * 3, Reading B default). ONCE PER TURN is the `oncePerTurn` marker on the IR, enforced by the
 * engine (the same as SP01-043).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  prune,
  select,
  selectWithAttached,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-006');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('302.1.a'), reviewedHash: 'ea63c3694178' }, // the FIELD is the BATTLE and BASE
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a stacked character is an attached card
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect: printed Condition (ONCE PER TURN) is an additional Condition
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
      step(prune(source())),
      step(prune(selectWithAttached('self', 'FIELD', characters(), 1))),
      ifDone(
        prune(
          select(
            'opponent',
            'BATTLE',
            characters({ lvBy: { mode: 'exact', source: 'pruned-lv-total' } }),
          ),
        ),
      ),
    ),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true },
  );
}
