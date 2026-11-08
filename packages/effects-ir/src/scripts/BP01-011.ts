/**
 * BP01-011, a character that draws a card when called and then may attack twice.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you draw 1 card. If you do, this
 *   card gets the second chance to attack character only in this turn.
 *
 * The script is the effect after the trigger: draw 1 card, and only if that was done give this
 * card the second chance to attack, which can target characters only, for this turn. With an
 * empty deck nothing is drawn, so the grant does not run ("If you do", Reading B, the engine
 * default: discussion 10 item 3 is closed by the user decision of 2026-11-04, CR 301.38.a). The
 * second chance is limited to attacking a character by rule, not by this script. The trigger is
 * mandatory (304.1.b).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  draw,
  effect,
  grantSecondChanceAttack,
  ifDone,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-011');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(step(draw('self', 1)), ifDone(grantSecondChanceAttack(source()))),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
