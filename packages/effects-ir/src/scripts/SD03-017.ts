/**
 * SD03-017, a card that discards an Avengers character from the HAND to shrink an opposing
 * BATTLE character.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【BATTLE/ONCE PER TURN】: You discard 1 of your characters with 【Avengers】 in
 *   their features in HAND. If you do, 1 of your opponent's characters in BATTLE gets Power-1000 in
 *   this turn.
 *
 * Event tag: activate-counter, BATTLE, once per turn. One own HAND character with Avengers in its
 * features is discarded (a hand without one makes the discard not done); only if it was done does
 * one opposing BATTLE character get Power-1000 until the end of the turn (304.1.d, discussions 09
 * and 10; discussion 10 is ESCALATE-OPEN and the "If you do" reading is the engine default, tier:
 * user decision below a head-judge ruling). The text does not say "other", and this card is itself an
 * Avengers character, so it may discard itself. Nothing is left unmodelled.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  discard,
  effect,
  ifDone,
  power,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-017');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard places card in RETREAT
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
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
      step(discard(select('self', 'HAND', characters({ feature: 'Avengers' })))),
      ifDone(power(select('opponent', 'BATTLE', characters()), -1000)),
    ),
    trigger('activate-counter', 'BATTLE'),
    { oncePerTurn: true },
  );
}
