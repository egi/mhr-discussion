/**
 * SP01-027, a UNIQUE attachment that stands up on the BATTLE after it is attached to a Web host.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   AUTO【BATTLE】:For each character with a different name from this card and 【Web】 in its
 *   feature in your VOID, this card gets Power+500.
 *   TRIG【FIELD】:When you attach this card to a character with 【Web】 in its feature on the
 *   field, you may remove this card from the field to your BATTLE.
 *
 * Event tag: this-card-attached, FIELD. The AUTO is modelled elsewhere; the script is the TRIG.
 * The trigger fires on every attach of this card; the host (the event's subject) is tested with
 * `subject-matches` for the Web feature, so a non-Web host does nothing. When it holds, the move is
 * optional (304.1.a): detach this card from the field to the own BATTLE (301.26.a).
 *
 * This card carries no OPEN-RULING marker and no `rulings` entry. Discussion 17 has no textual
 * link to it (it only guesses SP01-027 on one line, an unconfirmed card-name guess), and marking
 * the card provisional would invent a link.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  conditional,
  effect,
  optional,
  relocate,
  source,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-027');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('301.26.a'), reviewedHash: '8c49a3099f84' }, // detach
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'subject-matches', filter: characters({ feature: 'Web' }) },
      optional(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
    ),
    trigger('this-card-attached', 'FIELD'),
  );
}
