/**
 * BP01-096 「I Am The Shield」New Captain America, a Lv3 Human that swaps itself into the place of
 * another Captain America.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【FIELD/ONCE PER TURN】:If you have the characters with 【Captain America】 in their
 *   names in BATTLE except this card, you discard 1 of your cards in HAND. If you do, you swap this
 *   card in the field and that character.
 *
 * With a Captain America character in BATTLE other than this card, 1 card is discarded from the
 * HAND; only if that was done is this card swapped with that character (picked as pick A). Without
 * such a character nothing happens, and an empty HAND leaves the swap undone (304.1.d, discussions
 * 09 and 10; discussion 10 is ESCALATE-OPEN and the "If you do" reading is the engine default, tier:
 * user decision below a head-judge ruling). Another copy of this card counts as "that character"
 * (discussion 35, HEAD-JUDGE), because the exception is this card, not its name. A swap exchanges
 * the cards and their attached cards (301.18.a, 301.18.c); layer-2 results stay on the position
 * (discussion 19, HEAD-JUDGE for the swap itself; any other in-FIELD move there stays
 * ESCALATE-OPEN and is not implemented). ONCE PER TURN is the `oncePerTurn` marker on the IR.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  bind,
  characters,
  conditional,
  discard,
  effect,
  ifDone,
  select,
  sequence,
  source,
  step,
  swap,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-096');

const CAPTAIN = characters({ nameIncludes: 'Captain America', exceptSource: true });

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND
    { key: asRuleKey('301.18.a'), reviewedHash: 'ee5d5ce25680' }, // swap exchanges positions
    { key: asRuleKey('301.18.c'), reviewedHash: 'ecf7cbe1e937' }, // swapped cards exchange attached cards
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'have', side: 'self', area: 'BATTLE', filter: CAPTAIN, min: 1, max: null },
      sequence(
        step(discard(select('self', 'HAND', ANY_CARD))),
        ifDone(swap(source(), bind(select('self', 'BATTLE', CAPTAIN), 'A'))),
      ),
    ),
    trigger('activate-counter', 'FIELD'),
    { oncePerTurn: true },
  );
}
