/**
 * SD02-014, a Hulk Buster that hits harder when it attacks a Lv4-or-above character.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When this card attacks, if its target is the character with Lv4 or above, this
 *   card gets Power+1500 in this turn.
 *
 * Event tag: attacks, BATTLE (the card must stand in BATTLE when it attacks). The script is the
 * effect after the trigger: when the declared attack's target is a character of Lv4 or above, this
 * card gets Power+1500 until the end of the turn (301.40.a, 303.2.a.6.1.2); against a Lv3 or lower
 * target, or a Weakness attack with no character target, nothing changes.
 *
 * Open reading (UNRULED, engine reading `effective-power-lv-basis`): the Lv test reads the target's
 * effective Lv, not its printed Lv, because the community has not ruled which basis a printed
 * "Lv4 or above" uses. A printed-Lv reading would differ only for a target whose Lv is modified.
 * No community ruling governs the attack-target clause itself.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, power, source, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-014');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('303.2.a.4.3.1.1'), reviewedHash: '83ebfc5199ca' }, // a character attacks by choosing a target
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'attack-target-matches', filter: characters({ lvMin: 4 }), powerAboveSource: false },
      power(source(), 1500),
    ),
    trigger('attacks', 'BATTLE'),
  );
}
