/**
 * SD03-001 「Supreme Watcher」Captain America, a Lv6 character that takes the Power of an
 * opposing character when it enters the field.
 *
 * Printed text (official card):
 *
 *   COUNTER(AUTO【HAND】: This card may be called in COUNTER PHASE or COUNTER STEP.)
 *   TRIG【FIELD】:When this card enters the field, this card gets Power+X in this turn. X is the
 *   Power of 1 of your opponent's characters in the field.
 *
 * The COUNTER keyword is printed text the engine already reads (no script, and the card is in
 * neither AUTO coverage list, so no AUTO entry is needed); the script is the TRIG. The opposing
 * FIELD character is chosen as pick A, bound by a zero-size Power change on it (the only way to
 * bind a pick without acting on it, so that step reports "nothing done" by design); this card then
 * gets Power+X with X read from pick A. With no opposing character the effect does nothing.
 *
 * X is the effective Power of the pick (registered engine reading `effective-power-lv-basis`,
 * UNRULED): the script rests on that reading and must not be shown as settled.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  bind,
  characters,
  effect,
  power,
  scaleFrom,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-001');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(power(bind(select('opponent', 'FIELD', characters()), 'A'), 0)),
      step(scaleFrom(source(), 'power', 1, 'A', 'power')),
    ),
    trigger('enters-field', 'FIELD'),
  );
}
