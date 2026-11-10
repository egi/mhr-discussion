/**
 * SP01-069, a Lv2 Human whose counter activation boosts an own Web character and then covers
 * itself.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【BASE/ONCE PER TURN】:1 of your characters with 【Web】 in their features on the
 *   field gets R+1 and Power+500 this turn. If you do, you cover this card.
 *
 * Event tag: activate-counter, BASE, once per turn (COUNTER-Activated Effect 201.10.f.3, usable in
 * the own Action Phase, either Counter Phase and the Counter Step; ONCE PER TURN is part of the
 * printed Condition there). One own Web character on the field is picked and gets R+1 and
 * Power+500 until the end of the turn (the same pick for both). Only if that was done is this card
 * covered. "Cover" is read as turning a BASE card face-down (301.14.a.1; glossary and discussion
 * 07 tier). The interpreter carries an unflagged OPEN marker on this reading (OPEN-RULING survey
 * assumption in interpreter.ts), carried as an open item. With no own Web character nothing is
 * done and the card is not covered.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  bind,
  characters,
  cover,
  effect,
  ifDone,
  named,
  select,
  sequence,
  source,
  statMod,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-069');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('301.14.a'), reviewedHash: 'cc8979d0cba4' }, // cover
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(statMod(bind(select('self', 'FIELD', characters({ feature: 'Web' })), 'A'), 'r', 1)),
      ifDone(statMod(named('A'), 'power', 500)),
      ifDone(cover(source())),
    ),
    trigger('activate-counter', 'BASE'),
    { oncePerTurn: true },
  );
}
