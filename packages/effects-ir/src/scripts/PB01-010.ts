/**
 * PB01-010, a Lv4 Human that can be placed into the opponent's BATTLE from the HAND.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:If the number of your set cards in BASE is more than your opponent's, you place
 *   this card from HAND into your opponent's BATTLE.
 *   TRIG【BATTLE】:When this card enters the field, you retreat 1 of your characters with Power
 *   4500 or lower in BATTLE.
 *
 * A script carries one trigger, so this is the ACTI【HAND】 clause only (the first printed clause).
 * When the player has strictly more set (face-down) cards in the BASE than the opponent, this
 * card is placed face up into the opponent's BATTLE, the lane being the placement choice. With
 * equal or fewer set cards nothing happens.
 *
 * Not modelled: the TRIG【BATTLE】 clause (retreat 1 own BATTLE character with Power 4500 or
 * lower; a printed-versus-effective Power basis would be UNRULED, `effective-power-lv-basis`).
 * It is played by hand, so the card badges partial. No community ruling touches this card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { conditional, effect, relocate, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('PB01-010');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('302.2.a'), reviewedHash: '34c5cf52cc7d' }, // BATTLE area
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'more-set-cards-than-opponent' },
      relocate(source(), { side: 'opponent', area: 'BATTLE', faceDown: false }),
    ),
    trigger('activate', 'HAND'),
  );
}
