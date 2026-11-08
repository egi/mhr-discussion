/**
 * BP01-043, a character that cycles an Ultron through the RETREAT for a card and a Machine.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you retreat 1 of your characters
 *   with 【Ultron】 in their names in the field. If you do, you draw 1 card and you may place 1
 *   of your characters with Lv3 or below and 【Machine】 in their features from HAND into your
 *   field.
 *
 * The script is the effect after the trigger: retreat one of the controller's FIELD characters
 * with Ultron in its name (substring match, 201.7.b, ignoring case; this card itself qualifies
 * when it has Ultron in its name). Only if that was done, draw 1 card and then optionally place
 * one HAND character with Lv3 or below and the Machine feature into the field, face up (301.12.a).
 * The draw and the placement are independent parts of one "If you do" (discussions 09 and 10), so
 * an empty deck does not stop the placement. The lane or the BASE is the player's placement
 * choice. With no Ultron in the field nothing happens.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  draw,
  effect,
  ifDone,
  optional,
  relocate,
  retreat,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-043');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.16.a'), reviewedHash: '72a1ab425b37' }, // retreat a character
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
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
    sequence(
      step(retreat(select('self', 'FIELD', characters({ nameIncludes: 'ULTRON' })))),
      ifDone(
        sequence(
          step(draw('self', 1)),
          step(
            optional(
              relocate(select('self', 'HAND', characters({ lvMax: 3, feature: 'Machine' })), {
                side: 'self',
                area: 'FIELD',
                faceDown: false,
              }),
            ),
          ),
        ),
      ),
    ),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
