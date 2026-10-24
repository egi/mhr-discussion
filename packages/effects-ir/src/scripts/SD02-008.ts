/**
 * SD02-008, a BASE ability that raises a BATTLE character's R and then covers itself.
 *
 * Printed text (official card):
 *
 *   ACTI【BASE/ONCE PER TURN】:1 of your characters in BATTLE gets R+1 in this turn. If you
 *   do, cover this card.
 *
 * The script raises the R of one of the controller's BATTLE characters by 1 until the end
 * of the turn and, only if that happened, covers this card. Covering turns it face-down (301.14;
 * "cover" is not a rulebook term, a reading taken from the card survey, still marked open). The
 * "once per turn" limit is a use
 * limit, not an effect, and is not part of the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  cover,
  effect,
  ifDone,
  select,
  sequence,
  source,
  statMod,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-008');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // greatest extent
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
    sequence(
      step(statMod(select('self', 'BATTLE', characters()), 'r', 1)),
      ifDone(cover(source())),
    ),
  );
}
