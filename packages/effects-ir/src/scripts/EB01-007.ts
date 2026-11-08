/**
 * EB01-007, a Vision that swaps one Lv3 Avenger in the field for another from the HAND.
 *
 * Printed text (official card; "ONCR" is the card's own typo for "ONCE"):
 *
 *   ACTI【BATTLE/ONCR PER TURN】:You retreat 1 of your characters with Lv3 and 【Avengers】 in
 *   their features in the field. If you do, you may place 1 of your characters with Lv3 and
 *   【Avengers】 in their features from HAND into your BATTLE.
 *
 * An activation from the BATTLE, once per turn. The retreat is mandatory and takes any own Lv3
 * Avengers character in the field (the BATTLE or the BASE), this card included. Only if a
 * character was retreated is the placement offered, and it is a "may": one own Lv3 Avengers
 * character in the HAND goes into a BATTLE lane the player chooses. With no Lv3 Avengers in the
 * field nothing happens and the HAND card stays (301.38.a, Reading B of discussion 10 item 3 for
 * the not-done branch). The Lv filter reads the printed Lv. No community ruling touches this
 * card; the not-done branch is the rulebook's.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  optional,
  relocate,
  retreat,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('EB01-007');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat a character by effect
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('302.2.a'), reviewedHash: '34c5cf52cc7d' }, // BATTLE area
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
  ],
  rulings: [],
});

const LV3_AVENGERS = characters({ lvMin: 3, lvMax: 3, feature: 'Avengers' });

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(retreat(select('self', 'FIELD', LV3_AVENGERS))),
      ifDone(
        optional(
          relocate(select('self', 'HAND', LV3_AVENGERS), { side: 'self', area: 'BATTLE', faceDown: false }),
        ),
      ),
    ),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true },
  );
}
