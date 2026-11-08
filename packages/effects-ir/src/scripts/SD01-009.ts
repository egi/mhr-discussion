/**
 * SD01-009, a Hulk Buster that discards another HAND card to attach itself to a field character.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:You discard 1 of your cards in HAND except this card. If you do, you attach this
 *   card from HAND to 1 of your characters in the field.
 *   TRIG【RETREAT】:When this card enters RETREAT from the field, you show 1 of your set cards in
 *   BASE. If you do, you place 2 of your characters with the same Lv as that set card face down
 *   from RETREAT into your BASE.
 *
 * Event tag: activate, HAND. A script carries one trigger, so this is the first printed clause:
 * the player discards 1 other card of the HAND (301.15.a.2; this card is excluded) and, only if that
 * was done, attaches this card to 1 of their field characters (301.25.a). With no other HAND card
 * nothing is discarded and nothing is attached; with no field character the discard is done and the
 * attach is not. The TRIG【RETREAT】 clause (show a set card, place 2 same-Lv characters from the
 * RETREAT face down into the BASE; the "11 B2" zone-full case, discussion 24, HEAD-JUDGE for the
 * principle with CONSENSUS cases) is not modelled and stays on the manual path, so the card badges
 * partial. "If you do" follows Reading B (discussion 10 item 3, ESCALATE-OPEN, user decision of
 * 2026-11-03).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  attach,
  characters,
  discard,
  effect,
  ifDone,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-009');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
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
    sequence(
      step(discard(select('self', 'HAND', { ...ANY_CARD, exceptSource: true }, 1))),
      ifDone(attach(source(), select('self', 'FIELD', characters()))),
    ),
    trigger('activate', 'HAND'),
  );
}
