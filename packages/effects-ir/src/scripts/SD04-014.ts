/**
 * SD04-014, a card that swaps itself out of the RETREAT for a Lv6 field character.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT by discarding of effect, you may swap this card
 *   in RETREAT and 1 of your characters with Lv6 in the field.
 *
 * The script lets the player swap this card in the RETREAT with one of their Lv6 characters in
 * the field. "When this card enters RETREAT by discarding of effect" is the envelope;
 * discarding by effect is not an existing trigger event, so the script carries no trigger tag.
 * The swap is an op the interpreter does not run yet, so applying this script answers
 * EFFECT_UNSUPPORTED, changes nothing, and the card is played by hand.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, optional, select, source, swap } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-014');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.18.d'), reviewedHash: '75dd0629d8dd' }, // swap counts as moving
    { key: asRuleKey('301.18.h'), reviewedHash: 'bce92f4d4890' }, // movement prevention blocks swap
    { key: asRuleKey('303.2.a.4.3.2.2'), reviewedHash: '16c82563f537' }, // invalid target returns to selection
  ],
  rulings: [
    { discussion: '04', rule: asRuleKey('301.18.h') },
    { discussion: '05', rule: asRuleKey('303.2.a.4.3.2.2') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(swap(source(), select('self', 'FIELD', characters({ lvMin: 6, lvMax: 6 })))),
  );
}
