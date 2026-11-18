/**
 * SP01-037, an attachment that goes back into the BASE after its host retreats.
 *
 * Printed text (official card):
 *
 *   AUTO【BATTLE】:The character this card is attached to gets R+2.
 *   TRIG【RETREAT】:When this card follows the character this card is attached to and enters
 *   RETREAT from the field, you may place this card from RETREAT into your BASE.
 *
 * Event tag: follows-host-to-retreat, RETREAT. The AUTO is modelled elsewhere; the script is the
 * TRIG, one optional step (304.1.a): place this card from the RETREAT into the own BASE, face up.
 * The BASE limit is 6 (302.6.a), so a full BASE leaves the card in the RETREAT.
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

export const CARD_NO = asCardNo('SP01-037');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.25.c'), reviewedHash: 'f689fb13c049' }, // an Attached Card follows its host
    { key: asRuleKey('302.6.a'), reviewedHash: 'a0baa15958d8' }, // BASE area, limit 6
  ],
  rulings: [{ discussion: '32', rule: asRuleKey('301.25.c') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(relocate(source(), { side: 'self', area: 'BASE', faceDown: false })),
    trigger('follows-host-to-retreat', 'RETREAT'),
  );
}
