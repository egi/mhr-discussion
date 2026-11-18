/**
 * SP01-041, a character that pushes a small opposing BATTLE character back to the BASE after
 * winning a fight, and prunes it while a Machine is on the field. Its AUTO half (R-X on the
 * opposing FRONT) is registered in the engine's AUTO table; this file is the TRIG half.
 *
 * Printed text (official card), TRIG clause:
 *
 *   TRIG【BATTLE】:When this card wins the fight, you move 1 of your opponent's characters with
 *   Power4000 or lower from BATTLE to your opponent's BASE. If you do and there is a card with
 *   【Machine】 in its feature on the field, you prune that character.
 *
 * The trigger tag is `wins-fight` from the BATTLE: the winner of a fight, as attacker or as
 * defender (discussion 23, HEAD-JUDGE: a defender can win). Attacking the weakness is NOT winning
 * a fight (discussion 23, CONSENSUS), and the engine emits a different event for it, so the
 * trigger does not fire then. Discussion 23 lists `cards: []`: it is a script-condition input,
 * no card is linked to it, and this header adds no OPEN-RULING marker.
 *
 * The Power bound is a selection filter on the opposing BATTLE character (the trigger subject
 * filter has no Power field). The chosen character is bound as pick A and moved from the BATTLE
 * to the opposing BASE (301.24.b), face up. Only if the move was done ("If you do" is Reading B,
 * discussion 10 item 3, rule 301.38.a) is the field checked: a card with Machine in its feature
 * on either side's field (BATTLE or BASE, 302.1.a; the moved character in the BASE counts when
 * it is itself a Machine) makes this card prune pick A (301.17.a). The IR tests the own side
 * first, then the opposing side. With no eligible target nothing moves and nothing is pruned.
 * This script does not declare discussion 10.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  bind,
  characters,
  conditional,
  effect,
  ifDone,
  named,
  prune,
  relocate,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-041');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('303.2.a.4.3.3.1.1'), reviewedHash: 'c5cd4c5f7337' }, // the Turn Player's Character wins the fight
    { key: asRuleKey('303.2.a.4.3.3.1.2'), reviewedHash: '7a3de69bfb97' }, // the Opposing Player's Character wins the fight
    { key: asRuleKey('301.24.b'), reviewedHash: '5ebdfc22a919' }, // effect move BATTLE to BASE
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('302.1.a'), reviewedHash: 'ea63c3694178' }, // FIELD area
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  const prunePickA = prune(named('A'));
  const machine = { ...ANY_CARD, feature: 'Machine' };
  return effect(
    CARD_NO,
    sequence(
      step(
        relocate(bind(select('opponent', 'BATTLE', characters({ powerMax: 4000 })), 'A'), {
          side: 'opponent',
          area: 'BASE',
          faceDown: false,
        }),
      ),
      ifDone(
        conditional(
          { kind: 'have', side: 'self', area: 'FIELD', filter: machine, min: 1, max: null },
          prunePickA,
          conditional(
            { kind: 'have', side: 'opponent', area: 'FIELD', filter: machine, min: 1, max: null },
            prunePickA,
          ),
        ),
      ),
    ),
    trigger('wins-fight', 'BATTLE'),
  );
}
