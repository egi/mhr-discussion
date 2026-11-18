/**
 * BP01-044, a Lv1 character that retreats itself when the opponent calls into the field on the
 * owner's turn, and may then bring an Iron Man forward to the FRONT.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When your opponent's character enters the field in your turn, you may retreat
 *   this card. If you do, you may swap 1 of your characters with Lv4 or below and 【Iron Man】 in
 *   their names and your character in FRONT.
 *
 * The trigger tag is `opponent-character-enters-field` from the FIELD, with the `turn: 'own'`
 * subject gate: it fires only while the owner of this card is the active player, so an opposing
 * entry in the opponent's own turn does not fire it. The whole effect is optional (304.1.a): the
 * first "may" is the retreat of this card (301.16.a.3). Only if this card was retreated ("If you
 * do" is Reading B, discussion 10 item 3, rule 301.38.a) is the second "may" offered: swap 1 own
 * character on the field with Lv4 or below and Iron Man in its name with the own character in the
 * FRONT (301.18.a); the two exchange positions and both count as moving (301.18.d). With no such
 * Iron Man, or with an empty FRONT (this card itself stood there and has just retreated), nothing
 * is swapped and the retreat stands (304.1.d). This script does not declare discussion 10.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  optional,
  retreat,
  select,
  sequence,
  source,
  step,
  swap,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-044');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat by effect
    { key: asRuleKey('301.18.a'), reviewedHash: 'ee5d5ce25680' }, // swap exchanges positions
    { key: asRuleKey('301.18.d'), reviewedHash: '75dd0629d8dd' }, // swap counts as moving
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(retreat(source())),
        ifDone(
          optional(
            swap(
              select('self', 'FIELD', characters({ lvMax: 4, nameIncludes: 'Iron Man' })),
              select('self', 'FRONT', characters()),
            ),
          ),
        ),
      ),
    ),
    trigger('opponent-character-enters-field', 'FIELD', undefined, { turn: 'own' }),
  );
}
