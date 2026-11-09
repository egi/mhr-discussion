/**
 * BP01-045, a character that passes its own Power gain on to a Machine.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE/ONCE PER TURN】:When the Power of this card increases, 1 of your characters with
 *   【Machine】 in their features in BATTLE except this card gets Power+X in this turn. X is the
 *   value of Power increasing this time.
 *
 * The trigger is the Power increase of this card (`power-increases`, seen by the card whose Power
 * changed). The script gives one of the controller's other Machine characters in the BATTLE Power
 * equal to the amount of the increase (`power-increase-value`). This card is never offered
 * (`exceptSource`); with no Machine on the BATTLE the effect has nothing to do.
 *
 * Open point: the rulebook has no letter for a Power change landing on a card that already carries
 * a Trigger Effect change of the same kind in every combination (301.41, discussion 10 item 4,
 * ESCALATE-OPEN), so a later change replacing or adding to an earlier one on the chosen Machine is
 * the engine's reading, not a settled one. ONCE PER TURN is the `oncePerTurn` marker on the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, select, statMod, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-045');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // trigger timing
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect: printed Condition (ONCE PER TURN) is an additional Condition
    { key: asRuleKey('301.41.k'), reviewedHash: '16ffb3d7924e' }, // trigger change after a trigger change
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [{ discussion: '10', rule: asRuleKey('301.41.k') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    statMod(
      select('self', 'BATTLE', characters({ feature: 'Machine', exceptSource: true })),
      'power',
      1,
      'power-increase-value',
    ),
    trigger('power-increases', 'BATTLE'),
    { oncePerTurn: true },
  );
}
