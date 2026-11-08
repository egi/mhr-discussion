/**
 * BP01-116, a Falcon that falls back to the BASE when an opposing WING character attacks.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】:When your opponent's character in WING attacks, you may move 1 of your characters
 *   from BATTLE to your BASE. If you do, this card takes BATTLE-BASE Move once.
 *
 * The trigger tag is `opponent-character-attacks` from the FIELD, narrowed to an attacker that
 * stands in a WING (the `lane` subject filter): it fires for the seat that is attacked and not for
 * the attacker's own seat, nor for a FRONT or BACK attacker. The whole effect is optional (304.1.a).
 * The script moves one of the player's BATTLE characters to the BASE (301.24.b) and, only if that
 * was done, this card takes BATTLE-BASE Move: from a lane to the BASE, or from the BASE to the lane
 * the player names (without a lane choice the interpreter answers EFFECT_UNEXECUTABLE and changes
 * nothing). The chosen character may be this card itself; it is then in the BASE and the second
 * move takes it back to a lane the player names. "If you do" is Reading B (a user decision, closed
 * in discussion 10 item 3, rule 301.38.a); this script does not declare discussion 10.
 *
 * Ruling: discussion 22 (HEAD-JUDGE) says a character that declared an attack has attacked even if
 * the attack failed, so the trigger fires when the attack is declared.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  battleMove,
  characters,
  effect,
  ifDone,
  optional,
  relocate,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-116');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect BATTLE-BASE move
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
    { key: asRuleKey('303.2.a.4.3'), reviewedHash: '7c6ee101bd64' }, // battle process (the attack is declared)
  ],
  rulings: [{ discussion: '22', rule: asRuleKey('303.2.a.4.3') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(relocate(select('self', 'BATTLE', characters()), { side: 'self', area: 'BASE', faceDown: false })),
        ifDone(battleMove(source())),
      ),
    ),
    trigger('opponent-character-attacks', 'FIELD', undefined, { lane: 'WING' }),
  );
}
