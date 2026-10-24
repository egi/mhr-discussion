/**
 * SD03-003, a blue Lv4 character that swaps itself for an Avengers HAND character after a BATTLE-BASE Move.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card takes BATTLE-BASE Move, you may place 1 of your characters
 *   with 【Avengers】 in their features from HAND onto your BATTLE. If you do, you retreat
 *   this card.
 *
 * The script lets the player place an Avengers character from the HAND onto the BATTLE and,
 * only if that happened, retreats the card itself. The lane comes from the invocation's
 * placement choice. The BATTLE-BASE Move trigger is the envelope that decides when it may run.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  optional,
  relocate,
  retreat,
  select,
  sequence,
  source,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-003');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat by effect
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
        step(
          relocate(select('self', 'HAND', characters({ feature: 'Avengers' })), {
            side: 'self',
            area: 'BATTLE',
            faceDown: false,
          }),
        ),
        ifDone(retreat(source())),
      ),
    ),
  );
}
