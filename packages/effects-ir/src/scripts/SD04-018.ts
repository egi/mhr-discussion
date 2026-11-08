/**
 * SD04-018, a character that loots when it moves.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card takes BATTLE-BASE Move, you draw 1 card. If you do, you discard
 *   1 of your cards in HAND.
 *
 * Event tag: base-move, FIELD (301.24.a). Draw 1, then only if a card was drawn discard 1 own HAND
 * card of the player's choice. With an empty DECK nothing is drawn and nothing is discarded. "If
 * you do" follows Reading B (discussion 10 item 3, ESCALATE-OPEN, user decision of 2026-11-03).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  discard,
  draw,
  effect,
  ifDone,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-018');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move trigger
    { key: asRuleKey('301.15.a'), reviewedHash: '2148fe594165' }, // discard
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
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
    sequence(step(draw('self', 1)), ifDone(discard(select('self', 'HAND', ANY_CARD)))),
    trigger('base-move', 'FIELD'),
  );
}
