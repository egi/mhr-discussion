/**
 * BP01-026, a character that trades its place in the RETREAT for a face-down BASE card.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】: When this card enters RETREAT from the field by calling, you may place the
 *   top card of your deck face down into your BASE. If you do, you move this card from RETREAT
 *   back to the bottom of your deck.
 *
 * The script is the effect after the trigger: an optional placement of the top DECK card face
 * down into the BASE, then, only if that happened, this card moves from the RETREAT to the
 * bottom of the DECK. "When this card enters RETREAT from the field by calling" is the envelope
 * and no existing trigger event names it, so the script carries no trigger tag.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  effect,
  ifDone,
  optional,
  relocate,
  select,
  sequence,
  source,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-026');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger timing
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET puts card face-down
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE area
    { key: asRuleKey('302.11.a'), reviewedHash: 'a78d08c5ecfc' }, // Deck area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [
    // 09: RESOLVED (rulebook 304.1 plus head-judge rulings).
    { discussion: '09', rule: asRuleKey('304.1.d') },
    // 10: ESCALATE-OPEN. "If you do" after a partly done step runs the next step (Reading A,
    // tier: user decision below a head-judge ruling; 301.38.a points the other way).
    { discussion: '10', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(
          relocate(select('self', 'DECK', ANY_CARD, 1), {
            side: 'self',
            area: 'BASE',
            faceDown: true,
          }),
        ),
        ifDone(
          relocate(source(), {
            side: 'self',
            area: 'DECK-BOTTOM',
            faceDown: false,
          }),
        ),
      ),
    ),
  );
}
