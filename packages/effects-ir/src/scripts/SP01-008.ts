/**
 * SP01-008, a UNIQUE character that cycles a BASE card to the RETREAT for a draw when a Human leaves.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   TRIG【FIELD/ONCE PER TURN】:When your character with 【Human】 in its feature enters RETREAT
 *   from the field, you may retreat 1 of your cards in BASE. If you do, you draw 1 card.
 *
 * Event tag: own-character-enters-retreat, FIELD, once per turn (301.1.a), subject with Human in its
 * features (a non-Human character does not fire it). The retreat of one BASE card is optional
 * (304.1.a); only if it was done is one card drawn (302.13.b). With no card in BASE the retreat is
 * not done and nothing is drawn. "If you do" follows Reading B (discussion 10 item 3,
 * ESCALATE-OPEN, user decision of 2026-11-03).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  draw,
  effect,
  ifDone,
  optional,
  retreat,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-008');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.1.a'), reviewedHash: 'f5fb571c54b2' }, // printed Condition (ONCE PER TURN)
    { key: asRuleKey('301.16.a'), reviewedHash: '72a1ab425b37' }, // retreat
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
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
    optional(sequence(step(retreat(select('self', 'BASE', ANY_CARD, 1))), ifDone(draw('self', 1)))),
    trigger('own-character-enters-retreat', 'FIELD', undefined, { feature: 'Human' }),
    { oncePerTurn: true },
  );
}
