/**
 * SP01-020, a card in the BASE that covers an opposing Human BASE character of no higher Lv than
 * itself and then covers itself.
 *
 * Printed text (official card):
 *
 *   ACTI【BASE/ONCE PER TURN】:You cover 1 of your opponent's characters with LvX or below and
 *   【Human】 in their features in BASE. X is the Lv value of this card. If you do, you cover this
 *   card.
 *
 * Event tag: activate, BASE, once per turn. X is the Lv bound of the target filter (`lvBy` max
 * `source-lv`), not a cover magnitude. The target is one opposing BASE character with Human in its
 * features and printed Lv at or below this card's printed Lv (`effective-power-lv-basis` is
 * UNRULED, so the printed reading is a flagged choice). Only if that cover was done is this card
 * covered too (304.1.d, discussions 09 and 10; discussion 10 is ESCALATE-OPEN and the "If you do"
 * reading is the engine default, tier: user decision below a head-judge ruling). With no legal
 * target neither cover happens. "Cover" is read as turning the BASE card face-down (the engine's
 * registered survey reading; "cover" is not a rulebook term).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  cover,
  effect,
  ifDone,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-020');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.1.a'), reviewedHash: 'f5fb571c54b2' }, // printed Condition (ONCE PER TURN)
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
    sequence(
      step(
        cover(
          select(
            'opponent',
            'BASE',
            characters({ feature: 'Human', lvBy: { mode: 'max', source: 'source-lv' } }),
          ),
        ),
      ),
      ifDone(cover(source())),
    ),
    trigger('activate', 'BASE'),
    { oncePerTurn: true },
  );
}
