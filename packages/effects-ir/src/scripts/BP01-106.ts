/**
 * BP01-106, a character that swaps a green HAND character for two cards when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you may discard 1 of your green
 *   characters in HAND. If you do, you draw 2 cards.
 *
 * The script lets the player discard one green character from the HAND and, only if that
 * happened, draws two cards.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  colored,
  discard,
  draw,
  effect,
  ifDone,
  optional,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-106');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
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
        step(discard(select('self', 'HAND', colored('green')))),
        ifDone(draw('self', 2)),
      ),
    ),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
