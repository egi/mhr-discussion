/**
 * BP01-073, a character that grows when one of your cards goes back to the bottom of your deck.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD/ONCE PER TURN】:When you move your card back to the bottom of your deck, this
 *   card gets R+1 and Power+X000 in this turn. X is the number of your cards with 【Fantastic
 *   Four】 in their features in the field.
 *
 * The script is the effect after the trigger: this card gets R+1 and Power+1000 for each of the
 * controller's face-up cards with Fantastic Four in its features in the FIELD (the printed text
 * says "cards", so a non-character card with that feature counts too; this card counts when it
 * has the feature). The two changes are independent parts of one effect, so each is its own
 * 'always' step. "When you move your card back to the bottom of your deck" is carried by the
 * `card-moved-to-deck-bottom` trigger tag, which fires for the owner of the moved card. ONCE PER
 * TURN is the `oncePerTurn` marker on the IR, enforced by the engine.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  effect,
  scaleCount,
  sequence,
  source,
  statMod,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('BP01-073');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('301.1.a'), reviewedHash: 'f5fb571c54b2' }, // printed Condition (ONCE PER TURN)
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
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
    sequence(
      step(statMod(source(), 'r', 1), 'always'),
      step(
        scaleCount(source(), 'power', 1000, {
          side: 'self',
          area: 'FIELD',
          filter: { ...ANY_CARD, feature: 'Fantastic Four', faceDown: false },
          exceptSource: false,
        }),
        'always',
      ),
    ),
    trigger('card-moved-to-deck-bottom', 'FIELD'),
    { oncePerTurn: true },
  );
}
