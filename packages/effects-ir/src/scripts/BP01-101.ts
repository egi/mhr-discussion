/**
 * BP01-101, a weakness guard that retreats set cards to place a character of matching original Lv.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:ONCE PER TURN, When your weakness is attacked, you may retreat up to 3 of your
 *   set cards in BASE. If you do, you may place 1 of your characters with original LvX from HAND
 *   into your BATTLE. X is the number of the cards you retreat by this effect.
 *
 * The retreat selects UP TO 3 face-down cards, so choosing none is allowed. X is the number
 * actually retreated (`retreated-card-count`), not the pool size, and the character's ORIGINAL Lv
 * must equal it exactly. The placement is an "If you do" (Reading B, discussion 10 item 3, rule
 * 301.38.a): with nothing retreated it does not run.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  effect,
  ifDone,
  optional,
  relocate,
  retreat,
  select,
  selectUpTo,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-101');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect: ONCE PER TURN
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat by effect
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(retreat(selectUpTo('self', 'BASE', { ...ANY_CARD, faceDown: true }, 3))),
        ifDone(
          optional(
            relocate(
              select('self', 'HAND', characters({ original: true, lvBy: { mode: 'exact', source: 'retreated-card-count' } })),
              { side: 'self', area: 'BATTLE', faceDown: false },
            ),
          ),
        ),
      ),
    ),
    trigger('own-weakness-attacked', 'FIELD'),
    { oncePerTurn: true },
  );
}
