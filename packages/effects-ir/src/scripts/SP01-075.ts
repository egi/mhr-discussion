/**
 * SP01-075, a BACK character that prunes a Human from the HAND to place a same-name copy from the
 * HAND or the RETREAT onto the field.
 *
 * Printed text (official card):
 *
 *   ACTI【BACK/ONCE PER TURN】:You prune 1 of your characters with 【Human】 in their features in
 *   HAND. If you do, you may place 1 of your characters with the same name as that character from
 *   HAND or RETREAT onto your field.
 *
 * Event tag: activate, BACK, once per turn (201.10.f.2; ONCE PER TURN is an additional
 * Condition). The first step prunes 1 own Human character in the HAND (301.17.a) and binds it as
 * pick A; the prune is part of the effect, not a cost that may be skipped. Only if it was done may
 * the player place 1 own character with the same name as pick A from the HAND or the RETREAT
 * (`areas` is the union of the two) onto the field (301.12.a); the pruned card is in the VOID by
 * then and is never a candidate. The destination is the FIELD, the player's choice of lane, not a
 * WING. The second part is optional (304.1.a): declining leaves the prune done. With no same-name
 * card the prune stays and nothing is placed (304.1.d). "If you do" is Reading B (user decision
 * 2026-11-03, discussion 10 item 3).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  bind,
  characters,
  effect,
  ifDone,
  optional,
  prune,
  relocate,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-075');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect, ONCE PER TURN
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up into the field
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional ("may")
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  const pruned = bind(select('self', 'HAND', characters({ feature: 'Human' })), 'A');
  const sameName = {
    ...select('self', 'HAND', characters({ sameNameAsSelected: true })),
    areas: ['RETREAT'],
  } as ReturnType<typeof select>;
  return effect(
    CARD_NO,
    sequence(
      step(prune(pruned)),
      ifDone(optional(relocate(sameName, { side: 'self', area: 'FIELD', faceDown: false }))),
    ),
    trigger('activate', 'BACK'),
    { oncePerTurn: true },
  );
}
