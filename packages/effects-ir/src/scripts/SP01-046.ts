/**
 * SP01-046, a character that prunes a BASE character of the opponent and grows with its own set cards.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   TRIG【BATTLE】:When this card enters the field, you prune 1 of your opponent's characters with
 *   LvX or below in BASE. If you do, this card gets R+X and Power+X000 this turn. X is the number
 *   of your set cards in BASE.
 *
 * UNIQUE is owned by the engine and is not scripted. Event tag: enters-field, BATTLE (201.10.d.2).
 * The effect is mandatory (304.1.b). The Lv bound and both bonuses read the same X, the number of
 * the controller's face-down ("set", 301.13.a) cards in BASE. One opposing BASE character with Lv
 * at most X is pruned into the VOID (301.17.a); with no such character nothing is pruned and the
 * bonus does not apply (304.1.d). Only if the prune was done does this card get R+X and Power+X000
 * until the end of the turn.
 *
 * The Lv bound reads the printed Lv; `effective-power-lv-basis` is UNRULED, so the printed
 * reading is a flagged choice. Nothing is left unmodelled.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  prune,
  select,
  sequence,
  source,
  statMod,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-046');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(
        prune(
          select('opponent', 'BASE', characters({ lvBy: { mode: 'max', source: 'set-cards-in-base' } })),
        ),
      ),
      ifDone(statMod(source(), 'r', 1, 'set-cards-in-base')),
      ifDone(statMod(source(), 'power', 1000, 'set-cards-in-base')),
    ),
    trigger('enters-field', 'BATTLE'),
  );
}
