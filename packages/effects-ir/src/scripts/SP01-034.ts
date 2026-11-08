/**
 * SP01-034, an attachment that clears the other attached cards of its host and can pay a Web
 * character from the RETREAT for Power.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When you attach this card to a character on the field, you retreat all the
 *   attached cards of that character except this card.
 *   COUNTER·ACTI【FIELD/ONCE PER TURN】:You prune 1 of your characters with 【Web】 in their
 *   features in RETREAT. If you do, the character this card is attached to gets Power+1000 this
 *   turn.
 *
 * A script carries one trigger, so this is the TRIG【FIELD】 clause only (the first printed
 * clause): when this card has been attached, every other card attached to the host is retreated;
 * this card stays. A host with no other attached card is not an error (304.1.d).
 *
 * Not modelled: the COUNTER·ACTI clause (prune a Web character from the RETREAT, then the host
 * gets Power+1000). It is played by hand, so the card badges partial. No community ruling touches
 * this card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, hostOfSource, retreatAttachedOfHost, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-034');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a stacked character is an attached card
    { key: asRuleKey('301.16.a.4'), reviewedHash: '47953ce28d45' }, // an Attached Card retreated by effect
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, retreatAttachedOfHost(hostOfSource(), 'all', true), trigger('this-card-attached', 'FIELD'));
}
