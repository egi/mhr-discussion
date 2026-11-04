/**
 * BP01-040, a card that places itself from the HAND by pruning three differently named Machines.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】: You prune 3 of your characters with different name and 【Machine】 in their
 *   features in RETREAT. If you do, you place this card from HAND into your field.
 *
 * The three Machines are one pick of three with `differentNameFrom: 'selected'`, so the picks must
 * have pairwise different names; two characters with the same name are not accepted together.
 * Fewer than three eligible Machines (or fewer than three distinct names) leaves the prune undone
 * and nothing happens, the card stays in HAND (304.1.d). Only if the prune was done is this card
 * placed into the field (`relocate`); the lane comes from the invocation's placement choice and
 * without one the effect answers unexecutable instead of choosing (a placement rule is not
 * printed). The script carries no trigger tag because it places a card into the field.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, ifDone, prune, relocate, select, sequence, source, step } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-040');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up into field
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(
        prune(
          select('self', 'RETREAT', characters({ feature: 'Machine', differentNameFrom: 'selected' }), 3),
        ),
      ),
      ifDone(relocate(source(), { side: 'self', area: 'FIELD', faceDown: false })),
    ),
  );
}
