/**
 * BP01-048 「Agent's Premonition」Black Widow, a Lv2 character that reorders the top of the deck.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/ONCE PER TURN】:You show the top 3 cards of your deck, place up to 3 cards back
 *   to the top of your deck in any order and place the rest back to the bottom of your deck in
 *   any order.
 *
 * The script is one `rearrange-deck-top` of the controller's top 3 cards, an activation from the
 * BATTLE that the `oncePerTurn` marker limits to once a turn (ONCE PER TURN is that marker and
 * cites no rule). The op itself shows the cards it looks at (reveal, 301.28.a and 301.28.b: the
 * cards stay where they are), so no separate `show` op is needed; the deck order changes only
 * as an effect instructs (302.11.b). The picks, in the order given, go back on top; every other
 * shown card goes to the bottom.
 *
 * What the interpreter models and the text asks for:
 * - "Place the rest at the bottom in any order": the rest keep the order they were shown in; the
 *   bottom order is not chosen by the player.
 * - "Place up to 3 back to the top": with no pick among the shown cards all of them stay on top as
 *   shown, so the player cannot send all 3 to the bottom.
 * - A deck of fewer than 3 cards rearranges as many cards as it holds (304.1.d). An empty deck
 *   leaves the board unchanged.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, rearrangeDeckTop, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-048');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.28.a'), reviewedHash: '07b2366e111b' }, // reveal: both players see the cards
    { key: asRuleKey('301.28.b'), reviewedHash: 'd16957353407' }, // a revealed card stays where it is
    { key: asRuleKey('302.11.b'), reviewedHash: 'e021deff8956' }, // deck order changes only as instructed
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, rearrangeDeckTop('self', 3), trigger('activate', 'BATTLE'), {
    oncePerTurn: true,
  });
}
