/**
 * SP01-029, an attachment that is attached from the BASE and gives its new host R+1.
 *
 * Printed text (official card):
 *
 *   AUTO【FIELD】:If the character this card is attached to is with Lv4 and has only 1 attached
 *   card, that character gets Power+3000.
 *   ACTI【BASE/ONCE PER TURN】:You attach this card from BASE to 1 of your characters on the
 *   field. If you do, that character gets R+1 this turn.
 *
 * Event tag: activate, BASE, once per turn (201.10.f.2). The AUTO is modelled elsewhere; the
 * script is the ACTI: attach this card to one own character on the field (the pick is bound as
 * A), and only if that was done give A R+1 until the end of the turn. With no own character on the
 * field the attach is not done and nothing is granted. The R bonus goes to the new host only.
 *
 * Discussion 32 (attachments follow the host): HEAD-JUDGE for follow-host (FAQ F-37), RESOLVED
 * for a face-down host going to the RETREAT (301.25.l), ESCALATE-OPEN only for the attach order
 * when a host goes to the deck bottom. Nothing here sends a host to the deck bottom, so the open
 * part is not used and carries no OPEN-RULING marker.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  attach,
  bind,
  characters,
  effect,
  ifDone,
  named,
  select,
  sequence,
  source,
  statMod,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-029');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect, ONCE PER TURN
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('301.25.c'), reviewedHash: 'f689fb13c049' }, // an Attached Card follows its host
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [{ discussion: '32', rule: asRuleKey('301.25.c') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(attach(source(), bind(select('self', 'FIELD', characters()), 'A'))),
      ifDone(statMod(named('A'), 'r', 1)),
    ),
    trigger('activate', 'BASE'),
    { oncePerTurn: true },
  );
}
