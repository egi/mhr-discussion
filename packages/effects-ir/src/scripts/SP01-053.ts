/**
 * SP01-053, a card in the HAND that attaches itself to a weak Human attacker for the price of the
 * bottom of the deck. Only the TRIG half is scripted.
 *
 * Printed text (official card):
 *
 *   BLOCK
 *   TRIG【HAND】:When your opponent's character with 【Human】 in its feature and original Power3000
 *   or lower attacks, you may discard the bottom 3 cards of your deck. If you do, you attach this
 *   card from HAND to that character.
 *   AUTO【FIELD】:If the character this card is attached to is with 【Human】 in its feature, that
 *   character gets Power-X000. X is the original R of that character.
 *
 * The script is the TRIG (clause 0; BLOCK is a keyword and the AUTO line is registered separately,
 * so the card keeps a single-clause script). The tag is `opponent-character-attacks` from the HAND,
 * narrowed to a Human attacker (the `feature` subject filter; for this event the filter tests the
 * ATTACKER, never the defender). A HAND trigger needs no declaration (304.1.g.2). The original
 * Power 3000 or lower test is the `attacker-matches` condition with `powerMax: 3000`, which reads
 * the printed Power (301.6.a), so a buffed or reduced attacker is judged by its printed value.
 *
 * PROMPT SHAPE, K10 answer B (user decision, recorded in 17.5.2.1-CHECKPOINTS.md): the optional is
 * nested inside the conditional, so the player is asked about the "may" only after the attacker's
 * original-Power condition holds. An ineligible attacker asks nothing and discards nothing. When
 * the player accepts, the bottom 3 cards of the own deck are discarded (301.15.a.3; a shorter deck
 * discards what it has, 304.1.d), and only if that was done (301.38.a, Reading B) is this card
 * attached from the HAND to the attacker (301.25.a). Declined: nothing is discarded and the card
 * stays in the HAND.
 *
 * This card is not linked to any community-ruling discussion.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  attach,
  attackerMatches,
  attackingCharacter,
  characters,
  conditional,
  effect,
  ifDone,
  mill,
  optional,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-053');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('304.1.g.2'), reviewedHash: '107585942132' }, // HAND triggers need no declaration
    { key: asRuleKey('301.6.a'), reviewedHash: 'fe95be3f5640' }, // original means printed
    { key: asRuleKey('301.15.a.3'), reviewedHash: '9ac3aa7c9412' }, // discard from the deck
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // "if you do" needs the earlier text resolved in full
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a card stacked under a character is attached
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      attackerMatches(characters({ feature: 'Human', powerMax: 3000 })),
      optional(
        sequence(
          step(mill('self', 'bottom', 3, 'discard')),
          ifDone(attach(source(), attackingCharacter())),
        ),
      ),
    ),
    trigger('opponent-character-attacks', 'HAND', undefined, { feature: 'Human' }),
  );
}
