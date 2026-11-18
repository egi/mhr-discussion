/**
 * SP01-067 「Anti-Venom」, a character that attaches itself to a character on the field when it is
 * called. Only the TRIG half is scripted; the AUTO half (the host loses its effects) is registered
 * in the engine's AUTO table.
 *
 * Printed text (official card), TRIG clause:
 *
 *   TRIG【BATTLE】:When this card enters the field by calling, you may attach this card from
 *   BATTLE to 1 of the characters on the field.
 *
 * The trigger tag is `enters-field-by-call` from the BATTLE: an entry by an effect does not fire
 * it. The attach is optional (304.1.a). The host is 1 character on the field of either side
 * (BATTLE or BASE; this card itself is not a candidate). With no other character on the field the
 * attach is not done. The card is stacked underneath the host and becomes an Attached Card
 * (301.25.a).
 *
 * OPEN-RULING 50, tier ESCALATE-OPEN: .planning/research/community-rulings/discussions/50-anti-venom-attach-and-attached-triggers-iron-man-black-panther.md
 * (cards SP01-067 among others, `cards-status: confirmed`). Nothing was ruled on whether a trigger
 * of the host that fires on being attached still fires when this card arrives; this script only
 * does the attach and asserts nothing about the host's triggers. Related: discussion 27 (RESOLVED,
 * 301.33.a: losing effects also removes AUTO effects) and discussion 47 (HEAD-JUDGE: an attached
 * card is not a character but keeps its effects).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attach, characters, effect, optional, selectEitherSide, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-067');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // a card stacked under a character is attached
  ],
  rulings: [{ discussion: '50', rule: asRuleKey('301.25.a') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(attach(source(), selectEitherSide('FIELD', characters({ exceptSource: true })))),
    trigger('enters-field-by-call', 'BATTLE'),
  );
}
