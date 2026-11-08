/**
 * SD03-010, a Captain America that jumps from the HAND onto the BATTLE when a Lv6 opponent arrives.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:When your opponent's character with Lv6 enters the field, you may place this card
 *   from HAND into your BATTLE.
 *
 * Event tag: opponent-character-enters-field, HAND, subject printed Lv6 (the trigger narrows the
 * entrant to an opposing character of Lv6; a Lv5 or Lv7 entrant does not fire it). The script is the
 * effect after the trigger: an optional placement of this card from the HAND into the controller's
 * BATTLE, face-up (301.12.a); declining leaves the board unchanged (304.1.a). The lane is the
 * player's choice (`EffectInvocation.placement`).
 *
 * Open reading (UNRULED, engine reading `effective-power-lv-basis`): the entrant's Lv is its printed
 * Lv. No community ruling governs this clause.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, optional, relocate, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-010');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
    trigger('opponent-character-enters-field', 'HAND', undefined, { level: 6 }),
  );
}
