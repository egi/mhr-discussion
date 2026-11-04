/**
 * SD01-003, a character that weakens an opposing character whenever one of yours grows.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE/ONCE PER TURN】: When the R or the Power of your character increase, 1 of your
 *   opponent's characters in BATTLE gets Power-1000 in this turn.
 *
 * The trigger is an increase of R or of Power on any of the controller's characters
 * (`own-character-r-or-power-increases`, an R-only increase counts, a decrease does not). The
 * script gives one opposing BATTLE character Power-1000 until the end of the turn. ONCE PER TURN
 * is the `oncePerTurn` marker on the IR.
 *
 * Open point: a Power change landing on a card that already carries a Trigger Effect change is not
 * lettered for every combination (301.41, discussion 10 item 4, ESCALATE-OPEN); the engine's
 * reading applies.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, power, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-003');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // trigger timing
    { key: asRuleKey('301.1.a'), reviewedHash: 'f5fb571c54b2' }, // printed Condition (ONCE PER TURN)
    { key: asRuleKey('301.41.k'), reviewedHash: '16ffb3d7924e' }, // trigger change after a trigger change
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [{ discussion: '10', rule: asRuleKey('301.41.k') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    power(select('opponent', 'BATTLE', characters()), -1000),
    trigger('own-character-r-or-power-increases', 'BATTLE'),
    { oncePerTurn: true },
  );
}
