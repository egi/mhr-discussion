/**
 * BP01-113, a Falcon that steps between BATTLE and BASE when an opposing BACK character attacks.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When your opponent's character in BACK attacks, this card may take
 *   BATTLE-BASE Move once.
 *
 * The trigger tag is `opponent-character-attacks` from the FIELD, narrowed to an attacker that
 * stands in BACK (the `lane` subject filter): it fires for the seat that is attacked and not for
 * the attacker's own seat, nor for a FRONT or WING attacker. ONCE PER TURN is the `oncePerTurn`
 * marker. The move is optional (304.1.a). The script moves this card between a BATTLE area and the
 * BASE (301.24.b): from a lane to the BASE, or from the BASE to the lane the player names; without
 * a lane choice the interpreter answers EFFECT_UNEXECUTABLE and changes nothing.
 *
 * Ruling: discussion 22 (HEAD-JUDGE) says a character that declared an attack has attacked even if
 * the attack failed, so the trigger fires when the attack is declared.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { battleMove, effect, optional, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-113');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect BATTLE-BASE move
    { key: asRuleKey('303.2.a.4.3'), reviewedHash: '7c6ee101bd64' }, // battle process (the attack is declared)
  ],
  rulings: [{ discussion: '22', rule: asRuleKey('303.2.a.4.3') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(battleMove(source())),
    trigger('opponent-character-attacks', 'FIELD', undefined, { lane: 'BACK' }),
    { oncePerTurn: true },
  );
}
