/**
 * SP01-019, a WING character that retreats itself and another R2-or-above WING character as an
 * Activated Effect, and in return retreats a low-Lv opposing WING or BACK character.
 *
 * Printed text (official card):
 *
 *   ACTI【WING/ONCE PER TURN】:You retreat this card on WING and one other character with R2 or
 *   above on your WING. If you do, you retreat 1 of your opponent's characters with Lv5 or below
 *   on WING or BACK.
 *
 * Event tag: activate, WING, once per turn (201.10.f.2; ONCE PER TURN is an additional
 * Condition). The other character is one own WING character with R2 or above (`rMin: 2`, the
 * effective R) that is not this card. It is picked first and retreated, then this card, so that
 * with no such partner nothing is retreated at all: the first step has no candidate, the
 * activation is not executable and the effect does nothing (304.2.b). Only if both retreats were
 * done does 1 opposing character with Lv5 or below on WING or BACK retreat (`areas` is the union
 * of the two lanes); with no candidate the two retreats stay done and nothing more happens
 * (304.1.d). The Lv bound reads the printed Lv: `effective-power-lv-basis` is UNRULED. "If you
 * do" is Reading B (user decision 2026-11-03, discussion 10 item 3).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, ifDone, retreat, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-019');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect, ONCE PER TURN
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat a character by effect
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  const partner = select('self', 'WING', characters({ rMin: 2, exceptSource: true }));
  const opposing = {
    ...select('opponent', 'WING', characters({ lvMax: 5 })),
    areas: ['BACK'],
  } as ReturnType<typeof select>;
  return effect(
    CARD_NO,
    sequence(step(retreat(partner)), ifDone(retreat(source())), ifDone(retreat(opposing))),
    trigger('activate', 'WING'),
    { oncePerTurn: true },
  );
}
