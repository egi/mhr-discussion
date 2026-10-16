/**
 * BP01-065, a character that stocks the BASE when it loses a fight.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:This card enters RETREAT by losing the fight, you place the top 2 cards of
 *   your deck face down into your BASE.
 *
 * The script is the effect after the trigger: the top two DECK cards go face down into the
 * BASE. A DECK with fewer than two cards cannot satisfy it.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, effect, relocate, select } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-065');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET cards face-down
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE limit
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    relocate(select('self', 'DECK', ANY_CARD, 2), { side: 'self', area: 'BASE', faceDown: true }),
  );
}
