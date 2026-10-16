/**
 * BP01-012, a character that stocks the BASE when it is called.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When this card enters the field by calling, if you have red characters in
 *   BASE, you may place the top 2 cards of your deck face down into your BASE.
 *
 * The script is the effect after the trigger: if the BASE holds a red character, the player
 * may place the top two DECK cards face down into the BASE.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  colored,
  conditional,
  effect,
  optional,
  relocate,
  select,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-012');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger timing
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET puts card face-down
    { key: asRuleKey('301.21.a'), reviewedHash: '73c1095ad66d' }, // becomes a Face-Down Card
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'have', side: 'self', area: 'BASE', filter: colored('red'), min: 1, max: null },
      optional(
        relocate(select('self', 'DECK', ANY_CARD, 2), {
          side: 'self',
          area: 'BASE',
          faceDown: true,
        }),
      ),
    ),
  );
}
