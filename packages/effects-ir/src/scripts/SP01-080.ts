/**
 * SP01-080, a character that sends a low-Lv opposing BATTLE character back to its BASE on a call.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When this card enters the field by calling, you may move 1 of your opponent's
 *   characters with Lv3 or below from BATTLE to your opponent's BASE.
 *   TRIG【BASE】:When this card enters the field by calling, you may move 1 of your opponent's
 *   characters with Lv3 or below from BASE to your opponent's BATTLE.
 *
 * Scripted clause: the TRIG【BATTLE】 clause. Not modelled: the TRIG【BASE】 clause (the BASE-to-
 * BATTLE move), which stays on the manual path. Two TRIG clauses with one scripted, so the badge
 * is partial by clause count.
 *
 * Event tag: enters-field-by-call, BATTLE (201.10.d.2). The trigger fires only when this card
 * entered by calling, not when it was placed by effect (community-rulings discussion 31, by path,
 * HEAD-JUDGE via F-09). The move is optional (304.1.a). It is a same-player BATTLE-BASE move of
 * the opponent's character (301.24.b), written as `relocate` to the opponent's BASE and not as the
 * acting player's own `battle-move`: the character leaves the opponent's BATTLE and lands in the
 * opponent's BASE, nothing crosses sides. A full BASE follows community-rulings discussion 24
 * (principle HEAD-JUDGE F-29, cases CONSENSUS): the move is not done and raises no error.
 *
 * The Lv bound reads the printed Lv; `effective-power-lv-basis` is UNRULED, so the printed
 * reading is a flagged choice.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, optional, relocate, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-080');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect BATTLE-BASE move
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [{ discussion: '24', rule: asRuleKey('304.1.d') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      relocate(select('opponent', 'BATTLE', characters({ lvMax: 3 })), {
        side: 'opponent',
        area: 'BASE',
        faceDown: false,
      }),
    ),
    trigger('enters-field-by-call', 'BATTLE'),
  );
}
