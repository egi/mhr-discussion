/**
 * SP01-014, an attachment that brings a small Web character back into the BASE when it follows
 * its host into the RETREAT.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card follows the character this card is attached to and enters
 *   RETREAT from the field, you place 1 of your characters with Lv3 or below and 【Web】 in their
 *   features from RETREAT or VOID into your BASE.
 *   ACTI【HAND】:You discard this card in HAND. If you do, you move 1 of your set cards from BASE
 *   back to your HAND.
 *
 * Event tag: follows-host-to-retreat, RETREAT. A script carries one trigger, so this is the first
 * printed clause (TRIG). It fires only when this card follows its host into the RETREAT, not when
 * it is retreated alone. The mandatory placement takes one own Web character of printed Lv3 or
 * below (a Lv4 or non-Web character is not legal) face up into the BASE. The IR has no
 * either-area source, so the RETREAT is used when it holds a legal character and the VOID
 * otherwise; the player's choice between the two areas when both hold one is not modelled. None
 * in either area is not done. The ACTI【HAND】 clause (discard this card, move a set card from
 * BASE to HAND) is not modelled and stays on the manual path, so the card badges partial.
 *
 * Printed Lv is read for the bound; `effective-power-lv-basis` is UNRULED. No ruling is specific to
 * this card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, relocate, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-014');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The characters placed: Lv3 or below with Web in the features. */
const smallWeb = characters({ feature: 'Web', lvMax: 3 });

/** The effect's IR. */
export function script(): EffectIR {
  const toBase = { side: 'self', area: 'BASE', faceDown: false } as const;
  return effect(
    CARD_NO,
    conditional(
      { kind: 'have', side: 'self', area: 'RETREAT', filter: smallWeb, min: 1, max: null },
      relocate(select('self', 'RETREAT', smallWeb), toBase),
      relocate(select('self', 'VOID', smallWeb), toBase),
    ),
    trigger('follows-host-to-retreat', 'RETREAT'),
  );
}
