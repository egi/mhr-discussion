/**
 * BP01-061 Follow Shadow, a Lv6 blue character that swaps itself in from the HAND as a counter.
 * Provisional: the cost follows the errata text; the attachment case is not encoded (below).
 *
 * Printed text (official card, post-errata as mirrored 2026-11-01):
 *
 *   COUNTER·ACTI【HAND】:You retreat 2 of your cards in BASE. If you do, you swap this card in
 *   HAND and 1 of your blue characters with Lv4 or above and different name from this card in
 *   BATTLE.
 *
 * The pre-errata text read "2 of your set cards". The script retreats two of the controller's
 * cards in the BASE, face-down or face-up (discussion 37, HEAD-JUDGE: the cost takes any card
 * instead of set cards only), and, only if that happened, swaps this card in the HAND with one of
 * the controller's blue characters of Lv4 or above in the BATTLE whose name differs from this
 * card's. A swap with a HAND card places the HAND card and moves the other (301.18.f), and is
 * refused while an effect keeps the BATTLE card from moving (301.18.h).
 *
 * Not encoded: the head judge also ruled that a BASE host can be retreated together with its
 * attachment when both are declared (two cards), while declaring only the host counts as one.
 * Here an attachment is not a pickable BASE card, so it only follows its host and never counts
 * toward the two. The IR selects from one area, and BASE plus ATTACHED would need a new one.
 * Until then the script is flagged provisional: its note shows on the log line and the detail sheet.
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
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat by effect
    { key: asRuleKey('301.18.f'), reviewedHash: '1dfd38a20178' }, // swap with a HAND card
    { key: asRuleKey('301.18.h'), reviewedHash: 'bce92f4d4890' }, // movement prevention blocks swap
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
    // 37: HEAD-JUDGE principle (any card), published text in the mirror; the attachment
    // declaration is not encoded. 11 stays for the swap and the provisional note.
    { discussion: '11', rule: asRuleKey('301.16.a.3') },
    { discussion: '37', rule: asRuleKey('301.16.a.3') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(retreat(select('self', 'BASE', ANY_CARD, 2))),
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
