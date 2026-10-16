/**
 * SD03-009, a blue Lv3 character that swaps places with a character that won a fight.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When your character wins the fight, you may swap this card in
 *   the field and that character.
 *
 * The script swaps this card with the character the trigger pinned down (the one that won the
 * fight). The interpreter does not run swap yet, so the script answers EFFECT_UNSUPPORTED and
 * the card is played by hand. The once-per-turn limit is a use limit, not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  effect,
  optional,
  source,
  subject,
  swap,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-009');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.18.d'), reviewedHash: '75dd0629d8dd' }, // field swap counts as moving
    { key: asRuleKey('301.18.h'), reviewedHash: 'bce92f4d4890' }, // movement prevention blocks swap
    { key: asRuleKey('303.2.a.4.3.2.2'), reviewedHash: '16c82563f537' }, // invalid target returns to selection
  ],
  rulings: [
    { discussion: '04', rule: asRuleKey('301.18.h') },
    { discussion: '05', rule: asRuleKey('303.2.a.4.3.2.2') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(swap(source(), subject())),
  );
}
