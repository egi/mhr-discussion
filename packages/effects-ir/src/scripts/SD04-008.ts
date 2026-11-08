/**
 * SD04-008, a card that stocks the BASE when another effect discards it.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT by discarding of effect, you place the top 2
 *   cards of your deck face down into your BASE.
 *
 * Event tag: enters-retreat-by-discard-effect, RETREAT. It starts when an effect discards the card
 * into the RETREAT; a lost fight, a CALL, leaving the field and the End Phase hand-limit discard
 * do not (discussion 26 in .planning/research/community-rulings/discussions, RESOLVED by 301.15.a
 * and 303.2.a.6.1.3). The top two DECK cards go face down into the BASE (301.13.a). When the BASE
 * or the DECK cannot take both, as many as possible are placed (survey label "11 B2" is
 * discussion 24, HEAD-JUDGE for the principle, CR 304.1.d; the zone-full cases are CONSENSUS).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, effect, relocate, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-008');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET cards face-down
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE limit
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [{ discussion: '24', rule: asRuleKey('304.1.d') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    relocate(select('self', 'DECK', ANY_CARD, 2), { side: 'self', area: 'BASE', faceDown: true }),
    trigger('enters-retreat-by-discard-effect', 'RETREAT'),
  );
}
