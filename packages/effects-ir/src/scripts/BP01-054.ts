/**
 * BP01-054, a character that discards a Machine to bring a big Ultron back to the HAND.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you may discard 1 of your
 *   characters with 【Machine】 in their features in HAND. If you do, you move 1 of your
 *   characters with Lv4 or above and 【Ultron】 in their features from RETREAT back to your HAND.
 *
 * The script is the effect after the trigger: optionally discard one HAND character with the
 * Machine feature (301.15.a), and only if that was done move one RETREAT character with Lv4 or
 * above and Ultron to the HAND. The English text says Ultron "in their features", but no card has
 * an Ultron feature in the card data (Ultron cards carry the Machine feature only), so read
 * literally the move could never find a target. The official Indonesian text of this card says
 * "bernama [Ultron]" (named Ultron), so the Ultron test is read as a name test (substring match,
 * 201.7.b, ignoring case). This reading comes from the card data, not from a ruling.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  discard,
  effect,
  ifDone,
  optional,
  relocate,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-054');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // greatest extent
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(discard(select('self', 'HAND', characters({ feature: 'Machine' })))),
        ifDone(
          relocate(select('self', 'RETREAT', characters({ lvMin: 4, nameIncludes: 'ULTRON' })), {
            side: 'self',
            area: 'HAND',
            faceDown: false,
          }),
        ),
      ),
    ),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
