/**
 * SD04-003, a character that prunes itself on leaving the field to send the highest-Lv own
 * character and the lowest-Lv opposing character back to their HANDs.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT from the field, you prune this card in RETREAT.
 *   If you do, you move 1 of your characters with the highest Lv and 1 of your opponent's
 *   characters with the lowest Lv from BATTLE back to their own HAND.
 *
 * The script prunes this card from the RETREAT and, only if that was done, moves the two named
 * characters to their owners' HANDs. The two moves are independent parts of one "If you do", so
 * they sit in one gated block as separate 'always' steps: a side with no BATTLE character does
 * not stop the other (discussion 24, discussion 25; Reading B, the current engine reading of
 * discussion 10). The highest or lowest Lv is the `extreme` facet. Tie policy: every tied
 * character stays a candidate and the player chooses among them. Which Lv counts (effective or
 * printed) is the open `effective-power-lv-basis` point and is not settled here.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  prune,
  relocate,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-003');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
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
      step(prune(source())),
      ifDone(
        sequence(
          step(
            relocate(
              select('self', 'BATTLE', characters({ extreme: { stat: 'lv', which: 'highest' } })),
              { side: 'self', area: 'HAND', faceDown: false },
            ),
            'always',
          ),
          step(
            relocate(
              select('opponent', 'BATTLE', characters({ extreme: { stat: 'lv', which: 'lowest' } })),
              { side: 'opponent', area: 'HAND', faceDown: false },
            ),
            'always',
          ),
        ),
      ),
    ),
    trigger('enters-retreat-from-field', 'RETREAT'),
  );
}
