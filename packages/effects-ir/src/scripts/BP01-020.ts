/**
 * BP01-020, a character that recycles its own RETREAT into a draw.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you prune 1 of your red
 *   characters in RETREAT. If you do, you draw 1 card.
 *
 * The script prunes one red character from the controller's RETREAT and, only if that
 * happened, draws one card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  colored,
  draw,
  effect,
  ifDone,
  prune,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-020');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places card in VOID
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw from DECK top
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
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
    sequence(step(prune(select('self', 'RETREAT', colored('red')))), ifDone(draw('self', 1))),
  );
}
