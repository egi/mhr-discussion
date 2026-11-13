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
 * if that was done in full, this card is placed into the field and the opposing FRONT character
 * loses 1000 Power until the end of the turn. Entering VOID from RETREAT is not an existing
 * trigger event, so the script carries no trigger tag. Placing a card into the field is a
 * relocate whose spot the text does not name, so the interpreter takes the player's placement (a
 * free lane or the BASE) and, without one, answers EFFECT_UNEXECUTABLE and changes nothing.
 *
 * The discard is a cost that must be paid in full (user decision of 2026-11-13, tier: user
 * decision, FAQ F-29), overriding the "do as much as you can" default for counted discards. With
 * fewer than 2 cards in the HAND nothing is discarded, this card stays in the VOID and the
 * opposing Power is unchanged. The IR therefore checks for 2 HAND cards before the discard.
 * "If you do" follows Reading B (discussion 10 item 3, user decision of 2026-11-04, closed; CR
 * 301.38.a, [After doing so], needs all earlier text resolved in full).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  conditional,
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
// 10: item 3 "If you do" follows Reading B (user decision of 2026-11-04, closed).
export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard places card in RETREAT
    { key: asRuleKey('302.1.a'), reviewedHash: 'ea63c3694178' }, // FIELD area
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('301.8.a'), reviewedHash: '7008a08eb9de' }, // power floor of zero
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
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
      conditional(
        { kind: 'have', side: 'self', area: 'HAND', filter: ANY_CARD, min: 2, max: null },
        sequence(
          step(discard(select('self', 'HAND', ANY_CARD, 2))),
          ifDone(relocate(source(), { side: 'self', area: 'FIELD', faceDown: false })),
          ifDone(power(select('opponent', 'FRONT', characters()), -1000)),
        ),
        null,
      ),
    ),
  );
}
