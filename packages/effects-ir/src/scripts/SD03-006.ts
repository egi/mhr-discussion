/**
 * SD03-006, a UNIQUE character that mills two cards of its own deck to draw one.
 *
 * Printed text (official card):
 *
 *   UNIQUE(AUTO【FIELD】:You cannot have another card with the same name as this card on the
 *   field. This effect cannot be lost.)
 *   ACTI【BATTLE/ONCE PER TURN】:You discard the top 2 cards of your deck. If you do, you draw
 *   1 card.
 *
 * Event tag: activate, BATTLE, once per turn (201.10.f.2). The UNIQUE line is the keyword
 * restriction, not an effect script. The script discards the top two cards of the player's DECK
 * into the RETREAT (301.15.a.3) and, only if that was done, draws one card (302.13.b). A DECK with
 * fewer than two cards discards what it has (304.1.d); an empty DECK is not done, so nothing is
 * drawn and no error is raised.
 * "If you do" follows Reading B (discussion 10 item 3, ESCALATE-OPEN, user decision of 2026-11-03).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { draw, effect, ifDone, mill, sequence, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-006');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect: printed Condition (ONCE PER TURN) is an additional Condition
    { key: asRuleKey('301.15.a.3'), reviewedHash: '9ac3aa7c9412' }, // discard from the deck
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
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
    sequence(step(mill('self', 'top', 2, 'discard')), ifDone(draw('self', 1))),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true },
  );
}
