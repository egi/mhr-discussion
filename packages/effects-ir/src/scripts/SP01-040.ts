/**
 * SP01-040, a Lv6 character in the HAND that is placed onto the BATTLE by pruning a Hulk, and weakens
 * an opposing character of the pruned character's Lv.
 *
 * Printed text (official card):
 *
 *   AUTO【FIELD】:The Lv of this card changes to the R of this card.
 *   ACTI【HAND】:You prune 1 of your characters with 【Hulk】 in their names on BATTLE. If you do,
 *   you place this card from HAND onto your BATTLE and 1 of your opponent's characters with LvX on
 *   BATTLE gets Power-X000 this turn. X is the Lv value of the character pruned by this effect.
 *
 * Event tag: activate, HAND. This script is the ACTI clause. The AUTO【FIELD】 clause is already
 * modelled in the AUTO registry (autos/index.ts) and is not part of the script, so the card runs
 * in full. The own Hulk character on BATTLE is pruned first (the cost). Only if that was done do the
 * two results run, as independent parts of one "If you do" (Reading B, discussion 10 item 3;
 * 304.1.d): this card is placed from the HAND onto the BATTLE, and one opposing BATTLE character
 * whose Lv equals the pruned character's Lv gets Power-X000, where X is that Lv (the engine's
 * 'pruned-lv-total' scale, the Lv the card had when pruned). The Lv filter and the amount both use
 * the printed Lv (effective-power-lv-basis is UNRULED). With no opposing character of Lv X the
 * cost is still paid and nothing else happens (discussion 25, applied by principle: F-30, an
 * effect is usable when its first part can be done; tier HEAD-JUDGE, provisional, reverse if an
 * official ruling differs). A Hulk in the BASE is not a legal prune. Discussion 25 names SP01-006,
 * SP01-043 and SD01-006, so this card is an application of the principle, not a named case.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  prune,
  relocate,
  select,
  sequence,
  source,
  statMod,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-040');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('302.2.a'), reviewedHash: '34c5cf52cc7d' }, // BATTLE area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '10', rule: asRuleKey('304.1.d') },
    { discussion: '25', rule: asRuleKey('201.10.f.2') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(prune(select('self', 'BATTLE', characters({ nameIncludes: 'Hulk' })))),
      ifDone(
        sequence(
          step(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
          step(
            statMod(
              select(
                'opponent',
                'BATTLE',
                characters({ lvBy: { mode: 'exact', source: 'pruned-lv-total' } }),
              ),
              'power',
              -1000,
              'pruned-lv-total',
            ),
          ),
        ),
      ),
    ),
    trigger('activate', 'HAND'),
  );
}
