/**
 * BP01-039, a yellow character that can be placed straight from the HAND.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:If you have 3 yellow characters in BATTLE, you place this card from HAND
 *   into your BATTLE.
 *
 * The script places this card into the controller's BATTLE when the BATTLE holds at least
 * three yellow characters ("have 3" is read as a lower bound). The destination lane is the
 * invocation's placement choice, or the one free lane when there is only one.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { colored, conditional, effect, relocate, source } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-039');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place card face-up
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'have', side: 'self', area: 'BATTLE', filter: colored('yellow'), min: 3, max: null },
      relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false }),
    ),
  );
}
