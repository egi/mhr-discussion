/**
 * SD01-010, a card that attaches itself from the HAND to a Human character on the field.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】：You attach this card from HAND to 1 of your characters with 【Human】 in their
 *   features in the field.
 *   AUTO【FIELD】:The character attached by this card gets R+1.
 *
 * Event tag: activate, HAND. The AUTO clause is modelled in packages/engine/src/cards/autos/index.ts
 * ("The character attached by this card gets R+1."), not here. The script stacks this card under
 * one of the player's own field characters with Human in its features (301.25.a, a stacked card is
 * an attached card). A character without Human is not a legal host; with no Human character in the
 * field the activation is not done and the card stays in the HAND.
 *
 * No community ruling is involved.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attach, characters, effect, select, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-010');

export const RULE_DECLARATION = declareRules({
  rules: [
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
    trigger('activate', 'HAND'),
  );
}
