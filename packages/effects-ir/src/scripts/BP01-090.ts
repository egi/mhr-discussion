/**
 * BP01-090, a HAND activation that trades itself for skipping the Battle Phase and a Power cut.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:You prune this card in HAND. If you do, you skip your Battle Phase in this turn
 *   and 1 of your opponent's characters in BATTLE gets Power-X in this turn. X is the total value
 *   of the Power of your characters in BATTLE.
 *
 * The script prunes the card from the HAND and, only if that was done, skips the controller's
 * Battle Phase and gives one opposing BATTLE character Power-X, X being the total Power of the
 * controller's BATTLE characters. The two results are independent parts of one "If you do", so
 * they sit in one gated block as separate 'always' steps: with no opposing BATTLE character the
 * Battle Phase is still skipped (discussion 25, F-30; discussions 09 and 10, resolve as much as
 * possible). The card not in the HAND cannot be pruned and nothing else happens.
 *
 * Which Power the total reads (effective now, or printed) is UNRULED, registered as the engine
 * reading `effective-power-lv-basis` (effective); this script rests on a reading that no ruling
 * settles and must not be shown as settled. The skip is recorded only while the Battle Phase can
 * still be skipped (the controller's own turn up to the end of the Action Phase); anywhere else
 * the activation is unexecutable and nothing moves.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  prune,
  select,
  sequence,
  skipBattlePhase,
  source,
  statMod,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-090');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('303.2.a.4.1'), reviewedHash: '600dc10feced' }, // a skipped Battle Phase
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
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
      step(prune(source())),
      ifDone(
        sequence(
          step(skipBattlePhase(), 'always'),
          step(
            statMod(select('opponent', 'BATTLE', characters()), 'power', -1, 'total-power-own-battle'),
            'always',
          ),
        ),
      ),
    ),
    trigger('activate', 'HAND'),
  );
}
