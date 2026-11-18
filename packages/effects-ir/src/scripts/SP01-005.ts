/**
 * SP01-005, a counter that retreats every Buster card on the field when the player has a Weakness
 * and then places itself from the HAND onto the BATTLE.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   COUNTER·ACTI【HAND】:If you have any Weaknesses, you retreat all your cards with 【Buster】 in
 *   their names on the field. If you do, you place this card from HAND onto your BATTLE.
 *   AUTO【BATTLE】:This card gets Power+X000. X is the number of your characters with 【Buster】
 *   in their names in RETREAT.
 *
 * A script carries one effect, so this one is the COUNTER·ACTI. The UNIQUE and AUTO clauses are
 * modelled in the engine's AUTO registry, not here.
 *
 * Event tag: activate-counter, HAND (201.10.f.3). The condition is a Weakness, an empty BATTLE
 * area (301.20.a); without one nothing happens. Every own card on the field whose name contains
 * Buster is retreated (301.16.a.3 for a character, 301.16.a.4 for an attached card), attached cards
 * included. Only if at least one card was retreated is this card placed face up from the HAND onto
 * the BATTLE (301.12.a). With no Buster card on the field the retreat is not done and the card
 * stays in the HAND. "If you do" is Reading B (user decision 2026-11-03, discussion 10 item 3;
 * discussion 24 for resolving what can be resolved, 304.1.d): the second step needs the first to
 * have retreated at least one card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  conditional,
  effect,
  ifDone,
  relocate,
  retreat,
  selectAll,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-005');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('301.20.a'), reviewedHash: '2254445a2da9' }, // an empty BATTLE area is a Weakness
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // a Character is retreated by an effect
    { key: asRuleKey('301.16.a.4'), reviewedHash: '47953ce28d45' }, // an Attached Card retreated by effect
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '10', rule: asRuleKey('304.1.d') },
    { discussion: '24', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'have-weakness' },
      sequence(
        step(
          retreat({
            ...selectAll('self', 'FIELD', { ...ANY_CARD, nameIncludes: 'Buster' }),
            includeAttached: true,
          }),
        ),
        ifDone(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
      ),
    ),
    trigger('activate-counter', 'HAND'),
  );
}
