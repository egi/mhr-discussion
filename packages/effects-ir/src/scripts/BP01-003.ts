/**
 * BP01-003, a red Lv6 character with a power-scaled end-of-turn effect.
 *
 * Printed text (official card):
 *
 *   TRIG【WING】:When your turn ends, if this card did not attack in this turn, 1 of your
 *   opponent's characters in BATTLE gets Power-X in this turn. X is the Power of this card.
 *
 * The script is the effect after the trigger: when this card did not attack, lower one
 * opposing BATTLE character's Power by this card's own Power until the end of the turn.
 * "When your turn ends" is the envelope that decides when the script is offered.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, select, statMod } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-003');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('303.2.a.6.1.1'), reviewedHash: 'bd4b199e9ed5' }, // end-of-turn triggers
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'source-did-not-attack' },
      statMod(select('opponent', 'BATTLE', characters()), 'power', -1, 'self-power'),
    ),
  );
}
