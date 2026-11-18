/**
 * BP01-094, a character that retreats opposing cards at the end of the own turn, as many as it
 * did not attack with.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When your turn ends, you may retreat 1 of your opponent's characters with LvX
 *   in the field or X of your opponent's set cards in the field. X is the number of your
 *   characters that did not attack in BATTLE in this turn.
 *
 * The trigger tag is `turn-ends` from the FIELD, seen only by the seat whose turn ends. The whole
 * effect is optional (304.1.a). The printed "or" is read as an exclusive `chooseOne`: the player
 * picks exactly one branch (a) retreat 1 opponent character in the field whose Lv equals X, or
 * (b) retreat X of the opponent's set cards in the field (X times 1, `countScale`). X counts own
 * characters that did not attack (`non-attacking-own-characters`). The unchosen branch changes
 * nothing; X = 0 retreats no set card and finds only a Lv0 character; with fewer than X set cards
 * the retreat does as much as it can (304.1.d, discussion 24).
 *
 * READING, tier USER DECISION 2026-11-18 ("Exclusive chooseOne for both", recorded in
 * 17.5.2-BASELINE.md `Checkpoint plan 02`): the Comprehensive Rules v1.03 do not define "or" and
 * there is no community or judge ruling on this card. Tests of the choice are named
 * `PROVISIONAL (planner reading, no ruling)`.
 *
 * A retreat by this effect is immediate (HEAD-JUDGE F-33), so the board is settled after one run.
 * The engine's AUTO same-moment tie-break and its reading of unlettered 301.41 combinations are
 * the user-confirmed engine readings of 2026-11-17, unchanged by this script. This card is not
 * linked to any community-ruling discussion.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, characters, chooseOne, effect, optional, retreat, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR, EffectTarget } from '../ir';

export const CARD_NO = asCardNo('BP01-094');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.16.a.3'), reviewedHash: 'cdc114bcae3f' }, // retreat by effect
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The opponent's set cards in the field, as many as X. */
function setCardsScaledByX(): EffectTarget {
  const one = select('opponent', 'FIELD', { ...ANY_CARD, faceDown: true });
  if (one.kind !== 'selected') throw new Error('selected target expected');
  return { ...one, countScale: 'non-attacking-own-characters' };
}

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      chooseOne(
        retreat(select('opponent', 'FIELD', characters({ lvBy: { mode: 'exact', source: 'non-attacking-own-characters' } }))),
        retreat(setCardsScaledByX()),
      ),
    ),
    trigger('turn-ends', 'FIELD'),
  );
}
