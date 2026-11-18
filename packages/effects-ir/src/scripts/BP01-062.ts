/**
 * BP01-062, a character that steps between the BATTLE and the BASE as a counter and then boosts an
 * own BATTLE character.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【FIELD/ONCE PER TURN】:This card takes BATTLE-BASE Move once. If you do, 1 of
 *   your characters in BATTLE gets Power+1000 in this turn.
 *   AUTO【BASE】:This card cannot be affected by the effect of the characters with Lv4 or below.
 *
 * A script carries one effect, so this one is the COUNTER·ACTI. The AUTO clause is modelled in the
 * engine's AUTO registry, not here.
 *
 * Event tag: activate-counter, FIELD, once per turn (201.10.f.3; ONCE PER TURN is an additional
 * Condition). This card takes one BATTLE-BASE Move (301.24.a, an effect move). Only if the move
 * was done does 1 own character in BATTLE get Power+1000 this turn (301.40.a); the pick may be this
 * card itself when the move was BASE to BATTLE. If the move cannot be done nothing is boosted.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  battleMove,
  characters,
  effect,
  ifDone,
  power,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-062');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(battleMove(source())),
      ifDone(power(select('self', 'BATTLE', characters()), 1000)),
    ),
    trigger('activate-counter', 'FIELD'),
    { oncePerTurn: true },
  );
}
