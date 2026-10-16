/**
 * SD03-008, a blue Lv6 character that retreats a set BASE card to boost a BATTLE character.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/TWICE PER TURN】:You retreat 1 of your set cards in BASE.If you do, 1 of your
 *   characters in BATTLE gets Power+500 in this turn.
 *
 * The script retreats one face-down card from the player's BASE and, only if that happened,
 * raises the Power of one of their BATTLE characters by 500 until the end of the turn. The
 * twice-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  effect,
  ifDone,
  power,
  retreat,
  select,
  sequence,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-008');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves
    { key: asRuleKey('301.16.a.6'), reviewedHash: 'd77bb1167305' }, // retreat face-down card
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // greatest extent
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
      step(retreat(select('self', 'BASE', { ...ANY_CARD, faceDown: true }))),
      ifDone(power(select('self', 'BATTLE', characters()), 500)),
    ),
  );
}
