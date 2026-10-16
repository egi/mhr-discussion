/**
 * SD01-007, a character that pays a card to weaken a mid-Lv opposing BATTLE character.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you may discard 1 of your cards
 *   in HAND. If you do, 1 of your opponent's characters with Lv5 or below in BATTLE gets
 *   Power-2000 in this turn.
 *
 * The script lets the player discard one HAND card and, only if that happened, lowers the
 * Power of an opposing BATTLE character of Lv5 or below by 2000 until the end of the turn.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  discard,
  effect,
  ifDone,
  optional,
  power,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-007');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
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
    optional(
      sequence(
        step(discard(select('self', 'HAND', ANY_CARD))),
        ifDone(power(select('opponent', 'BATTLE', characters({ lvMax: 5 })), -2000)),
      ),
    ),
  );
}
