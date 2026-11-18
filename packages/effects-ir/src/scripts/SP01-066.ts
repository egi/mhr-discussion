/**
 * SP01-066, an activated effect that trades a HAND card for a Multiverse character from the VOID.
 *
 * Printed text (official card):
 *
 *   UNIQUE keyword (registered, not an IR clause).
 *   ACTI【BATTLE】:ONCE PER TURN, You discard 1 of your cards in HAND. If you do, you place 1 of
 *   your characters with Multiverse in their features from VOID onto your BATTLE. If that
 *   character is with Lv4 or above, you discard 1 of your cards in HAND extra.
 *
 * Three clauses: discard 1 from the HAND; if done, a named pick of 1 own Multiverse character in
 * the VOID is placed onto the BATTLE; if that placement was done, and the placed character is
 * Lv4 or above (`named-pick-lv`, effective Lv read where the card now stands, undeterminable
 * means not met), discard 1 more card from the HAND.
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
  namedPickLv,
  relocate,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-066');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect, ONCE PER TURN
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(discard(select('self', 'HAND', ANY_CARD))),
      ifDone(
        relocate(bind(select('self', 'VOID', characters({ feature: 'Multiverse' })), 'A'), {
          side: 'self',
          area: 'BATTLE',
          faceDown: false,
        }),
      ),
      ifDone(conditional(namedPickLv('A', 4), discard(select('self', 'HAND', ANY_CARD)))),
    ),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true },
  );
}
