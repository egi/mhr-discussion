/**
 * SP01-035, a character that prunes itself when a Human loses a fight in BATTLE to bring a Lv3
 * Spider-Man character back from the VOID.
 *
 * Printed text (official card):
 *
 *   TRIG【BATTLE】:When your character with 【Human】 in its feature enters RETREAT from BATTLE by
 *   losing the fight, you may prune this card on BATTLE. If you do, you place 1 of your
 *   characters with Lv3 and 【Spider-Man】 in their names from VOID onto the field.
 *
 * Event tag: own-character-enters-retreat-by-losing-fight narrowed to the Human feature, BATTLE.
 * The prune of this card is optional (304.1.a); only if it was done is one own character of
 * printed Lv3 with Spider-Man in its name placed from the VOID onto the field (the lane is the
 * player's choice). This card was pruned first, so it is itself a VOID card but is only a legal
 * pick if it is Lv3 with Spider-Man in its name. With no such character in the VOID the prune
 * stays and the effect resolves (discussion 25). "If you do" follows Reading B (discussion 10
 * item 3, ESCALATE-OPEN, user decision of 2026-11-03); resolving to the greatest extent is 304.1.d
 * (discussion 09, RESOLVED). Printed Lv is read; `effective-power-lv-basis` is UNRULED.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, effect, ifDone, optional, prune, relocate, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-035');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card in VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
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
    optional(
      sequence(
        step(prune(source())),
        ifDone(
          relocate(select('self', 'VOID', characters({ lvMin: 3, lvMax: 3, nameIncludes: 'Spider-Man' })), {
            side: 'self',
            area: 'FIELD',
            faceDown: false,
          }),
        ),
      ),
    ),
    trigger('own-character-enters-retreat-by-losing-fight', 'BATTLE', undefined, { feature: 'Human' }),
  );
}
