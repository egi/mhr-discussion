/**
 * SP01-056, a character that knocks a random set card out of the opponent's BASE when it moves.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When this card takes BATTLE-BASE Move, you retreat 1 of your
 *   opponent's set cards in BASE randomly.
 *
 * Event tag: base-move, FIELD (301.24.a), once per turn (201.10.d.2), on this card's own move only.
 * The effect is mandatory (304.1.b). One face-down ("set", 301.13.a) card of the opponent's BASE
 * is picked at random and retreated (301.16.a.6). The pick is designated by the opponent and
 * travels in the action (301.29.a, "random"), so a replay retreats the same card. An opponent with
 * no set card in BASE leaves the effect not done and raises no error (304.1.d).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, effect, retreat, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR, EffectTarget } from '../ir';

export const CARD_NO = asCardNo('SP01-056');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect: ONCE PER TURN is an additional Condition
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move trigger
    { key: asRuleKey('301.16.a.6'), reviewedHash: 'd77bb1167305' }, // retreat face-down card
  ],
  rulings: [],
});

/** One random set card of the opponent's BASE. */
const randomSetCard = (): EffectTarget =>
  ({ ...select('opponent', 'BASE', { ...ANY_CARD, faceDown: true }, 1), random: true }) as EffectTarget;

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, retreat(randomSetCard()), trigger('base-move', 'FIELD'), {
    oncePerTurn: true,
  });
}
