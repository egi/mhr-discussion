/**
 * SP01-001, a UNIQUE character that comes back from the RETREAT onto a low-Lv Human.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   TRIG【RETREAT】:When this card enters RETREAT from the field, you may discard 1 of your
 *   cards in HAND. If you do, you attach this card from RETREAT to 1 of your characters with
 *   original Lv5 or below and 【Human】 in their features on the field.
 *   TRIG【BATTLE】:When you attach this card to a charcater on BATTLE, 1 of your opponent's
 *   characters with the lowest Power on BATTLE gets Power-2000 this turn.
 *
 * The script is the first TRIG: an optional discard of one HAND card and, only if that was done,
 * this card is attached from the RETREAT to one own Human on the field whose original (printed)
 * Lv is 5 or below (the `original` facet, so a buff or debuff does not move a Human across the
 * limit). With no such Human the discard stays and the effect resolves (discussion 25). UNIQUE is
 * a rule keyword, not an effect. The second TRIG (`this-card-attached`, the opposing character
 * with the lowest Power gets Power-2000, the `extreme` facet; ties stay candidates and the
 * player chooses) is a separate effect and is not part of this script. Attaching by effect is
 * not a swap, so discussion 20 does not apply.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  attach,
  characters,
  discard,
  effect,
  ifDone,
  optional,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-001');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger timing
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
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
    optional(
      sequence(
        step(discard(select('self', 'HAND', ANY_CARD))),
        ifDone(
          attach(
            source(),
            select('self', 'FIELD', characters({ feature: 'Human', lvMax: 5, original: true })),
          ),
        ),
      ),
    ),
    trigger('enters-retreat-from-field', 'RETREAT'),
  );
}
