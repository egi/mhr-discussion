/**
 * BP01-019, a character that trades a DECK card for Power when it attacks.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE/ONCE PER TURN】:When this card attacks, you may discard the top card of
 *   your deck. If you do, this card gets Power+2000 in this turn.
 *
 * The script lets the player discard the top DECK card and, only if that happened, raises
 * this card's Power by 2000 until the end of the turn. The once-per-turn limit belongs to
 * the envelope.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  effect,
  ifDone,
  mill,
  optional,
  power,
  sequence,
  source,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-019');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger timing
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard top DECK card
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
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
    optional(sequence(step(mill('self', 'top', 1, 'discard')), ifDone(power(source(), 2000)))),
  );
}
