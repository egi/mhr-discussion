/**
 * SP01-039, an Ultron that, on returning to the field from the RETREAT, brings another Ultron back
 * and sets the whole HAND face-down into the BASE.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When this card enters the field from RETREAT, if you have 3 or fewer cards in
 *   BASE, you place 1 of your characters with 【Ultron】 in their names from RETREAT onto your
 *   BATTLE. If you do, you place all your cards from HAND face down into your BASE.
 *
 * Event tag: enters-field-from-retreat, BATTLE. The script is the effect after the trigger: only
 * when the controller has 3 or fewer cards in the BASE, one own character with Ultron in its name is
 * placed from the RETREAT onto the BATTLE (301.12.a; the lane is the player's choice); only if that
 * was done, every card in the HAND is placed face-down into the BASE (301.13.a), as far as the BASE
 * has room (304.1.d, discussion 24: a partial resolution is the engine behaviour). With no Ultron
 * character in the RETREAT nothing is placed and the HAND stays. The text says "place", not "may",
 * so the effect is mandatory (304.1.b). The "If you do" reading is the engine default Reading B
 * (discussion 10, ESCALATE-OPEN on the board; user decision of 2026-11-03).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  characters,
  conditional,
  effect,
  ifDone,
  relocate,
  select,
  selectAll,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-039');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET puts a card face-down
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
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
    conditional(
      { kind: 'have', side: 'self', area: 'BASE', filter: ANY_CARD, min: 0, max: 3 },
      sequence(
        step(
          relocate(select('self', 'RETREAT', characters({ nameIncludes: 'Ultron' }), 1), {
            side: 'self',
            area: 'BATTLE',
            faceDown: false,
          }),
        ),
        ifDone(relocate(selectAll('self', 'HAND', ANY_CARD), { side: 'self', area: 'BASE', faceDown: true })),
      ),
    ),
    trigger('enters-field-from-retreat', 'BATTLE'),
  );
}
