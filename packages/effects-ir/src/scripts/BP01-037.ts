/**
 * BP01-037, a character that brings a small Ultron back from the RETREAT when called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you may place 1 of your characters
 *   with Lv2 or below and 【Ultron】 in their names from RETREAT into your field.
 *
 * The script is the effect after the trigger: an optional placement of one of the controller's
 * RETREAT characters with Lv2 or below and Ultron in its name into the field, face up (301.12.a).
 * The name test is a substring match on the card's name (201.7.b), ignoring case. The lane or the
 * BASE is the player's placement choice; with several legal spots and no choice the effect is
 * unexecutable. With no such card in the RETREAT nothing happens.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, optional, relocate, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-037');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      relocate(select('self', 'RETREAT', characters({ lvMax: 2, nameIncludes: 'ULTRON' })), {
        side: 'self',
        area: 'FIELD',
        faceDown: false,
      }),
    ),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
