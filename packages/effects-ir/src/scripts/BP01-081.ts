/**
 * BP01-081 「Quantum Entanglement」Ant-Man, a Lv2 character that attaches itself to an attacker
 * from the HAND when an own blue character is attacked. Only the TRIG half is scripted.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:When your blue character is attacked, you may attach this card from HAND to your
 *   opponent's attacking character.
 *   AUTO【FIELD】:The R of the character attached by this card changes to 1.
 *
 * The script is the TRIG. The tag is `own-character-attacked` from the HAND, narrowed to a blue
 * defender (the `color` subject filter); the fire pins the attacking character as the trigger
 * subject. A HAND trigger needs no declaration and a card drawn at the same timing still triggers
 * (304.1.g.2, 304.1.k; discussion 18, HEAD-JUDGE, RESOLVED by rulebook 304.1.k). The attach is
 * optional (304.1.a): this card is stacked underneath the attacker and becomes an Attached Card
 * (301.25.a). A Weakness attack has no attacked character and does not fire it.
 *
 * Not modelled: the AUTO half (the R of the host becomes 1). It needs an entry in the AUTO
 * registry, which is engine code outside the script-only scope of this change (decision D-AUTO,
 * auto-backlog), so the card stays partial and uncovered; the engine does not apply the R change
 * and the manual path stays open for it.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attach, effect, optional, source, subject, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-081');

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
