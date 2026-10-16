/**
 * BP01-015, a character that prunes a weak opposing character when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card enters the field by calling, you may prune 1 of your
 *   opponent's characters with Power 4000 or lower in BATTLE.
 *
 * The script lets the player prune one opposing BATTLE character with Power 4000 or less.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, optional, prune, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-015');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger timing
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places card in VOID
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(prune(select('opponent', 'BATTLE', characters({ powerMax: 4000 })))),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
