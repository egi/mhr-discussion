/**
 * BP01-104, a card that sends a same-Lv pair from the BATTLE back to the top of their decks.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT by discarding of effect, you may move 1 of each
 *   player's characters with the same Lv in both BATTLE back to the top of their own deck.
 *   ACTI【BATTLE/ONCE PER TURN】:You move 1 of your characters from RETREAT back to the bottom of
 *   your deck.
 *
 * A script carries one effect, so this one is the TRIG. The ACTI (one RETREAT character to the
 * DECK bottom) is not scripted: it stays with the engine as an unscripted effect. The TRIG starts
 * when another effect discards the card into the RETREAT (`enters-retreat-by-discard-effect`,
 * community discussion 26, RESOLVED); a CALL, a lost fight or the End Phase hand-limit discard do
 * not start it. It is optional (304.1.a). The pair is one own BATTLE character (pick A) and one
 * opposing BATTLE character with the same Lv (`equalLvAcrossSides`, `ref` A); each is moved to the
 * top of its owner's deck (a card leaves for its owner's seat). The second move is a part of the
 * same effect, not gated on the first (304.1.d).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { bind, characters, effect, optional, relocate, select, sequence, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-104');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('302.11.a'), reviewedHash: 'a78d08c5ecfc' }, // Deck area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
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
    optional(
      sequence(
        step(
          relocate(bind(select('self', 'BATTLE', characters({ equalLvAcrossSides: true })), 'A'), {
            side: 'self',
            area: 'DECK-TOP',
            faceDown: false,
          }),
        ),
        step(
          relocate(select('opponent', 'BATTLE', characters({ equalLvAcrossSides: true, ref: 'A' })), {
            side: 'opponent',
            area: 'DECK-TOP',
            faceDown: false,
          }),
        ),
      ),
    ),
    trigger('enters-retreat-by-discard-effect', 'RETREAT'),
  );
}
