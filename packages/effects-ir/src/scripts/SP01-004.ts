/**
 * SP01-004, an Elektra that jumps from the HAND onto the BATTLE when a small Human opponent arrives.
 *
 * Printed text (official card):
 *
 *   TRIG【HAND】:When your opponent's character with Lv3 or below and 【Human】 in its features
 *   enters the field, you may place this card from HAND onto your BATTLE. If you do and you have
 *   the characters with 【Daredevil】 in their names on the field, you prune that opponent's
 *   character.
 *   TRIG【RETREAT】:When this card enters RETREAT from the field by an effect, 1 of your characters
 *   on the field gets R+1 this turn.
 *
 * One trigger per script: this script is the FIRST clause (the TRIG【HAND】 clause), tagged
 * opponent-character-enters-field, HAND, subject printed Lv3 or below with Human in its features (a
 * Lv4 or a non-Human entrant does not fire it). The script is the effect after the trigger: an
 * optional placement of this card from the HAND onto the controller's BATTLE (301.12.a); only if it
 * was placed, and only if the controller has a field character with Daredevil in its name, the
 * entering opponent character is pruned (301.17.a). Placed without a Daredevil on the field means no
 * prune. Declining leaves the board unchanged.
 *
 * Not modelled: the TRIG【RETREAT】 clause (an own field character gets R+1 this turn when this card
 * enters RETREAT from the field by an effect). It stays on the manual path and the card is badged
 * partial.
 *
 * Open reading (UNRULED, engine reading `effective-power-lv-basis`): the entrant's Lv is its printed
 * Lv. The "If you do" reading is the engine default Reading B (discussion 10, ESCALATE-OPEN on the
 * board; user decision of 2026-11-03).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  conditional,
  effect,
  ifDone,
  optional,
  prune,
  relocate,
  sequence,
  source,
  step,
  subject,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-004');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(relocate(source(), { side: 'self', area: 'BATTLE', faceDown: false })),
        ifDone(
          conditional(
            {
              kind: 'have',
              side: 'self',
              area: 'FIELD',
              filter: characters({ nameIncludes: 'Daredevil' }),
              min: 1,
              max: null,
            },
            prune(subject()),
          ),
        ),
      ),
    ),
    trigger('opponent-character-enters-field', 'HAND', undefined, { feature: 'Human', levelAtMost: 3 }),
  );
}
