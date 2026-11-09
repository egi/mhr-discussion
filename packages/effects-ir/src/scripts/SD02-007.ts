/**
 * SD02-007, a Lv6 Human that joins the field from the HAND once the RETREAT holds only yellow
 * characters, nine or more.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:If you have only yellow characters in RETREAT, and the number of them is 9 or
 *   more, you place this card from HAND into your field.
 *
 * An activation from the HAND. The player's own RETREAT must hold 9 or more yellow characters and
 * no character of another colour (blue, red, green, orange and purple are each tested for zero); then this card is
 * placed face up into the field, the lane or the BASE being the placement choice. Any other
 * RETREAT leaves the card in the HAND, with no error. No community ruling touches this card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { colored, conditional, effect, relocate, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-007');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('302.1.a'), reviewedHash: 'ea63c3694178' }, // FIELD area
  ],
  rulings: [],
});

const none = (color: 'blue' | 'red' | 'green' | 'orange' | 'purple') => ({
  kind: 'have' as const,
  side: 'self' as const,
  area: 'RETREAT' as const,
  filter: colored(color),
  min: 0,
  max: 0,
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'have', side: 'self', area: 'RETREAT', filter: colored('yellow'), min: 9, max: null },
      conditional(
        none('blue'),
        conditional(
          none('red'),
          conditional(
            none('green'),
            conditional(
              none('orange'),
              conditional(none('purple'), relocate(source(), { side: 'self', area: 'FIELD', faceDown: false })),
            ),
          ),
        ),
      ),
    ),
    trigger('activate', 'HAND'),
  );
}
