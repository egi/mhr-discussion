/**
 * BP01-078, a Falcon that gambles on the top card of the deck after losing a fight.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT by losing the fight, you may show the top card
 *   of your deck. If that card is the blue character with Lv4, you place that character into
 *   your BASE, otherwise you discard that character.
 *
 * The script is the effect after the trigger: an optional show of the top card of the controller's
 * deck (301.28.a), then, if the shown card is a blue character of Lv4, it is placed face up into the
 * BASE (301.12.a) and otherwise it is discarded into the RETREAT (301.15.a.3). An empty deck shows
 * nothing and nothing happens.
 *
 * The target is `selectTop('self', 1)`: the pool is exactly the top DECK card, so the player is
 * never asked to choose and a forged pick naming a deeper card is ignored.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  colored,
  conditional,
  discard,
  effect,
  optional,
  relocate,
  select,
  selectTop,
  sequence,
  show,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-078');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.28.a'), reviewedHash: '07b2366e111b' }, // show reveals the front face
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('301.15.a.3'), reviewedHash: '9ac3aa7c9412' }, // discard from the deck
  ],
  rulings: [],
});

const top = () => selectTop('self', 1);

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(show(top())),
        step(
          conditional(
            { kind: 'top-card-matches', filter: colored('blue', { lvMin: 4, lvMax: 4 }) },
            relocate(top(), { side: 'self', area: 'BASE', faceDown: false }),
            discard(top()),
          ),
        ),
      ),
    ),
    trigger('enters-retreat-by-losing-fight', 'RETREAT'),
  );
}
