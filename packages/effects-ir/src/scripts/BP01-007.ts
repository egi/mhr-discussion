/**
 * BP01-007, a character that returns from the VOID by discarding two cards.
 *
 * Printed text (official card):
 *
 *   TRIG【VOID】:When this card enters VOID from RETREAT, you may discard 2 cards in HAND.
 *   If you do, you place this card from VOID into your field, and your opponent's character
 *   in FRONT gets Power-1000 in this turn.
 *
 * The script is the effect after the trigger: an optional discard of two HAND cards, then, only
 * if that happened, this card is placed into the field and the opposing FRONT character loses
 * 1000 Power until the end of the turn. Entering VOID from RETREAT is not an existing trigger
 * event, so the script carries no trigger tag. Placing a card into the field is a relocate whose spot the text does not name, so the
 * interpreter takes the player's placement (a free lane or the BASE) and, without one,
 * answers EFFECT_UNEXECUTABLE and changes nothing.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  discard,
  effect,
  ifDone,
  optional,
  power,
  relocate,
  select,
  sequence,
  source,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-007');

// 09: RESOLVED (rulebook 304.1 plus head-judge rulings).
// 10: ESCALATE-OPEN. "If you do" after a partly done step runs the next step (Reading A,
// tier: user decision below a head-judge ruling; 301.38.a points the other way).
export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard places card in RETREAT
    { key: asRuleKey('302.1.a'), reviewedHash: 'ea63c3694178' }, // FIELD area
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('301.8.a'), reviewedHash: '7008a08eb9de' }, // power floor of zero
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
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
    optional(
      sequence(
        step(discard(select('self', 'HAND', ANY_CARD, 2))),
        ifDone(relocate(source(), { side: 'self', area: 'FIELD', faceDown: false })),
        ifDone(power(select('opponent', 'FRONT', characters()), -1000)),
      ),
    ),
  );
}
