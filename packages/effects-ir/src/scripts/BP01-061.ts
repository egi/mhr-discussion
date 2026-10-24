/**
 * BP01-061 Follow Shadow, a Lv6 blue character that swaps itself in from the HAND as a counter.
 * Provisional: the script follows the pre-errata mirror text.
 *
 * Printed text (official card, pre-errata as mirrored):
 *
 *   COUNTER·ACTI【HAND】:You retreat 2 of your set cards in BASE. If you do, you swap this card
 *   in HAND and 1 of your blue characters with Lv4 or above and different name from this card in
 *   BATTLE.
 *
 * The script retreats two of the controller's face-down (set) cards in the BASE and, only if that
 * happened, swaps this card in the HAND with one of the controller's blue characters of Lv4 or
 * above in the BATTLE whose name differs from this card's. A swap with a HAND card places the
 * HAND card and moves the other (301.18.f), and is refused while an effect keeps the BATTLE card
 * from moving (301.18.h).
 *
 * The head judge announced an errata that lets the cost take any card (a set card, a character or
 * an attachment); it is not encoded here. The mirrored text is the pre-errata text, the errata
 * text has not been published, and the cost is not coded from chat alone (discussion 11, item 2).
 * When the published text reaches the card data this script is replaced, not patched. Until then
 * the script is flagged provisional: its note shows on the log line and the detail sheet.
 *
 * The trigger tag is a COUNTER activation from the HAND (201.10.f.3), the same envelope as the
 * other COUNTER·ACTI cards in this directory.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  colored,
  effect,
  ifDone,
  retreat,
  select,
  sequence,
  source,
  step,
  swap,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-061');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET a card (face-down)
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat by effect
    { key: asRuleKey('301.18.f'), reviewedHash: '1dfd38a20178' }, // swap with a HAND card
    { key: asRuleKey('301.18.h'), reviewedHash: 'bce92f4d4890' }, // movement prevention blocks swap
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
    // 11: ESCALATE-OPEN. The pre-errata cost is scripted; the errata is not encoded
    // (discussion 11, item 2).
    { discussion: '11', rule: asRuleKey('301.16.a.3') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(retreat(select('self', 'BASE', { ...ANY_CARD, faceDown: true }, 2))),
      ifDone(
        swap(
          source(),
          select('self', 'BATTLE', colored('blue', { lvMin: 4, differentNameFrom: 'source' })),
        ),
      ),
    ),
    trigger('activate-counter', 'HAND'),
  );
}
