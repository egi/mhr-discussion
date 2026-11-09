/**
 * SD04-001, a card that attaches itself from the HAND to a Human character on the field during the
 * Counter Step.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【HAND】: You attach this card from HAND to 1 of the characters with 【Human】 in
 *   their features in the field.
 *   AUTO【FIELD】:The R of the character attached by this card changes to 0, and that character
 *   gets Power+1000.
 *
 * Event tag: activate-counter, HAND; no once-per-turn limit is printed. The AUTO clause is modelled
 * in packages/engine/src/cards/autos/index.ts ("The R of the character attached by this card
 * changes to 0, and that character gets Power+1000."), not here. The script stacks this card under
 * a Human character (301.25.a). The text says "the characters ... in the field" without "your";
 * the IR selector has no either-side choice, so the host is one of the player's own field
 * characters and an opposing host is NOT MODELLED (manual path), which badges the card partial.
 * With no legal host the activation is not done.
 *
 * Ruling note: community-rulings discussion 21 (HEAD-JUDGE, rulebook 303.2.a.4.3.2.5-7; the file
 * is not on the vendor board, so it is cited here only and not linked) says the Counter Step ends
 * when the attack disappears, for example when this card's R-0 change leaves the attacker without
 * a target. That is a consequence of the AUTO half and the Counter Step flow, not of this attach.
 *
 * Partial marker: the opposing-host choice the IR selector cannot yet offer is omitted (USER
 * DECISION: opposing Human characters are allowed, not a head-judge ruling), so the card badges
 * partial and keeps its manual Apply effect path. The AUTO half is implemented in
 * packages/engine/src/cards/autos/index.ts and is not missing. The marker is temporary (removed by
 * plan 17.4-15).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attach, characters, effect, select, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-001');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    attach(source(), select('self', 'FIELD', characters({ feature: 'Human' }))),
    trigger('activate-counter', 'HAND'),
    { partial: true },
  );
}
