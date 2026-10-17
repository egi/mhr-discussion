/**
 * EB01-012, a HAND card that prunes itself to place a retreating Human character into the field.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:When your character with Lv4 or below and 【Human】 in its feature enters RETREAT
 *   from BATTLE by losing the fight or your opponent's effect, you may prune this card in HAND.
 *   If you do, you place that character into your field.
 *
 * The script is the effect after the trigger: an optional prune of this card from the HAND,
 * then, only if that happened, the character that triggered it is placed into the field. The
 * trigger (a Lv4-or-below Human character entering RETREAT from BATTLE by losing the fight or
 * an opposing effect) is the envelope; losing the fight is not an existing trigger event, so
 * the script carries no trigger tag. Placing a card into the field is a relocate whose spot the text does not name, so the
 * interpreter takes the player's placement (a free lane or the BASE) and, without one,
 * answers EFFECT_UNEXECUTABLE and changes nothing.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, ifDone, optional, prune, relocate, sequence, source, step, subject } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('EB01-012');

// 09: RESOLVED (rulebook 304.1 plus head-judge rulings).
// 10: ESCALATE-OPEN. "If you do" after a partly done step runs the next step (Reading A,
// tier: user decision below a head-judge ruling; 301.38.a points the other way).
export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune
    { key: asRuleKey('302.1.a'), reviewedHash: 'ea63c3694178' }, // FIELD area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
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
        step(prune(source())),
        ifDone(relocate(subject(), { side: 'self', area: 'FIELD', faceDown: false })),
      ),
    ),
  );
}
