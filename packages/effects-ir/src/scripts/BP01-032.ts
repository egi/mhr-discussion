/**
 * BP01-032, a Black Panther that comes out of the HAND to weaken an opposing BATTLE character.
 *
 * Printed text (official card):
 *
 *   UNIQUE(AUTO【FIELD】:You can not have another character with the same name as this card in
 *   the field. This effect can not be lost.)
 *   TRIG【HAND】:When your yellow character is in Both Lose, you may place this card from HAND
 *   into your BATTLE. If you do, 1 of your opponent's characters in BATTLE gets Power-1000 in
 *   this turn.
 *
 * The script is the TRIG clause after its trigger (a yellow character in Both Lose is the
 * envelope and no existing event names it, so there is no trigger tag): an optional placement of
 * this card from the HAND into the BATTLE and, only if that happened, Power-1000 until the end of
 * the turn on one opposing BATTLE character. The lane comes from the invocation's placement
 * choice. UNIQUE is a rule keyword, not an effect.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  optional,
  power,
  relocate,
  select,
  sequence,
  source,
  step,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-032');

// 09: RESOLVED (rulebook 304.1 plus head-judge rulings).
// 10: ESCALATE-OPEN. "If you do" after a partly done step runs the next step (Reading A,
// tier: user decision below a head-judge ruling; 301.38.a points the other way).
export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('302.2.a'), reviewedHash: '34c5cf52cc7d' }, // BATTLE area
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('301.8.a'), reviewedHash: '7008a08eb9de' }, // power floor of zero
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
        step(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
        ifDone(power(select('opponent', 'BATTLE', characters()), -1000)),
      ),
    ),
  );
}
