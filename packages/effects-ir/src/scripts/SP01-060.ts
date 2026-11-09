/**
 * SP01-060, a character that reveals a set card to recover a same-Lv character from the RETREAT
 * when it moves.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When this card takes BATTLE-BASE Move, you reveal 1 of your set
 *   cards in BASE. If you do, you place 1 of your characters with the same Lv as that set card
 *   from RETREAT face down into your BASE.
 *
 * Event tag: base-move, FIELD (301.24.a), once per turn (201.10.d.2), on this card's own move only.
 * The player reveals 1 own set (face-down, 301.13.a) card in BASE (301.28.a). Only if it was shown
 * is 1 own RETREAT character with the same Lv as the shown card placed face down into the BASE
 * (301.21.a, a placement by effect; 301.13.a). With no set card in BASE nothing is revealed and no
 * placement runs; with no same-Lv character in the RETREAT the reveal stands and the placement is
 * not done (304.1.d). "If you do" follows Reading B (discussion 10 item 3, USER-DECISION of
 * 2026-11-04, closed).
 *
 * Open reading (UNRULED, engine reading `effective-power-lv-basis`): Lv is read by the printed
 * value.
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
  sequence,
  show,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-060');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect: ONCE PER TURN is an additional Condition
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move trigger
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // a set card is a face-down card in the BASE
    { key: asRuleKey('301.28.a'), reviewedHash: '07b2366e111b' }, // show reveals the front face
    { key: asRuleKey('301.21.a'), reviewedHash: '73c1095ad66d' }, // placed face-down in the BASE by an effect
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
      step(show(bind(select('self', 'BASE', { ...ANY_CARD, faceDown: true }, 1), 'A'))),
      ifDone(
        relocate(select('self', 'RETREAT', characters({ lvSameAsRevealed: true }), 1), {
          side: 'self',
          area: 'BASE',
          faceDown: true,
        }),
      ),
    ),
    trigger('base-move', 'FIELD'),
    { oncePerTurn: true },
  );
}
