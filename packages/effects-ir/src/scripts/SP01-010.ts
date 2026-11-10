/**
 * SP01-010, a UNIQUE character that reveals a random card of the opponent's HAND to recover a
 * same-Lv character from the RETREAT.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   ACTI【BATTLE/ONCE PER TURN】:You reveal 1 of your opponent's cards in HAND randomly. If you do,
 *   you place 1 of your characters with the same Lv as that opponent's card from RETREAT face down
 *   into your BASE.
 *
 * Event tag: activate, BATTLE, once per turn (201.10.f.2). The opponent's HAND card is picked at
 * random: the pick is designated by the opponent and travels in the action (CR 301.29.a, "the other
 * player designates"), so a replay reveals the same card and no Math.random is involved. Only if the
 * card was shown is 1 of the player's own RETREAT characters with the same printed Lv as the shown
 * card placed face down into the BASE (301.13.a). An empty opponent HAND shows nothing; with no own
 * RETREAT character of that Lv the reveal stands and the placement is not done. Survey label
 * "11 B2" is discussion 24: HEAD-JUDGE for the principle (FAQ F-29, CR 304.1.d); the zone-full case
 * (a full BASE) is CONSENSUS and ranks below the rulebook. "If you do" follows Reading B
 * (discussion 10 item 3, ESCALATE-OPEN, user decision of 2026-11-03).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  bind,
  characters,
  effect,
  ifDone,
  relocate,
  select,
  selectRandom,
  sequence,
  show,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR, EffectTarget } from '../ir';

export const CARD_NO = asCardNo('SP01-010');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect: printed Condition (ONCE PER TURN) is an additional Condition
    { key: asRuleKey('301.28.a'), reviewedHash: '07b2366e111b' }, // show reveals the front face
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // set cards face-down
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '10', rule: asRuleKey('304.1.d') },
    { discussion: '24', rule: asRuleKey('304.1.d') },
  ],
});

/** One random card of the opponent's HAND, bound as pick A. */
const randomHandCard = (): EffectTarget =>
  bind(selectRandom('opponent', 'HAND', ANY_CARD, 1), 'A');

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(show(randomHandCard())),
      ifDone(
        relocate(select('self', 'RETREAT', characters({ lvSameAsRevealed: true }), 1), {
          side: 'self',
          area: 'BASE',
          faceDown: true,
        }),
      ),
    ),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true },
  );
}
