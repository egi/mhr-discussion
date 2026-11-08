/**
 * BP01-107, a green character that may set itself into the BASE when another effect discards it.
 * Only the TRIG half is scripted.
 *
 * Printed text (official card):
 *
 *   AUTO【BATTLE】:If you have the green characters with Power 4000 or higher in BATTLE, all your
 *   opponent's characters with Lv4 or below in BATTLE get Power-500.
 *   TRIG【RETREAT】:When this card enters RETREAT by discarding of effect, you may place this card
 *   from RETREAT face down into your BASE.
 *
 * The script is the TRIG. It starts when another effect discards the card into the RETREAT
 * ('enters-retreat-by-discard-effect'); a CALL, a lost fight, a card leaving the field and the
 * End Phase hand-limit discard (a rule action) do not start it. The placement is optional
 * (304.1.a) and the card becomes a Face-Down Card in the BASE (301.13.a); a full BASE (6 cards,
 * 302.6.a) leaves it in the RETREAT.
 *
 * Not modelled: the AUTO half (the Power-500 for the opponent's Lv4-or-below BATTLE characters).
 * It needs an entry in the AUTO registry, which is engine code outside the script-only scope of
 * this change (decision D-AUTO, auto-backlog), so the card stays partial and uncovered; the
 * engine does not apply the Power change and the manual path stays open for it.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, optional, relocate, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-107');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET puts a card face-down
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE area and its limit
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(relocate(source(), { side: 'self', area: 'BASE', faceDown: true })),
    trigger('enters-retreat-by-discard-effect', 'RETREAT'),
  );
}
