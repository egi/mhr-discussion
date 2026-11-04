/**
 * BP01-093 「Thunder Ally」Mighty Thor, a Lv4 character that borrows the Power of a resting WING
 * ally when it attacks.
 *
 * Printed text (official card):
 *
 *   TRIG【WING】:When this card attacks, if 1 of your characters with Power 4000 or lower in WING
 *   did not attack in this turn except this card, this card gets Power+X in this turn. X is the
 *   Power of that character. If you do, that chatacter can not attack in this turn.
 *
 * The WING character is chosen as pick A (Power 4000 or lower, has not attacked this turn, not
 * this card). The pick is bound by a zero-size Power change on it, the only way to bind a pick
 * without acting on it, so the first step reports "nothing done" by design; the second step is
 * `always` for that reason. This card then gets Power+X with X read from pick A, and only if that
 * was done the picked character cannot attack for the rest of the turn (`restrict` kind
 * `attack`). With no qualifying character the effect has nothing to bind and does nothing.
 *
 * "Power 4000 or lower" is compared on the printed Power by the pick filter today, and X is read
 * as the effective Power (registered engine reading `effective-power-lv-basis`, UNRULED); this
 * script rests on that reading and must not be shown as settled.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  bind,
  characters,
  effect,
  ifDone,
  named,
  power,
  restrict,
  scaleFrom,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-093');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
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
    sequence(
      step(
        power(
          bind(
            select('self', 'WING', characters({ powerMax: 4000, notAttackedThisTurn: true, exceptSource: true })),
            'A',
          ),
          0,
        ),
      ),
      step(scaleFrom(source(), 'power', 1, 'A', 'power')),
      ifDone(restrict(named('A'), 'attack')),
    ),
    trigger('attacks', 'WING'),
  );
}
