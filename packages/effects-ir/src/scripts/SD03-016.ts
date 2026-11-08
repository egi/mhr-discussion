/**
 * SD03-016, a card that attaches itself from the HAND to the opposing attacker when an own blue
 * character is attacked.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】: When your blue character is attacked, you may attach this card from HAND to your
 *   opponent's attacking character.
 *   AUTO【FIELD】: The R of the character attached by this card changes to 1.
 *
 * Event tag: own-character-attacked, HAND, narrowed to a blue defender (the `color` subject
 * filter); the fire pins the attacking character as the trigger subject. The AUTO clause is
 * modelled in packages/engine/src/cards/autos/index.ts ("The R of the character attached by this
 * card changes to 1."), not here. A HAND trigger needs no declaration and a card drawn at the same
 * timing still triggers (304.1.g.2, 304.1.k; discussion 18, HEAD-JUDGE, RESOLVED by rulebook
 * 304.1.k). The attach is optional (304.1.a); this card is stacked under the attacker and becomes
 * an attached card (301.25.a). A defender of another colour does not fire it, and a Weakness
 * attack has no attacked character.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attach, effect, optional, source, subject, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-016');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('304.1.g.2'), reviewedHash: '107585942132' }, // HAND triggers need no declaration
    { key: asRuleKey('304.1.k'), reviewedHash: '1c37c93f925c' }, // a card now in HAND still triggers
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a card stacked under a character is attached
  ],
  rulings: [{ discussion: '18', rule: asRuleKey('304.1.k') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(attach(source(), subject())),
    trigger('own-character-attacked', 'HAND', undefined, { color: 'blue' }),
  );
}
