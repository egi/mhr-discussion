/**
 * SD02-011, a Thor in the BACK that flips a set card when a weak character loses its fight.
 *
 * Printed text (official card):
 *
 *   TRIG【BACK/ONCE PER TURN】:When your character with original Lv3 or below loses the fight, you
 *   show 1 of your set cards in BASE. If you do and that set card has the same Lv as that character,
 *   flip that set card.
 *
 * Event tag: own-character-loses-fight, BACK, once per turn (201.10.d.2), subject printed
 * Lv3 or below ("original Lv"; a Lv4 loser does not fire it). The script is the effect after the
 * trigger: the player shows 1 set (face-down) card in their BASE (301.28.a); only if a card was
 * shown, and only if its Lv equals the Lv of the losing character, that same card is flipped
 * face-up (301.22.a, 301.22.c.1). A set card of a different Lv is shown and stays face-down. With no
 * set card in BASE nothing is shown or flipped. The Lv-equality test is written as one branch per Lv
 * (1, 2, 3; the trigger already limits the loser to Lv3 or below), because the IR has no direct
 * "same Lv as that character" condition. The flip is not an entry into the field: flipping a
 * face-down card is not placing it on the FIELD, so "enters the field" effects do not trigger
 * (discussion 30, HEAD-JUDGE via FAQ F-11; the rule behind the flip is 301.22.a, not 301.22.d,
 * which only restricts a flip that would break UNIQUE).
 *
 * Open reading (UNRULED, engine reading `effective-power-lv-basis`): the trigger reads the loser's
 * printed Lv ("original Lv"); the equality test reads the loser's effective Lv at the time of the
 * effect and the set card's printed Lv. The "If you do" reading is the engine default Reading B
 * (discussion 10, ESCALATE-OPEN on the board; user decision of 2026-11-03).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  bind,
  conditional,
  effect,
  flip,
  ifDone,
  named,
  select,
  sequence,
  show,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR, EffectOp } from '../ir';

export const CARD_NO = asCardNo('SD02-011');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect: printed Condition (ONCE PER TURN) is an additional Condition
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // a set card is a face-down card in the BASE
    { key: asRuleKey('301.28.a'), reviewedHash: '07b2366e111b' }, // show reveals the front face
    { key: asRuleKey('301.22.a'), reviewedHash: '4a51b9811106' }, // flip a face-down card face-up
  ],
  rulings: [{ discussion: '30', rule: asRuleKey('301.22.a') }],
});

const setCard = () => select('self', 'BASE', { ...ANY_CARD, faceDown: true }, 1);

/** Flip the shown card when the losing character and the shown card both have Lv `lv`. */
const flipWhenLv = (lv: number, otherwise: EffectOp | null): EffectOp =>
  conditional(
    { kind: 'subject-matches', filter: { ...ANY_CARD, characterOnly: true, lvMin: lv, lvMax: lv } },
    conditional(
      { kind: 'top-card-matches', filter: { ...ANY_CARD, lvMin: lv, lvMax: lv } },
      flip(named('A'), false),
    ),
    otherwise,
  );

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(show(bind(setCard(), 'A'))),
      ifDone(flipWhenLv(1, flipWhenLv(2, flipWhenLv(3, null)))),
    ),
    trigger('own-character-loses-fight', 'BACK', undefined, { levelAtMost: 3 }),
    { oncePerTurn: true },
  );
}
