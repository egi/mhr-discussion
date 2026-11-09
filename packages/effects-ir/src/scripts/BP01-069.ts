/**
 * BP01-069 「Fantastic Calling」Human Torch, a Lv4 character that swaps a HAND card in for a BATTLE
 * character, then draws and returns itself to the bottom of the deck.
 *
 * Printed text (official card):
 *
 *   ACTI【FIELD/ONCE PER TURN】:You swap 1 of your characters with LvX+1 in HAND and 1 of your
 *   characters in BATTLE except this card. X is the Lv of that character in BATTLE. If you do, you
 *   draw 1 card and move this card from the field back to the bottom of your deck.
 *
 * The BATTLE character is chosen first and bound as pick A (this card is never offered); the HAND
 * character is then offered only at Lv A+1 (`lvOffsetFromSelected: 1`). A swap with a HAND card
 * places the HAND card and moves the other (301.18.f) and is refused while an effect keeps the
 * BATTLE card from moving (301.18.h, discussion 04). Only when the swap was done do the two
 * results run. They are independent parts of one "If you do" (Reading B nested shape): the draw
 * and the move to the deck bottom each run on their own, so a short deck does not stop the move
 * (304.1.d, discussions 09 and 10; discussion 10 is ESCALATE-OPEN, the nesting is the engine's
 * default reading, tier: user decision below a head-judge ruling).
 *
 * Not settled here: the order of the deck bottom when this card moves while hosting attachments
 * and when several cards arrive together (community discussion 32, ESCALATE-OPEN; 301.25.f/i
 * cover cards following their host). ONCE PER TURN is the `oncePerTurn` marker on the IR. The Lv
 * read for pick A is the effective Lv (registered engine reading `effective-power-lv-basis`,
 * UNRULED).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  bind,
  characters,
  draw,
  effect,
  ifDone,
  relocate,
  select,
  sequence,
  source,
  step,
  swap,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-069');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect: printed Condition (ONCE PER TURN) is an additional Condition
    { key: asRuleKey('301.18.f'), reviewedHash: '1dfd38a20178' }, // swap with a HAND card
    { key: asRuleKey('301.18.h'), reviewedHash: 'bce92f4d4890' }, // movement prevention blocks swap
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw from DECK top
    { key: asRuleKey('302.11.a'), reviewedHash: 'a78d08c5ecfc' }, // Deck area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [
    { discussion: '04', rule: asRuleKey('301.18.h') },
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(
        swap(
          bind(select('self', 'BATTLE', characters({ exceptSource: true })), 'A'),
          select('self', 'HAND', characters({ lvOffsetFromSelected: 1 })),
        ),
      ),
      ifDone(
        sequence(
          step(draw('self', 1)),
          step(relocate(source(), { side: 'self', area: 'DECK-BOTTOM', faceDown: false })),
        ),
      ),
    ),
    trigger('activate', 'FIELD'),
    { oncePerTurn: true },
  );
}
