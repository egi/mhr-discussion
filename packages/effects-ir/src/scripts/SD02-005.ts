/**
 * SD02-005, a BASE ability that mills for a draw and then covers itself.
 *
 * Printed text (official card):
 *
 *   ACTI【BASE/ONCE PER TURN】：You discard the top 3 cards of your deck. If you do, you draw
 *   1 card, and cover this card.
 *
 * The script discards the top three DECK cards and, only if that happened, draws one card
 * and covers this card. Covering turns it face-down (301.14; "cover" is not a rulebook term, a
 * reading taken from the card survey, still marked open). The "once per turn" limit is a use limit, not an effect, and is not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  cover,
  draw,
  effect,
  ifDone,
  mill,
  sequence,
  source,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-005');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves
    { key: asRuleKey('301.15.a.3'), reviewedHash: '9ac3aa7c9412' }, // discard from deck
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // greatest extent
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
      step(mill('self', 'top', 3, 'discard')),
      ifDone(draw('self', 1)),
      ifDone(cover(source())),
    ),
  );
}
