/**
 * SD04-006, a green Lv1 character that bounces an Avengers character to draw.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When this card takes BATTLE-BASE Move, you move 1 of your
 *   characters with 【Avengers】 in their features from the field back to your HAND. If you
 *   do, you draw 1 card.
 *
 * The script moves one Avengers character from the player's field back to their HAND and, only
 * if that happened, draws one card. The BATTLE-BASE Move trigger and the once-per-turn limit
 * are the envelope and a use limit, not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
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

export const CARD_NO = asCardNo('SD04-006');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect BATTLE-BASE move
    { key: asRuleKey('301.3.b'), reviewedHash: '5c8f12e6e820' }, // return to owner HAND
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
    sequence(
      step(
        relocate(select('self', 'FIELD', characters({ feature: 'Avengers' })), {
          side: 'self',
          area: 'HAND',
          faceDown: false,
        }),
      ),
      ifDone(draw('self', 1)),
    ),
  );
}
