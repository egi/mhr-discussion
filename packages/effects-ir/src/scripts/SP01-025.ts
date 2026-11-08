/**
 * SP01-025, an attachment that prunes the top card of its owner's deck whenever its host attacks.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When the character this card is attached to attacks, you prune the top 1 card
 *   of your deck.
 *   TRIG【FIELD】:When this card enters the field by calling, you reveal the top 3 cards of your
 *   deck, add 1 of them with 【Web】 in their features to your HAND and prune the rest.
 *
 * Event tag: host-attacks, BATTLE. A script carries one trigger, so this is the first printed
 * clause (TRIG): mandatory, the top card of the deck goes to the VOID. An empty deck prunes
 * nothing and is not done. The TRIG【FIELD】 by-call clause (reveal 3, add 1 Web card to HAND, prune
 * the rest) is not modelled and stays on the manual path, so the card badges partial.
 *
 * Ruling note: community-rulings discussion 18 (HEAD-JUDGE, 304.1.k RESOLVED, on the vendor board) lists this
 * card; it concerns HAND triggers and drawn cards, which this clause is not, so it is linked for
 * traceability only and changes nothing in the script.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, mill, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-025');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('304.1.k'), reviewedHash: '1c37c93f925c' }, // trigger timing
  ],
  rulings: [{ discussion: '18', rule: asRuleKey('304.1.k') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, mill('self', 'top', 1, 'prune'), trigger('host-attacks', 'BATTLE'));
}
