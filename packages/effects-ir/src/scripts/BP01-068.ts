/**
 * BP01-068, a Lv6 Human that takes the character that beat it down with it.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT by losing the fight, if the character that wins
 *   that fight is with 【Human】 in its feature, you retreat that character.
 *
 * The trigger tag is `enters-retreat-by-losing-fight` from the RETREAT. The condition is
 * `winner-matches`: the fight winner, read live where it stands when the trigger resolves, has
 * Human among its features. A winner that has left the FIELD by then fails the condition and
 * nothing is retreated. The effect then retreats that winner (rule 301.16.a.3), through the
 * `winner` target; the trigger subject is not read. The effect is not optional (no "may").
 *
 * This card is not linked to any community-ruling discussion.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, retreat, trigger, winnerMatches, winningCharacter } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-068');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat by effect
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(winnerMatches(characters({ feature: 'Human' })), retreat(winningCharacter())),
    trigger('enters-retreat-by-losing-fight', 'RETREAT'),
  );
}
