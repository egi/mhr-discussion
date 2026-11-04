/**
 * SP01-050, a card that takes an opposing Lv3 Human out of the RETREAT and sits on it.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When this card enters the field by calling, you may place 1 of your opponent's
 *   characters with Lv3 and 【Human】 in their features from RETREAT onto your BATTLE. If you do,
 *   you attach this card from the field to that character.
 *   AUTO【FIELD】:The character this card is attached to and all cards attached to that character
 *   cannot be affected by the effects of cards with Lv1.
 *
 * The script is the TRIG. It starts when this card enters the field by a CALL (301.19); a card put
 * onto the field by an effect does not start it (discussion 31, HEAD-JUDGE via FAQ F-09). The
 * placement is optional (304.1.a). The pick is an opposing Lv3 Human from the RETREAT, placed
 * face-up onto the controller's BATTLE (301.12.a), and the attach is the "If you do" step: it runs
 * only when the placement was done (Reading B, discussion 10 item 3). With no Lv3 Human in the
 * opposing RETREAT nothing happens and that is not an error (discussion 25, 304.1.d).
 *
 * The AUTO is not part of this script. It lives in the AUTO registry (`cards/autos`) as a
 * `cannot-be-affected` restriction with the exact Lv operand `lvIs: 1`.
 *
 * USER DECISION of 2026-11-05 (confirmed by the user): "cards with Lv1" is read as exactly Lv1, so
 * a Lv0 card still affects the character and its attachments. This is a user decision, not a
 * head-judge ruling and not an open question.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  attach,
  bind,
  characters,
  effect,
  ifDone,
  named,
  optional,
  relocate,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-050');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('301.19.a'), reviewedHash: 'c169103329bc' }, // CALL
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
    { discussion: '31', rule: asRuleKey('301.19.a') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(
          relocate(
            bind(select('opponent', 'RETREAT', characters({ lvMin: 3, lvMax: 3, feature: 'Human' })), 'A'),
            { side: 'self', area: 'BATTLE', faceDown: false },
          ),
        ),
        ifDone(attach(source(), named('A'))),
      ),
    ),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
