/**
 * SP01-054, a BATTLE character that weakens an opposing character when it moves between BATTLE
 * and BASE.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When your opponent's character takes BATTLE-BASE Move, that character gets
 *   Power-1000 this turn. If they do and that character is retreated by this effect, you prune
 *   that character.
 *
 * Event tag: opponent-base-move, BATTLE (301.24.a, the opponent's BATTLE-BASE move). The script is
 * the first sentence: the moving character (the trigger subject) gets Power-1000 until the end of
 * the turn (303.2.a.6.1.2). It does not fire on the player's own BATTLE-BASE moves.
 *
 * Not modelled (the card badges partial, `partial: true` because the card has one TRIG ability):
 * "If they do and that character is retreated by this effect, you prune that character". The
 * Power-1000 can take the character to 0 and retreat it (301.16.a.1), and the prune of the
 * retreated character is the clause that is left out. It stays on the manual path.
 *
 * Rulings, both tiers (discussion 10, item 2, the 0-Power retreat latch). On the pinned vendor
 * board the discussion is ESCALATE-OPEN (items 1, 2 and 4; item 3 closed, Reading B). In the root
 * pack item 2 is HEAD-JUDGE via FAQ F-33 (2026-11-09: the retreat at 0 Power is locked in) plus a
 * USER-DECISION of 2026-11-10 (the remaining steps of an effect stop once a step takes a character
 * to 0; no source disagrees). Under that decision the prune step is not reachable
 * after a retreat by this effect, and the script does not model it either way. The link below is
 * what flags the card provisional.
 *
 * Open reading (UNRULED, engine reading `effective-power-lv-basis`): the stat change is applied
 * to the effective Power at the time of the effect, not the printed value.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, power, subject, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-054');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move trigger
    { key: asRuleKey('301.16.a.1'), reviewedHash: 'bff4b407369d' }, // zero power retreats character
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [{ discussion: '10', rule: asRuleKey('301.16.a.1') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(CARD_NO, power(subject(), -1000), trigger('opponent-base-move', 'BATTLE'), {
    partial: true,
  });
}
