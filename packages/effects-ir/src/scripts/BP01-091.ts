/**
 * BP01-091, a Hawkeye that knocks two set cards out of the opponent's BASE when the opponent sets
 * one, while the field is all green.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When your opponent's set card in BASE increases, if you have only
 *   green characters in the field, you may discard 1 of your cards in HAND. If you do, you retreat
 *   2 of your opponent's set cards in BASE.
 *
 * The trigger tag is `opponent-set-card-in-base-increases` from the FIELD: it fires for the seat
 * whose opponent added a set (face-down) card to its BASE, not for an own set card or a face-up
 * card. ONCE PER TURN is the `oncePerTurn` marker. "Only green characters in the field" has no
 * single condition in the IR, so it is written as "no character of any other colour": one nested
 * condition per other colour (red, yellow, blue, orange, purple), each requiring none in the FIELD
 * (BATTLE and BASE). A face-down card is not a character (301.21.a) and does not count. When the
 * condition fails nothing happens. The discard is optional (304.1.a). Only if a card was discarded
 * are up to 2 of the opponent's set cards retreated (301.16.a.6); with only one, that one goes
 * (304.1.d). "If you do" is Reading B (discussion 10 item 3, rule 301.38.a); this script does not
 * declare discussion 10.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  colored,
  conditional,
  discard,
  effect,
  ifDone,
  optional,
  retreat,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { CardColor } from '@mhr/core';
import type { EffectIR, EffectOp } from '../ir';

export const CARD_NO = asCardNo('BP01-091');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // a set card is a face-down card in the BASE
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND by effect
    { key: asRuleKey('301.16.a.6'), reviewedHash: 'd77bb1167305' }, // retreat face-down card
    { key: asRuleKey('301.21.a'), reviewedHash: '73c1095ad66d' }, // a face-down card is not a character
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
  ],
  rulings: [],
});

const OTHER_COLORS: readonly CardColor[] = ['red', 'yellow', 'blue', 'orange', 'purple'];

/** Runs `then` only when the own FIELD holds no character of any colour but green. */
function onlyGreen(then: EffectOp): EffectOp {
  return OTHER_COLORS.reduceRight<EffectOp>(
    (inner, color) =>
      conditional({ kind: 'have', side: 'self', area: 'FIELD', filter: colored(color), min: 0, max: 0 }, inner),
    then,
  );
}

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      onlyGreen(
        sequence(
          step(discard(select('self', 'HAND', ANY_CARD))),
          ifDone(retreat(select('opponent', 'BASE', { ...ANY_CARD, faceDown: true }, 2))),
        ),
      ),
    ),
    trigger('opponent-set-card-in-base-increases', 'FIELD'),
    { oncePerTurn: true },
  );
}
