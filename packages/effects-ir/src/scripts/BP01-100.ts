/**
 * BP01-100, a character that shrinks the range of an opposing character when it enters the field.
 *
 * Printed text (official card):
 *
 *   COUNTER, AUTO【HAND】: this card may be called in the COUNTER PHASE or COUNTER STEP.
 *   TRIG【FIELD】:When this card enters the field, 1 of your opponent's characters in the field
 *   gets R-1 in this turn.
 *
 * The COUNTER keyword is the registered AUTO half (discussion 01, RESOLVED) and is not an IR
 * clause. The script is the trigger line: the tag is `enters-field`, so it fires whether the card
 * enters by calling or by an effect. One opposing character in the field is picked and gets R-1
 * until the end of the turn; with no opposing character the effect does nothing.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, select, statMod, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-100');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    statMod(select('opponent', 'FIELD', characters()), 'r', -1),
    trigger('enters-field', 'FIELD'),
  );
}
