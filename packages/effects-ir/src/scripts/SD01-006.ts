/**
 * SD01-006 Hourglass Bite, a counter-free HAND activation that trades itself for three retreats.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:You discard this card in HAND. If you do, you retreat 1 of your characters in
 *   BATTLE, 1 of your cards in BASE and 1 of your opponent's characters with Lv5 or below in
 *   BATTLE.
 *
 * The script discards the card from the HAND and, only if that was done, retreats the three named
 * cards. The three retreats are independent parts of one effect: a part with no target does
 * nothing and the others still resolve to the greatest extent possible (304.1.d). They sit
 * inside one gated block, as separate 'always' steps, so an empty part does not stop the next one
 * (a chain of `ifDone` steps would). The card is not in the HAND: the discard cannot be done and
 * the effect is unexecutable, nothing moves. The discard being done and no part having a
 * target: the discard stays and the effect resolves (discussion 25, HEAD-JUDGE provisional).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  discard,
  effect,
  ifDone,
  retreat,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-006');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat a character by effect
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
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
      step(discard(source())),
      ifDone(
        sequence(
          step(retreat(select('self', 'BATTLE', characters())), 'always'),
          step(retreat(select('self', 'BASE', ANY_CARD)), 'always'),
          step(retreat(select('opponent', 'BATTLE', characters({ lvMax: 5 }))), 'always'),
        ),
      ),
    ),
    trigger('activate', 'HAND'),
  );
}
