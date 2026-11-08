/**
 * SP01-015, a UNIQUE attachment that may prune the top card of both decks when its host attacks.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   TRIG【BATTLE】:When the character this card is attached to attacks, you may prune the top 1
 *   card of each player's deck.
 *   TRIG【BATTLE】:When this card enters the field by the effect of a character with 【Web】 in
 *   its feature, you may prune the top 3 cards of each player's deck.
 *
 * Event tag: host-attacks, BATTLE. A script carries one trigger, so this is the first printed
 * clause: optional (304.1.a), the top card of the controller's DECK and then the top card of the
 * opponent's DECK go to the VOID (301.17.a). An empty deck is skipped without an error. The second
 * TRIG (enters the field by the effect of a character with Web in its feature, prune 3 from each
 * deck, including its Web source filter) is not modelled and stays on the manual path, so the
 * card badges partial.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, mill, optional, sequence, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-015');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(sequence(step(mill('self', 'top', 1, 'prune')), step(mill('opponent', 'top', 1, 'prune')))),
    trigger('host-attacks', 'BATTLE'),
  );
}
