/**
 * SD01-014, a Lv3 red Human that weakens an opposing small character when the player is behind in
 * BATTLE.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card enters the field by calling, if the number of your characters
 *   in BATTLE is less than your opponent's, 1 of your opponent's characters with Lv3 or below in
 *   BATTLE gets Power-2000 in this turn.
 *
 * Event tag: enters-field-by-call, FIELD. When the controller has strictly fewer characters in
 * BATTLE than the opponent, one opposing BATTLE character of Lv3 or below gets Power-2000 until
 * the end of the turn. Equal or higher counts do nothing; no Lv3-or-below target is not done.
 * The Lv filter reads the printed Lv (effective-power-lv-basis is UNRULED). No ruling is specific
 * to this card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, power, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-014');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'fewer-than-opponent', area: 'BATTLE', filter: characters() },
      power(select('opponent', 'BATTLE', characters({ lvMax: 3 })), -2000),
    ),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
