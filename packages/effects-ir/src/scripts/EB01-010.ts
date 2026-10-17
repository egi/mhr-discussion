/**
 * EB01-010, a character that sends a low-Lv opposing BATTLE character back to its BASE.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE/ONCE PER TURN】:When your character with Lv4 or above enters the field by
 *   calling, you may move 1 of your opponent's characters with Lv3 or below from BATTLE to
 *   your opponent's BASE.
 *
 * The script is the effect after the trigger: an optional move of one opposing BATTLE character
 * with Lv3 or below to the opposing BASE. "When your character with Lv4 or above enters the
 * field by calling" names another card than this one, and the once-per-turn limit is a use
 * limit, so neither is an op and the script carries no trigger tag. It has the same text and
 * the same script as BP01-016.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, optional, relocate, select } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('EB01-010');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger timing
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect BATTLE-BASE move
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE area
  ],
  rulings: [],
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
  );
}
