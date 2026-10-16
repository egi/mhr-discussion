/**
 * SD04-002, a green Lv6 character that mills two cards and weakens an opposing BATTLE character by their Lv.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field, you discard the top 2 cards of your deck.
 *   If you do, 1 of your opponent's characters in BATTLE gets Power-X000. X is the total
 *   value of Lv of the cards you discard by this effect.
 *
 * The script discards the top two cards of the player's DECK and, only if that happened,
 * lowers the Power of one opposing BATTLE character by 1000 for every Lv of the discarded
 * cards, until the end of the turn. A DECK with fewer than two cards cannot satisfy it.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  mill,
  select,
  sequence,
  statMod,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-002');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.15.a.3'), reviewedHash: '9ac3aa7c9412' }, // discard from deck
    { key: asRuleKey('301.8.a'), reviewedHash: '7008a08eb9de' }, // power floor of zero
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // greatest extent
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(mill('self', 'top', 2, 'discard')),
      ifDone(
        statMod(select('opponent', 'BATTLE', characters()), 'power', -1000, 'discarded-lv-total'),
      ),
    ),
    trigger('enters-field', 'FIELD'),
  );
}
