/**
 * SP01-024, an attachment that stands up on its own after its host retreats and then takes a
 * Machine character from the RETREAT as its own attached card.
 *
 * Printed text (official card):
 *
 *   AUTO【FIELD】:If the character this card is attached to is with 【Machine】 in its feature,
 *   that character gets Power-1000.
 *   TRIG【RETREAT】:When this card follows the character this card is attached to and enters
 *   RETREAT from the field, you may place this card from RETREAT onto BATTLE. If you do, you
 *   attach 1 of your characters with 【Machine】 in their features from RETREAT to this card.
 *
 * Event tag: follows-host-to-retreat, RETREAT. The AUTO is modelled elsewhere; the script is the
 * TRIG. It is optional (304.1.a) and has two steps: place this card from the RETREAT onto the
 * own BATTLE (it is a Character again once detached, 301.26.a), and only if that was done attach
 * one own Machine character from the RETREAT to this card, which is now the host. With no Machine
 * character in the RETREAT the second step is not done and the card still stands on the BATTLE.
 *
 * Discussion 32 (attachments follow the host): HEAD-JUDGE for follow-host (FAQ F-37), RESOLVED
 * for a face-down host going to the RETREAT (301.25.l), ESCALATE-OPEN only for the attach order
 * when a host goes to the deck bottom. This script never has a host leave to the deck bottom, so
 * the open part is not used and carries no OPEN-RULING marker.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  attach,
  characters,
  effect,
  ifDone,
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

export const CARD_NO = asCardNo('SP01-024');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('301.25.c'), reviewedHash: 'f689fb13c049' }, // an Attached Card follows its host
    { key: asRuleKey('301.26.a'), reviewedHash: '8c49a3099f84' }, // detach
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [{ discussion: '32', rule: asRuleKey('301.25.c') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
        ifDone(attach(select('self', 'RETREAT', characters({ feature: 'Machine' })), source())),
      ),
    ),
    trigger('follows-host-to-retreat', 'RETREAT'),
  );
}
