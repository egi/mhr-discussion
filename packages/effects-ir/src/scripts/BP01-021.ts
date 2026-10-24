/**
 * BP01-021, a character that digs the DECK for a Human when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you show the top 3 cards of
 *   your deck, add 1 of them with 【Human】 in their features to your HAND and discard the
 *   rest.
 *
 * The script digs the top three DECK cards for one with the Human feature and discards the
 * rest. The interpreter runs the dig op; with no Human among the three, the cards are all
 * discarded.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, dig, effect } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-021');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('301.28.a'), reviewedHash: '07b2366e111b' }, // show top DECK cards
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard the rest
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, dig('self', 3, { ...ANY_CARD, feature: 'Human' }, 'discard'));
}
