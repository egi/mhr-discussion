/**
 * EB01-006, a Hulk that weakens itself and an opposing Lv6 character when that character enters
 * the field.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When your opponent's character with Lv6 enters the field, both of this card
 *   and that character get Power-1000 in this turn.
 *
 * The trigger tag is `opponent-character-enters-field` from the BATTLE, narrowed to a character
 * of printed Lv6 (the `level` subject filter, which reads the printed Lv). It fires for the seat
 * that does not control the entering character, for a call and for an entry by effect, not for
 * an own entry. The effect is mandatory (304.1.b): this card gets Power-1000 until the end of the
 * turn, and so does the entering character (the fire's subject). Power cannot go below 0
 * (301.8.a). Tiers: no community ruling touches this card (searched discussions/by-card.md and
 * the glossary); everything here is card text and the rulebook.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, power, sequence, source, step, subject, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('EB01-006');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('301.8.a'), reviewedHash: '7008a08eb9de' }, // power floor of zero
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(step(power(source(), -1000)), step(power(subject(), -1000))),
    trigger('opponent-character-enters-field', 'BATTLE', undefined, { level: 6 }),
  );
}
