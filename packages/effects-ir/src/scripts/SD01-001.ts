/**
 * SD01-001, a character that, when it is attached, can retreat everything attached to it to
 * prune an opposing character of up to the Lv it retreated.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE/ONCE PER TURN】: When this card is attached, if your opponent has characters with
 *   Lv5 or above in BATTLE, you may retreat all the cards attaching to this card. If you do, you
 *   prune 1 of your opponent's characters with LvX or below in the field. X is the total value of
 *   Lv of the cards you retreat by this effect.
 *
 * Event tag: this-card-attached, BATTLE, once per turn. The trigger fires after the attach
 * (community-rulings discussion 45, USER-DECISION of the project owner 2026-11-05, not a
 * head-judge ruling; the file is not on the vendor board, so it is cited here only). The effect
 * runs only while the opponent has a character of printed Lv5 or above in BATTLE; the retreat of
 * every card attached to this card is optional (304.1.a); only if it was done is one opposing
 * character in the field with printed Lv at or below the total printed Lv of the retreated cards
 * pruned (the `retreated-lv-total` bound of the filter, not a stat). With nothing attached X is 0
 * and nothing is retreated, so nothing is pruned.
 *
 * Printed Lv is read for the Lv5 test and the Lv bound; `effective-power-lv-basis` is UNRULED, so
 * the printed reading is a flagged choice. Nothing is left unmodelled.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  conditional,
  effect,
  ifDone,
  optional,
  prune,
  retreatAttachedOfHost,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-001');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('301.16.a.4'), reviewedHash: '47953ce28d45' }, // an Attached Card retreated by effect
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
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
    conditional(
      { kind: 'have', side: 'opponent', area: 'BATTLE', filter: characters({ lvMin: 5 }), min: 1, max: null },
      optional(
        sequence(
          step(retreatAttachedOfHost(source(), 'all', false)),
          ifDone(
            prune(
              select(
                'opponent',
                'FIELD',
                characters({ lvBy: { mode: 'max', source: 'retreated-lv-total' } }),
              ),
            ),
          ),
        ),
      ),
    ),
    trigger('this-card-attached', 'BATTLE'),
    { oncePerTurn: true },
  );
}
