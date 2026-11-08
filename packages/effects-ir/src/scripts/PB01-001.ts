/**
 * PB01-001, a Drax that raises the R of the rest of the Guardians after winning a fight.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When this card wins the fight, all your characters with 【GOTG】 in their
 *   features in BATTLE except this card get R+1 in this turn.
 *
 * The trigger tag is `wins-fight` from the BATTLE: the winner of a fight, as attacker or as
 * defender (303.2.a.4.3.3.1.1 and .1.2). The effect is mandatory (304.1.b). [All] is the
 * maximum selection (301.46.a): every other own GOTG character in the BATTLE gets R+1 until the
 * end of the turn; the BASE and the opposing side are not touched. With no such character the
 * effect resolves with nothing to change (301.46.b). No community ruling touches this card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, selectAll, statMod, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('PB01-001');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('303.2.a.4.3.3.1.1'), reviewedHash: 'c5cd4c5f7337' }, // the Turn Player's Character wins the fight
    { key: asRuleKey('303.2.a.4.3.3.1.2'), reviewedHash: '7a3de69bfb97' }, // the Opposing Player's Character wins the fight
    { key: asRuleKey('301.46.a'), reviewedHash: '011fa308dbc2' }, // [All] is the maximum selection
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    statMod(selectAll('self', 'BATTLE', characters({ feature: 'GOTG', exceptSource: true })), 'r', 1),
    trigger('wins-fight', 'BATTLE'),
  );
}
