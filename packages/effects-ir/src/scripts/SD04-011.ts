/**
 * SD04-011, a green Lv4 character that sets a BATTLE character's R to 2.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/ONCE PER TURN】:The R of 1 of your characters in BATTLE changes to 2 in this
 *   turn.
 *
 * The script sets the R of one of the player's BATTLE characters to 2 until the end of the
 * turn. The interpreter records that as a change (a `set` modifier), which ends any earlier
 * modifier on the same card's R. The once-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  select,
  statSet,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-011');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves
    { key: asRuleKey('301.41.a'), reviewedHash: '8283945e3cc4' }, // change ends earlier modifier
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('301.41.a') },
    { discussion: '10', rule: asRuleKey('301.41.a') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    statSet(select('self', 'BATTLE', characters()), 'r', 2),
  );
}
