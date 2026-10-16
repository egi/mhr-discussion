/**
 * BP01-112, a character that knocks a set card out of the opponent's BASE.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field, you retreat 1 of your opponent's set cards
 *   in BASE.
 *
 * The script retreats one face-down ("set") card from the opponent's BASE into their
 * RETREAT. With no set card there, the effect cannot run.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, effect, retreat, select } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-112');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.16.a.6'), reviewedHash: 'd77bb1167305' }, // retreat face-down card
  ],
  rulings: [
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    retreat(select('opponent', 'BASE', { ...ANY_CARD, faceDown: true })),
  );
}
