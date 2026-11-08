/**
 * SP01-012, a Lv4 Multiverse character that retreats a Human of the BATTLE and may prune a small
 * opposing character.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   ACTI【BATTLE/ONCE PER TURN】:You retreat 1 of your characters with 【Human】 in their features
 *   on BATTLE. If you do and the number of your characters on BATTLE is less than your
 *   opponent's, you prune 1 of your opponent's characters with Lv3 or below on BATTLE.
 *
 * An activation from the BATTLE. The retreat of one own BATTLE character with Human in its
 * features is unconditional. Only if it was done, and then only if the player has fewer BATTLE
 * characters than the opponent (counted after the retreat, in printed order), one opposing BATTLE
 * character of Lv3 or below is pruned. With no Human character on the BATTLE nothing happens.
 * ONCE PER TURN is the `oncePerTurn` marker. UNIQUE is a restriction, not an effect to script.
 * The Lv filter reads the card's Lv; printed versus effective is UNRULED
 * (`effective-power-lv-basis`). The "If you do" reading is Reading B (discussion 10 item 3,
 * ESCALATE-OPEN, tier: user decision below a head-judge ruling).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, ifDone, prune, retreat, select, sequence, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-012');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.16.a'), reviewedHash: '72a1ab425b37' }, // retreat
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places card in VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(retreat(select('self', 'BATTLE', characters({ feature: 'Human' })))),
      ifDone(
        conditional(
          { kind: 'fewer-than-opponent', area: 'BATTLE', filter: characters() },
          prune(select('opponent', 'BATTLE', characters({ lvMax: 3 }))),
        ),
      ),
    ),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true },
  );
}
