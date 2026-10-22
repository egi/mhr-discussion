/**
 * BP01-033, a War Machine in the BACK that weakens an opposing BATTLE character whenever an
 * Avengers character attacks.
 *
 * Printed text (official card):
 *
 *   TRIG【BACK】:When your character with 【Avengers】 in its feature attacks, 1 of your
 *   opponent's characters in BATTLE gets Power-500 in this turn.
 *
 * The script is the effect after the trigger: one opposing BATTLE character gets Power-500 until
 * the end of the turn. "When your character with Avengers in its feature attacks" is carried by the
 * trigger tag: an `attacks` event fired from BACK (the carrier stands in the controller's BACK),
 * filtered to an attacker of the same player whose printed traits include Avengers. The trigger is
 * mandatory (304.1.b) and is not an op.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, power, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-033');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('301.8.a'), reviewedHash: '7008a08eb9de' }, // power floor of zero
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    power(select('opponent', 'BATTLE', characters()), -500),
    trigger('attacks', 'BACK', { controller: 'self', feature: 'Avengers' }),
  );
}
