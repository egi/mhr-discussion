/**
 * BP01-035 「MK44-The Commander」Hulk Buster, a Lv3 Machine that attaches itself to an ally and
 * clears that ally's other attachments.
 *
 * Printed text (official card):
 *
 *   COUNTER·ACTI【FIELD/ONCE PER TURN】: You attach this card from the field to 1 of your
 *   characters in the field. If you do, you retreat all the attaching cards of that character
 *   except this card.
 *   TRIG【BATTLE】:When this card attaches to the character in BATTLE, that character may take
 *   BATTLE Move once.
 *
 * A script carries one effect, so this one is the COUNTER·ACTI, with the same body as BP01-023.
 * The TRIG【BATTLE】 clause (the host may take BATTLE Move once) is not modelled: it is a second
 * effect on the card and stays on the manual path, so the card badges partial.
 *
 * The host is chosen and attached; only if the attach was done does the retreat of the host's other
 * attaching cards run (this card is kept). A host with no other attachment is not an error and no
 * own character in the field leaves the card where it is (304.1.d, discussions 09 and 10;
 * discussion 10 is ESCALATE-OPEN and the "If you do" reading is the engine default, tier: user
 * decision below a head-judge ruling). The host pick never offers this card itself.
 * ONCE PER TURN is the `oncePerTurn` marker on the IR.
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

export const CARD_NO = asCardNo('BP01-035');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a stacked character is an attached card
    { key: asRuleKey('301.16.a.4'), reviewedHash: '47953ce28d45' }, // an Attached Card retreated by effect
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(attach(source(), select('self', 'FIELD', characters({ exceptSource: true })))),
      ifDone(retreatAttachedOfHost(hostOfSource(), 'all', true)),
    ),
    trigger('activate-counter', 'FIELD'),
    { oncePerTurn: true },
  );
}
