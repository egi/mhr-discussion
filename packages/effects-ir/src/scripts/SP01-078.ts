/**
 * SP01-078, a Lv3 Human that sets an own Web character from the RETREAT face-down into the BASE and
 * then covers itself.
 *
 * Printed text (official card):
 *
 *   ACTI【BASE/ONCE PER TURN】:You place 1 of your characters with 【Web】 in their features from
 *   RETREAT face down into your BASE. If you do, you cover this card.
 *
 * Event tag: activate, BASE, once per turn (201.10.f.2, ONCE PER TURN is the printed Condition of
 * the activated effect). One own Web character in the RETREAT is placed face-down into the BASE
 * (301.21.a, placement by effect). Only if that was done is this card covered. "Cover" is read as
 * turning a BASE card face-down (301.14.a.1; glossary and discussion 07 tier); the interpreter
 * carries an unflagged OPEN marker on this reading (OPEN-RULING survey assumption in
 * interpreter.ts), carried as an open item. With no Web character in the RETREAT, or a full BASE,
 * nothing is placed and the card is not covered (discussion 25, HEAD-JUDGE, provisional: an
 * activation whose first part cannot be done does nothing).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, cover, effect, ifDone, relocate, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-078');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect, ONCE PER TURN
    { key: asRuleKey('301.21.a'), reviewedHash: '73c1095ad66d' }, // placing a card by effect
    { key: asRuleKey('301.14.a'), reviewedHash: 'cc8979d0cba4' }, // cover
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [{ discussion: '25', rule: asRuleKey('201.10.f.2') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(
        relocate(select('self', 'RETREAT', characters({ feature: 'Web' })), {
          side: 'self',
          area: 'BASE',
          faceDown: true,
        }),
      ),
      ifDone(cover(source())),
    ),
    trigger('activate', 'BASE'),
    { oncePerTurn: true },
  );
}
