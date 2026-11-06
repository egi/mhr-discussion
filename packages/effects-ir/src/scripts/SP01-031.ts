/**
 * SP01-031, a UNIQUE BLOCK character that digs a Web character out of the VOID after losing.
 *
 * Printed text (official card):
 *
 *   UNIQUE BLOCK
 *   TRIG【RETREAT】:When this card enters RETREAT from BATTLE by losing the fight, you prune the
 *   top 3 cards of your deck. If you do, you place 1 of your characters with the lowest Lv and
 *   【Web】 in their features from VOID onto your BATTLE.
 *
 * The script prunes the top 3 cards of the deck and, only if that was done, places one own Web
 * character with the lowest Lv among the Web characters in the VOID onto the BATTLE (the
 * `extreme` facet; ties stay candidates and the player chooses). The prune comes first, so the
 * cards it just pruned are part of the VOID being searched. With no Web character in the VOID
 * the prune stays and the effect resolves (discussion 25). UNIQUE and BLOCK are keywords, not
 * effects, so nothing is scripted for them. A [BLOCK] retarget changes the Attack Target in place
 * and opens no fresh Counter Step (engine reading block-retarget-refire, ESCALATE-OPEN). A
 * re-selection after the original target becomes invalid during the Counter Step returns to the
 * Select Target Step (303.2.a.4.3.2.2; FAQ F-17). Whether a fresh Counter Step then offers BLOCK
 * again to holders within R is inference (discussion 13 item 3, ESCALATE-OPEN).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  mill,
  relocate,
  select,
  sequence,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-031');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
    { key: asRuleKey('303.2.a.4.3.2.2'), reviewedHash: '16c82563f537' }, // invalid target returns to selection
  ],
  rulings: [
    { discussion: '09', rule: asRuleKey('304.1.d') },
    { discussion: '10', rule: asRuleKey('304.1.d') },
    { discussion: '13', rule: asRuleKey('303.2.a.4.3.2.2') },
  ],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(mill('self', 'top', 3, 'prune')),
      ifDone(
        relocate(
          select(
            'self',
            'VOID',
            characters({ feature: 'Web', extreme: { stat: 'lv', which: 'lowest' } }),
          ),
          { side: 'self', area: 'BATTLE', faceDown: false },
        ),
      ),
    ),
    trigger('enters-retreat-by-losing-fight', 'RETREAT'),
  );
}
