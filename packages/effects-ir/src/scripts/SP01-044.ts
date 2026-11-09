/**
 * SP01-044, a character that covers a low-Lv BASE character on entering to power itself up.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When this card enters the field, you may cover 1 of the characters with
 *   original Lv3 or below in BASE. If you do, this card gets R+3 and Power+3000 this turn.
 *
 * Event tag: enters-field, BATTLE (201.10.d.2). The effect is optional (304.1.a). The printed text
 * says "1 of the characters" with no owner word, so the choice is a character of either side's
 * BASE and no owner restriction is added. The Lv bound reads the printed (original) Lv, which the
 * card text states, so no effective-basis reading is involved. Only if the cover was done does
 * this card get R+3 and Power+3000 until the end of the turn. Nothing is left unmodelled.
 *
 * Reading taken from the card survey, not a rule: "cover" is read as turning a BASE card
 * face-down (301.14.a.1). It rests on the glossary tier and no ruling settles it; the interpreter
 * carries the same open marker.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  cover,
  effect,
  ifDone,
  optional,
  power,
  selectEitherSide,
  sequence,
  source,
  statMod,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-044');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('301.14.a.1'), reviewedHash: 'e129e0620d73' }, // turn a character face-down
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(cover(selectEitherSide('BASE', characters({ lvMax: 3, original: true })))),
        ifDone(statMod(source(), 'r', 3)),
        ifDone(power(source(), 3000)),
      ),
    ),
    trigger('enters-field', 'BATTLE'),
  );
}
