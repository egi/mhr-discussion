/**
 * BP01-053, a character that hits harder against a high-Lv target.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】：When this card attacks, if its target is the character with Lv4 or above,
 *   this card gets Power+1500 in this turn.
 *
 * The script tests the attack target (the subject) for Lv4 or above and, if so, raises this
 * card's Power by 1500 until the end of the turn. The invoker names the target as the
 * subject.
 */

import { asCardNo } from '@mhr/core';
import { characters, conditional, effect, power, source } from '../combinators';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-053');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'subject-matches', filter: characters({ lvMin: 4 }) },
      power(source(), 1500),
    ),
  );
}
