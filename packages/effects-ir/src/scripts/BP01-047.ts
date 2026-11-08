/**
 * BP01-047 「Central Control System」Iron Man, a Lv1 Human that pulls a Hulk Buster out of its
 * attachments and powers it up.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【FIELD/ONCE PER TURN】:You remove 1 of your attaching cards with 【Hulk Buster】 in
 *   their names from the field to your BATTLE. If you do, that attaching card gets Power+1000 in
 *   this turn.
 *
 * The attaching card is chosen as pick A and relocated to the player's BATTLE (the lane is the
 * player's choice); only if it was moved does it get Power+1000 this turn. No Hulk Buster attaching
 * card, or no free BATTLE lane, leaves the board and Power unchanged and nothing throws (304.1.d,
 * discussions 09 and 10; discussion 10 is ESCALATE-OPEN and the "If you do" reading is the engine
 * default, tier: user decision below a head-judge ruling). ONCE PER TURN is the `oncePerTurn`
 * marker on the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  bind,
  effect,
  ifDone,
  named,
  power,
  relocate,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-047');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a stacked character is an attached card
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(
        relocate(bind(select('self', 'ATTACHED', { ...ANY_CARD, nameIncludes: 'Hulk Buster' }), 'A'), {
          side: 'self',
          area: 'BATTLE',
          faceDown: false,
        }),
      ),
      ifDone(power(named('A'), 1000)),
    ),
    trigger('activate-counter', 'FIELD'),
    { oncePerTurn: true },
  );
}
