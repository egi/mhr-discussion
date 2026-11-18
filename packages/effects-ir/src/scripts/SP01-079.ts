/**
 * SP01-079, a character that weakens an opposing BATTLE character when it is pruned.
 *
 * Printed text (official card):
 *
 *   AUTO【FIELD】:If the character this card is attached to is with Lv3 or below, you cannot
 *   retreat that character to call a character.
 *   TRIG【VOID】:When this card enters VOID, 1 of your opponent's characters on BATTLE gets
 *   Power-1000 this turn.
 *
 * A script carries one effect, so this one is the TRIG. The AUTO clause is modelled in the
 * engine's AUTO registry, not here.
 *
 * Trigger: this-card-enters-void, VOID (201.10.d.2). The effect is mandatory: 1 opposing
 * character in BATTLE gets Power-1000 until the end of the turn (301.40.a). With no opposing
 * BATTLE character nothing happens.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, power, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-079');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    power(select('opponent', 'BATTLE', characters()), -1000),
    trigger('this-card-enters-void', 'VOID'),
  );
}
