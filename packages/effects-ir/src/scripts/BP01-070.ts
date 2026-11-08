/**
 * BP01-070 「Time Guide」Loki, a Lv3 character that stocks the BASE when a blue character arrives.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When your blue character enters the field, you may place the top
 *   card of your deck face down into your BASE.
 *
 * The trigger tag is `own-character-enters-field` from the FIELD, narrowed to a blue character
 * (the `color` subject filter); the entering character can be this card itself. The `oncePerTurn`
 * marker limits it to one fire per turn (ONCE PER TURN cites no rule). The placement is optional
 * (304.1.a): the top deck card is SET face down into the BASE (301.13.a), becoming a Face-Down
 * Card (301.21.a). An empty deck places nothing. The trigger area is the FIELD, so a copy in the
 * HAND does not fire.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, effect, optional, relocate, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-070');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET puts card face-down
    { key: asRuleKey('301.21.a'), reviewedHash: '73c1095ad66d' }, // becomes a Face-Down Card
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(relocate(select('self', 'DECK', ANY_CARD, 1), { side: 'self', area: 'BASE', faceDown: true })),
    trigger('own-character-enters-field', 'FIELD', undefined, { color: 'blue' }),
    { oncePerTurn: true },
  );
}
