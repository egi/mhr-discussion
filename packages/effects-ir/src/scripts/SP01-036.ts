/**
 * SP01-036, an attachment that prunes itself as a counter to return 1 own yellow Human character
 * from the field to the HAND.
 *
 * Printed text (official card):
 *
 *   AUTO【FIELD】:The character this card is attached to gets Power+1000.
 *   COUNTER·ACTI【FIELD/ONCE PER TURN】:You prune this card on the field. If you do, you move 1
 *   of your yellow characters with 【Human】 in their features from the field back to your HAND.
 *
 * A script carries one effect, so this one is the COUNTER·ACTI. The AUTO clause is modelled in the
 * engine's AUTO registry, not here.
 *
 * Event tag: activate-counter, FIELD, once per turn (201.10.f.3; ONCE PER TURN is an additional
 * Condition). This card is pruned (301.17.a); only if that was done is 1 own yellow Human
 * character moved from the field to the HAND. The cost is paid and the second part does what it
 * can: with no yellow Human character on the field the prune stays and nothing is returned
 * (discussion 24, HEAD-JUDGE for the principle via mhrdecklab FAQ F-29, CONSENSUS for the cases;
 * 304.1.d). "If you do" is Reading B (user decision 2026-11-03, discussion 10 item 3).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { colored, effect, ifDone, prune, relocate, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-036');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '10', rule: asRuleKey('304.1.d') },
    { discussion: '24', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(prune(source())),
      ifDone(relocate(select('self', 'FIELD', colored('yellow', { feature: 'Human' })), { side: 'self', area: 'HAND', faceDown: false })),
    ),
    trigger('activate-counter', 'FIELD'),
    { oncePerTurn: true },
  );
}
