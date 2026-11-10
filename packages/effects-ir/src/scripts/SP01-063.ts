/**
 * SP01-063, a character that slips a random opposing HAND card face down into the opponent's BASE.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   TRIG【HAND】:When your character with 【Web】 in its feature enters the field, you may place
 *   this card from HAND onto your field.
 *   TRIG【FIELD】:When this card enters the field, you place 1 of your opponent's cards from HAND
 *   face down into your opponent's BASE randomly.
 *
 * Scripted clause: the TRIG【FIELD】 clause (user decision Q4 of this batch). Not modelled: the
 * TRIG【HAND】 clause (placing this card from HAND onto the field when an own Web character
 * enters), which stays on the manual path. The script covers the second clause while the badge
 * model attributes coverage to the first non-AUTO clause; the derived badge is still partial
 * because one of two clauses is scripted.
 *
 * UNIQUE is owned by the engine and is not scripted. Event tag: enters-field, FIELD (201.10.d.2).
 * The effect is mandatory (304.1.b). One card of the opponent's HAND, picked at random (the pick
 * is designated by the opponent and travels in the action, so a replay places the same card), is
 * placed face down into the opponent's BASE (301.21.a). This is a placement by effect, not a call
 * (discussion 31: "by calling" triggers do not fire on it). With an
 * empty opposing HAND nothing is placed and no error is raised (304.1.d); with a full BASE the
 * engine places what it can (discussion 24 principle). Discussion 29 (CONSENSUS)
 * covers this card's trigger interplay with a placed card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, effect, relocate, selectRandom, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR, EffectTarget } from '../ir';

export const CARD_NO = asCardNo('SP01-063');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('301.21.a'), reviewedHash: '73c1095ad66d' }, // becomes a Face-Down Card
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** One random card of the opponent's HAND. */
const randomHandCard = (): EffectTarget =>
  selectRandom('opponent', 'HAND', ANY_CARD, 1);

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    relocate(randomHandCard(), { side: 'opponent', area: 'BASE', faceDown: true }),
    trigger('enters-field', 'FIELD'),
  );
}
