/**
 * EB01-009, a Winter Soldier that trades itself for a small opposing character after winning a
 * fight.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When this card wins the fight, you may retreat both of this card and 1 of
 *   your opponent's characters with Lv3 or below in BATTLE.
 *
 * The trigger tag is `wins-fight` from the BATTLE: it fires for the winner of a fight, as
 * attacker or as defender (303.2.a.4.3.3.1.1 and .1.2). The effect is optional (304.1.a). Both
 * retreats are one instruction, so there is no "If you do" gate: the opposing BATTLE character
 * of printed Lv3 or lower goes first and this card last, so that this card is still on the
 * board while the other retreat resolves. With no opposing Lv3-or-lower BATTLE character, this
 * card still retreats (resolve as far as it can, 304.1.d). The loser of the fight has already
 * retreated when the trigger resolves, so it is never the target. No community ruling touches
 * this card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, optional, retreat, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('EB01-009');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('303.2.a.4.3.3.1.1'), reviewedHash: 'c5cd4c5f7337' }, // the Turn Player's Character wins the fight
    { key: asRuleKey('303.2.a.4.3.3.1.2'), reviewedHash: '7a3de69bfb97' }, // the Opposing Player's Character wins the fight
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat a character by effect
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(retreat(select('opponent', 'BATTLE', characters({ lvMax: 3 })))),
        step(retreat(source())),
      ),
    ),
    trigger('wins-fight', 'BATTLE'),
  );
}
