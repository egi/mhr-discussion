/**
 * SP01-028, an attachment that stands up on the BATTLE after its host retreats.
 *
 * Printed text (official card):
 *
 *   AUTO【FIELD】:The character this card is attached to gets R-1.
 *   TRIG【RETREAT】:When this card follows the character this card is attached to and enters
 *   RETREAT from the field, you may place this card from RETREAT onto your BATTLE.
 *
 * Event tag: follows-host-to-retreat, RETREAT. The AUTO is modelled elsewhere; the script is the
 * TRIG, one optional step (304.1.a): place this card from the RETREAT onto the own BATTLE. A card
 * that entered the RETREAT without following a host does not fire it.
 *
 * Discussion 32 (attachments follow the host): HEAD-JUDGE for follow-host (FAQ F-37), RESOLVED
 * for a face-down host going to the RETREAT (301.25.l), ESCALATE-OPEN only for the attach order
 * when a host goes to the deck bottom. No host leaves to the deck bottom here, so the open part is
 * not used and carries no OPEN-RULING marker.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, optional, relocate, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-028');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.25.c'), reviewedHash: 'f689fb13c049' }, // an Attached Card follows its host
    { key: asRuleKey('301.26.a'), reviewedHash: '8c49a3099f84' }, // detach
  ],
  rulings: [{ discussion: '32', rule: asRuleKey('301.25.c') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
    trigger('follows-host-to-retreat', 'RETREAT'),
  );
}
