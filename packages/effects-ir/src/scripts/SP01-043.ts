/**
 * SP01-043, a blue Lv4 counter that discards a card to place an Archenemy character.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【BACK/ONCE PER TURN】:You discard 1 of your cards in HAND. If you do, you may
 *   place 1 of your characters with 【Archenemy】 in their features from HAND onto your
 *   BATTLE.
 *
 * The script discards one HAND card and, only if that happened, lets the player place an
 * Archenemy character from the HAND onto the BATTLE. The lane comes from the invocation's
 * placement choice. The ONCE PER TURN Condition is
 * carried by the `oncePerTurn` marker on the IR and enforced by the engine. The basis is the card's
 * own printed Condition: 301.1.a gives effect text priority over rules text, and 201.10.f.3 only
 * says an Activated Effect may carry additional Conditions.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  discard,
  effect,
  ifDone,
  optional,
  relocate,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-043');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // counter activated effect
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND
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
      step(discard(select('self', 'HAND', ANY_CARD))),
      ifDone(
        optional(
          relocate(select('self', 'HAND', characters({ feature: 'Archenemy' })), {
            side: 'self',
            area: 'BATTLE',
            faceDown: false,
          }),
        ),
      ),
    ),
    undefined,
    { oncePerTurn: true },
  );
}
