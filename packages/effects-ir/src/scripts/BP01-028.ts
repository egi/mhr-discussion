/**
 * BP01-028, a character that is placed into the opponent's BASE from the HAND.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:If your opponent has the characters in BASE, you place this card in from HAND
 *   into your opponent's BASE.
 *   TRIG【FIELD】:When this card enters the field, you retreat 1 of your characters with Lv3 or
 *   below in BASE, which is chosen by your opponent.
 *
 * The script is the first clause only: if the opponent has a character in BASE, this card moves
 * from the HAND into the opponent's BASE. The second clause is not modelled (the opponent chooses
 * the retreated card), so the card badges partial at best and that clause is played by hand.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, relocate, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-028');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE area
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'have', side: 'opponent', area: 'BASE', filter: characters(), min: 1, max: null },
      relocate(source(), { side: 'opponent', area: 'BASE', faceDown: false }),
    ),
    trigger('activate', 'HAND'),
  );
}
