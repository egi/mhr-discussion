/**
 * SD03-002, a character that drags an opposing WING character into the BASE and may cover it.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field, you move 1 of your opponent's characters with
 *   Lv4 or below from WING to your opponent's BASE. If you do and your opponent has 4 or more
 *   cards in BASE, you cover that character.
 *
 * Event tag: enters-field, FIELD. The script moves 1 opposing WING character of printed Lv4 or
 * below (a Lv5 WING character is not a legal target) to the opponent's BASE face up and, only if
 * that was done and the opponent now has 4 or more cards in BASE (the moved card counts), covers
 * that same character (turns it face down). A false count leaves it face up. Survey label
 * "11 B2" is discussion 24: HEAD-JUDGE for the principle "do as much as you can" (FAQ F-29,
 * CR 304.1.d); the zone-full case (a full BASE) is CONSENSUS and ranks below the rulebook. "If you
 * do" follows Reading B (discussion 10 item 3, ESCALATE-OPEN, user decision of 2026-11-03).
 * Printed Lv is used (effective-power-lv-basis is UNRULED).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  bind,
  characters,
  conditional,
  cover,
  effect,
  ifDone,
  named,
  relocate,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD03-002');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '10', rule: asRuleKey('304.1.d') },
    { discussion: '24', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(
        relocate(bind(select('opponent', 'WING', characters({ lvMax: 4 }), 1), 'A'), {
          side: 'opponent',
          area: 'BASE',
          faceDown: false,
        }),
      ),
      ifDone(
        conditional(
          { kind: 'have', side: 'opponent', area: 'BASE', filter: ANY_CARD, min: 4, max: null },
          cover(named('A')),
        ),
      ),
    ),
    trigger('enters-field', 'FIELD'),
  );
}
