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
 * Event tag: opponent-base-move, BATTLE (301.24.a, the opponent's BATTLE-BASE move). It does not
 * fire on the player's own BATTLE-BASE moves.
 *
 * Model, two steps: the moving character (the trigger subject) gets Power-1000 until the end of the
 * turn (303.2.a.6.1.2); then, gated on the first step having been done ("If they do", the engine
 * default Reading B, discussion 10 item 3) and on that character having been retreated by this
 * effect (the previous-step-retreated condition), the character is pruned. "Retreated by this
 * effect" is read as retreated at Power 0 by the -1000, the only way this effect retreats it; a
 * character that retreats for any other reason before the prune is not pruned.
 *
 * Decision, depth-first (discussion 10, item 2). The retreat of a character at Power 0 is
 * immediate (HEAD-JUDGE, FAQ F-33; 301.16.a.1, 301.16.b). That the effect's remaining steps still
 * run afterwards, so the prune follows the retreat, is a USER DECISION of 2026-11-11 with no
 * head-judge ruling, supported by 301.16.b and 304.1.d. A retreat trigger of the character waits
 * until the effect is done (304.1.h). Whether such a trigger still resolves when the same effect
 * then prunes its source card is OPEN (discussion 10) and is not claimed here. The ruling link
 * below is what flags the card provisional.
 *
 * Open reading (UNRULED, engine reading `effective-power-lv-basis`): the stat change is applied
 * to the effective Power at the time of the effect, not the printed value.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { conditional, effect, ifDone, power, prune, sequence, step, subject, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-054');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger
    { key: asRuleKey('301.24.a'), reviewedHash: '0cb9dd0e8eaa' }, // BATTLE-BASE move trigger
    { key: asRuleKey('301.16.a.1'), reviewedHash: 'bff4b407369d' }, // zero power retreats character
    { key: asRuleKey('301.16.b'), reviewedHash: 'e91c00c1a4ce' }, // retreat at zero is immediate
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
    { key: asRuleKey('304.1.h'), reviewedHash: 'e8f95b60b174' }, // triggers resolve after the effect
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [{ discussion: '10', rule: asRuleKey('301.16.a.1') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(power(subject(), -1000)),
      ifDone(conditional({ kind: 'previous-step-retreated' }, prune(subject()), null)),
    ),
    trigger('opponent-base-move', 'BATTLE'),
  );
}
