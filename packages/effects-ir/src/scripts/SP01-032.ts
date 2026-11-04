/**
 * SP01-032, a UNIQUE character that weakens opposing characters per attached Web card and digs
 * when a Web effect sends it to the VOID.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   AUTO【FIELD】:Each character on your opponent's field gets Power-X000. X is the number of
 *   that character's attached cards with 【Web】 in their features.
 *   TRIG【VOID】:When this card enters VOID by the effect of a card with 【Web】 in its feature,
 *   you may prune the top 3 cards of your deck. If you do, you draw 1 card.
 *
 * This script is the TRIG: when the card that caused the move into the VOID has Web in its
 * features, the player may prune the top 3 cards of the deck and, only if that was done, draws 1.
 * The cause is read from the trigger event (`cause-matches`); a move into the VOID by anything
 * other than a card effect has no cause and does nothing. The AUTO clause is the AUTO registry's
 * entry (`attached-of-target`, Power -1000 per attached Web card), not this script.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  conditional,
  draw,
  effect,
  ifDone,
  mill,
  optional,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-032');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger timing
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'cause-matches', filter: { ...ANY_CARD, feature: 'Web' } },
      optional(sequence(step(mill('self', 'top', 3, 'prune')), ifDone(draw('self', 1)))),
    ),
    trigger('this-card-enters-void', 'VOID'),
  );
}
