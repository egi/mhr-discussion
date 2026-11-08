/**
 * SD02-006, a Lv4 yellow Human that gathers two small Machines from the RETREAT onto itself when
 * it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When this card enters the field by calling, you may attach 2 of your
 *   characters with Lv1 and 【Machine】 in their features from RETREAT to this card.
 *   ACTI【BATTLE/ONCE PER TURN】：You remove 1 attaching card with Lv1 from this card to your
 *   BASE.
 *
 * Event tag: enters-field-by-call, BATTLE. EffectIR carries one trigger per script, so only the
 * first printed clause (the TRIG) is scripted: optionally attach 2 of the player's Lv1 Machine
 * RETREAT characters to this card. An attach moves one card, so the script is two attach steps in
 * a row, the second only if the first was done. With a single legal character the engine attaches
 * that one (resolve to the greatest extent possible, 304.1.d); with none nothing happens;
 * declining leaves the state unchanged. The ACTI【BATTLE/ONCE PER TURN】 clause (remove 1 attaching
 * Lv1 card to the BASE) is not modelled and stays on the manual path, so the card is badged
 * partial. The Lv filter reads the printed Lv (effective-power-lv-basis is UNRULED). No ruling is
 * specific to this card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attach, characters, effect, ifDone, optional, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-006');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
  ],
  rulings: [],
});

/** The characters the card gathers: Lv1 with Machine in the features. */
const machine = characters({ lvMin: 1, lvMax: 1, feature: 'Machine' });

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(attach(select('self', 'RETREAT', machine), source())),
        ifDone(attach(select('self', 'RETREAT', machine), source())),
      ),
    ),
    trigger('enters-field-by-call', 'BATTLE'),
  );
}
