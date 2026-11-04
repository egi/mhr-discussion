/**
 * BP01-063, a card that trades itself from the HAND for the removal of a weak opposing character
 * when one of your characters loses Power.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:When the Power of your character decreases,you may prune this card in HAND.If you
 *   do, you prune 1 of your opponent's characters with Power 3500 or lower in BATTLE.
 *
 * The trigger is a Power decrease of any of the controller's characters
 * (`own-character-power-decreases`). Whether "decreases" means any drop or only a drop by an
 * effect is the engine reading `bp01-063-any-decrease` (UNRULED); a HAND trigger is seen at the
 * moment of the change (discussions 16 and 18). The prune is optional (304.1.a). Only if it was
 * done does the opposing BATTLE character with Power 3500 or lower get pruned (`powerMax`; the
 * engine's card filter compares the printed Power, so a temporary Power change does not move a
 * character in or out of the limit; whether the limit should read effective Power is the open
 * point of `effective-power-lv-basis`, UNRULED). With no such character the prune of this card
 * stays and the effect resolves (discussion 10 item 3, Reading B; discussion 25).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  optional,
  prune,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-063');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
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
        ifDone(prune(select('opponent', 'BATTLE', characters({ powerMax: 3500 })))),
      ),
    ),
    trigger('own-character-power-decreases', 'HAND'),
  );
}
