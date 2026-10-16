/**
 * BP01-118, a character that loots when it moves.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card takes BATTLE-BASE Move, you draw 1 card. If you do, you
 *   discard 1 of your cards in HAND.
 *
 * The script draws one card and, only if that happened, discards one card from the HAND.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  discard,
  draw,
  effect,
  ifDone,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-118');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard
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
    sequence(step(draw('self', 1)), ifDone(discard(select('self', 'HAND', ANY_CARD)))),
  );
}
