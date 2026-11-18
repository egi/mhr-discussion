/**
 * BP01-098, a character that, when discarded by an effect, may attach itself to an opposing
 * character and clear that character's other attachments.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT by discarding of effect, you may attach this card
 *   from RETREAT to 1 of your opponent's characters in the field. If you do, you retreat all the
 *   attaching cards of that character except this card.
 *   AUTO【FIELD】：The character attached by this card can attack the character with Lv6 only.
 *
 * A script carries one effect, so this one is the TRIG. The AUTO clause is modelled in the
 * engine's AUTO registry, not here.
 *
 * Trigger: enters-retreat-by-discard-effect, RETREAT (201.10.d.2). The attach is optional
 * (304.1.a): 1 opposing character on the field is picked and this card is stacked under it
 * (301.25.a). Only if the attach was done are all of that character's other attached cards
 * retreated (301.16.a.4), this card kept. A host with no other attachment is not an error and no
 * opposing character in the field leaves the card in the RETREAT. "If you do" is Reading B (user
 * decision 2026-11-03, partial resolution is engine behaviour; discussion 10 item 3); the first
 * step is a single card, so both readings agree.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  attach,
  characters,
  effect,
  hostOfSource,
  ifDone,
  optional,
  retreatAttachedOfHost,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-098');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.d.2'), reviewedHash: 'bc5181d4de09' }, // trigger effect
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a card stacked under a character is attached
    { key: asRuleKey('301.16.a.4'), reviewedHash: '47953ce28d45' }, // an Attached Card retreated by effect
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(attach(source(), select('opponent', 'FIELD', characters()))),
        ifDone(retreatAttachedOfHost(hostOfSource(), 'all', true)),
      ),
    ),
    trigger('enters-retreat-by-discard-effect', 'RETREAT'),
  );
}
