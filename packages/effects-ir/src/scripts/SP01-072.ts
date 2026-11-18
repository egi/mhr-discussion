/**
 * SP01-072, a BATTLE character that steps a Web or Archenemy ally between the BATTLE and the BASE
 * and draws.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/ONCE PER TURN】:1 of your characters with 【Web】 in their features or
 *   【Archenemy】 in their names on BATTLE takes BATTLE-BASE Move once. If you do, you draw 1 card.
 *
 * Event tag: activate, BATTLE, once per turn (201.10.f.2; ONCE PER TURN is an additional
 * Condition). One own BATTLE character with Web in its features or Archenemy in its name (the two
 * facets are alternatives, `anyOf`) takes one effect BATTLE-BASE move (301.24.b), which moves a
 * BATTLE character to the BASE. Only if the move was done does the controller draw 1 card
 * (302.13.b); with no matching character nothing moves and nothing is drawn. "If you do" is
 * Reading B (user decision 2026-11-03, discussion 10 item 3).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { battleMove, characters, draw, effect, ifDone, select, sequence, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-072');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect, ONCE PER TURN
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect BATTLE-BASE move
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  const webOrArchenemy = characters({
    anyOf: [characters({ feature: 'Web' }), characters({ nameIncludes: 'Archenemy' })],
  });
  return effect(
    CARD_NO,
    sequence(step(battleMove(select('self', 'BATTLE', webOrArchenemy))), ifDone(draw('self', 1))),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true },
  );
}
