/**
 * BP01-008, a character that clears every attached card from both fields.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】：When this card enters the field, you may prune all the attaching cards of
 *   all the characters in both field.
 *
 * The script is the effect after the trigger: an optional prune of every attached card on the
 * player's side, then on the opponent's side.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  effect,
  optional,
  prune,
  selectAll,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-008');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(prune(selectAll('self', 'ATTACHED', ANY_CARD))),
        step(prune(selectAll('opponent', 'ATTACHED', ANY_CARD))),
      ),
    ),
    trigger('enters-field', 'FIELD'),
  );
}
