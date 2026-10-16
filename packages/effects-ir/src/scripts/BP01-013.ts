/**
 * BP01-013, a character that pushes an opposing Human back to the BASE and covers it.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you move 1 of your opponent's
 *   characters with 【Human】 in their features and Power 5000 or higher from BATTLE to your
 *   opponent's BASE. If you do, you cover that character.
 *
 * The script moves one opposing Human character with Power 5000 or more from BATTLE to its
 * owner's BASE, then, only if that happened, covers it ("that character" is the subject).
 * The cover step is an op the interpreter does not run yet, so applying this script today
 * answers EFFECT_UNSUPPORTED and the card is played by hand.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  cover,
  effect,
  ifDone,
  relocate,
  select,
  sequence,
  step,
  subject,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-013');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect move BATTLE to BASE
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
    sequence(
      step(
        relocate(
          select('opponent', 'BATTLE', characters({ feature: 'Human', powerMin: 5000 })),
          { side: 'opponent', area: 'BASE', faceDown: false },
        ),
      ),
      ifDone(cover(subject())),
    ),
  );
}
