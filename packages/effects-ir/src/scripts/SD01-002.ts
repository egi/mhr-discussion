/**
 * SD01-002, a Hulk Buster that attaches itself to 1 own character as a counter and retreats one of
 * that character's other attached cards.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【FIELD/ONCE PER TURN】: You attach this card from the field to 1 of your
 *   characters in the field. If you do, you retreat 1 attaching card of that character except
 *   this card.
 *   AUTO【FIELD】: The character attached by this card gets R+2 and Power+2500.
 *
 * A script carries one effect, so this one is the COUNTER·ACTI. The AUTO clause is modelled in the
 * engine's AUTO registry, not here.
 *
 * Event tag: activate-counter, FIELD, once per turn (201.10.f.3; ONCE PER TURN is an additional
 * Condition). This card is stacked under 1 other own character on the field (301.25.a). Only if
 * the attach was done is 1 of that character's other attached cards retreated (301.16.a.4), this
 * card kept; a host with no other attachment is not an error. With no other own character on the
 * field the attach is not done and nothing retreats. "If you do" is Reading B (user decision
 * 2026-11-03, discussion 10 item 3).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  attach,
  characters,
  effect,
  hostOfSource,
  ifDone,
  retreatAttachedOfHost,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-002');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a stacked character is an attached card
    { key: asRuleKey('301.16.a.4'), reviewedHash: '47953ce28d45' }, // an Attached Card retreated by effect
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(attach(source(), select('self', 'FIELD', characters({ exceptSource: true })))),
      ifDone(retreatAttachedOfHost(hostOfSource(), 'one', true)),
    ),
    trigger('activate-counter', 'FIELD'),
    { oncePerTurn: true },
  );
}
