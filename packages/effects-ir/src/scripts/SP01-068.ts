/**
 * SP01-068, a card that attaches itself to an opposing BATTLE character after losing a fight.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT from BATTLE by losing the fight, you attach this
 *   card from RETREAT to 1 of your opponent's characters on BATTLE.
 *   TRIG【BATTLE】:When you attach this card to a character on BATTLE, if that character is with
 *   Power4000 or lower, that character takes BATTLE-BASE Move once. If they do and there is a
 *   card with 【Machine】 in its feature on the field except this card, you cover that character.
 *
 * Event tag: enters-retreat-by-losing-fight, RETREAT. A script carries one clause, so this is the
 * first printed clause (TRIG): this card is stacked from the RETREAT under one opposing BATTLE
 * character (301.25.a); the attached card sits on the host's seat. With no opposing BATTLE
 * character the effect is not done and the card stays in the RETREAT. The second TRIG【BATTLE】
 * clause (the BATTLE-BASE Move of a Power4000-or-lower host and the cover) is not modelled and
 * stays on the manual path, so the card badges partial. The community discussion 32 (attachments
 * follow the host) is the related reading.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attach, characters, effect, select, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-068');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    attach(source(), select('opponent', 'BATTLE', characters())),
    trigger('enters-retreat-by-losing-fight', 'RETREAT'),
  );
}
