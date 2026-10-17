/**
 * SD04-015, a character that prunes itself from the RETREAT to move a field character.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】: When this card enters RETREAT from the field, you prune this card in RETREAT.
 *   If you do, 1 of your characters in the field takes BATTLE-BASE Move once.
 *
 * The script prunes this card from the RETREAT and, only if that happened, moves one of the
 * player's field characters between BATTLE and BASE. "When this card enters RETREAT from the
 * field" is the envelope and no existing trigger event names it, so the script carries no
 * trigger tag. The move is an op the interpreter does not run yet, so applying this script
 * answers EFFECT_UNSUPPORTED, changes nothing, and the card is played by hand.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { battleMove, characters, effect, ifDone, prune, select, sequence, source, step } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-015');

// 09: RESOLVED (rulebook 304.1 plus head-judge rulings).
// 10: ESCALATE-OPEN. "If you do" after a partly done step runs the next step (Reading A,
// tier: user decision below a head-judge ruling; 301.38.a points the other way).
export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect BATTLE-BASE move
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // greatest extent
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
      step(prune(source())),
      ifDone(battleMove(select('self', 'FIELD', characters()))),
    ),
  );
}
