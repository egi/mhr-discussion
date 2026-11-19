/**
 * SP01-002, a UNIQUE character that, when it would have a card attached, reveals a red character
 * from the HAND and may place it onto the BATTLE.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   TRIG【BATTLE/ONCE PER TURN】:When this card would have a card attached to it, you reveal 1 of
 *   your red characters in HAND. If you do and this card on BATTLE has the same Lv as that
 *   character, you place that character onto your BATTLE.
 *
 * One clause (the UNIQUE line is a card property, not an effect). Trigger: `would-be-attached` on
 * the BATTLE, once per turn. "Would have a card attached" is the ordinary after-attach timing
 * (discussion 45, USER-DECISION). The reveal is the step: 1 own red character in the HAND is shown
 * (301.28.a). Only if one was revealed (301.38.a) and this card's effective Lv, read live, equals
 * the revealed card's printed Lv (301.45.c: a card in an off-field area is in its original state),
 * that character is placed onto the own BATTLE face up. A different Lv places nothing; this card in
 * the HAND, RETREAT or BASE at evaluation places nothing; no red character in the HAND reveals and
 * places nothing. A second attach in the same turn does not fire again.
 *
 * OPEN-RULING 50, tier ESCALATE-OPEN: .planning/research/community-rulings/discussions/50-anti-venom-attach-and-attached-triggers-iron-man-black-panther.md
 * (cards SD01-001, SP01-067, SP01-009 and SP01-002, `cards-status: confirmed`): whether an on-attach
 * trigger still fires when the host loses its effects by the attach. Nothing is ruled; tests of the
 * engine's current literal reading are marked PROVISIONAL. Rules verified in docs/rules: 301.25.a,
 * 301.28.a, 301.38.a, 301.45.c, 201.10.d.2.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  bind,
  characters,
  conditional,
  effect,
  ifDone,
  named,
  relocate,
  select,
  sequence,
  show,
  sourceLvEqualsRevealed,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-002');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect: ONCE PER TURN
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a card stacked under a character is attached
    { key: asRuleKey('301.28.a'), reviewedHash: '07b2366e111b' }, // show reveals the front face
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // "if you do" needs the earlier text resolved in full
    { key: asRuleKey('301.45.c'), reviewedHash: '0e0ec438088f' }, // an off-field card is in its original state
  ],
  rulings: [{ discussion: '50', rule: asRuleKey('301.25.a') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(show(bind(select('self', 'HAND', characters({ color: 'red' })), 'A'))),
      ifDone(conditional(sourceLvEqualsRevealed(), relocate(named('A'), { side: 'self', area: 'BATTLE', faceDown: false }))),
    ),
    trigger('would-be-attached', 'BATTLE'),
    { oncePerTurn: true },
  );
}
