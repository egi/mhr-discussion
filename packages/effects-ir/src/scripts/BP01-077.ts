/**
 * BP01-077, a character that cycles a card from the DECK into the BASE when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you draw 1 card. If you do, you
 *   place the top card of your deck face down into your BASE.
 *
 * The script draws one card and, only if that happened, places the new top DECK card face
 * down into the BASE.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  draw,
  effect,
  ifDone,
  relocate,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-077');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // set face-down
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
      step(draw('self', 1)),
      ifDone(
        relocate(select('self', 'DECK', ANY_CARD), { side: 'self', area: 'BASE', faceDown: true }),
      ),
    ),
  );
}
