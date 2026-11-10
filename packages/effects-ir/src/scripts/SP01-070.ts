/**
 * SP01-070, an attachment that discards the top 3 cards of its owner's deck when it is attached.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When you attach this card to a character on the field, you discard the top 3
 *   cards of your deck.
 *   TRIG【FIELD】:When your character with 【Web】 in its feature enters VOID, you may prune this
 *   card on the field. If you do, you place that character onto your BATTLE. If that character is
 *   with Lv4 or above, you discard 1 of your cards in HAND extra.
 *
 * Event tag: this-card-attached, FIELD. A script carries one clause, so this is the first printed
 * clause (TRIG): the top 3 cards of the player's own deck are discarded when this card is
 * attached to a character on the field. With fewer than 3 cards in the deck the effect does as
 * much as it can (304.1.d; discussion 24, HEAD-JUDGE). The second TRIG【FIELD】 clause
 * (the Web character entering VOID, the prune, the placement onto BATTLE and the Lv4 extra discard)
 * is not modelled and stays on the manual path, so the card badges partial. The grouping mechanism
 * of same-event triggers is still open (discussions 16 and 17, tiers HEAD-JUDGE for the rule and
 * ESCALATE-OPEN for the mechanism; no ruling link). The openness is not limited to
 * the unmodelled VOID clause: this scripted attach trigger is itself a same-event trigger, so it
 * may be affected in principle. No hand flag is set.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, mill, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-070');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, mill('self', 'top', 3, 'discard'), trigger('this-card-attached', 'FIELD'));
}
