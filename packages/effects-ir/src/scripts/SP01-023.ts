/**
 * SP01-023 「Spider-Archenemy」Venom, a Lv3 character that prunes a Human ally to take its Power.
 *
 * Printed text (official card):
 *
 *   BLOCK
 *   TRIG【FIELD】:When you attach this card to a character with 【Knull】 in its name on the field,
 *   you retreat that character.
 *   COUNTER·ACTI【BATTLE/ONCE PER TURN】:You prune 1 of your characters with Lv3 or below and
 *   【Human】 in their features on BATTLE. If you do, this card gets Power+X this turn. X is the
 *   Power value of the character pruned by this effect.
 *
 * A script carries one effect, so this one is the COUNTER·ACTI. BLOCK is a printed keyword with
 * nothing to script. A [BLOCK] retarget changes the Attack Target in place and opens no fresh
 * Counter Step (engine reading block-retarget-refire, ESCALATE-OPEN). A re-selection after the
 * original target becomes invalid during the Counter Step returns to the Select Target Step
 * (303.2.a.4.3.2.2; FAQ F-17). Whether a fresh Counter Step then offers BLOCK again to holders
 * within R is inference (discussion 13 item 3, ESCALATE-OPEN). The TRIG that retreats a
 * Knull-named host is not scripted (a second effect on the same card): it stays with the engine
 * as an unscripted effect.
 *
 * The Human of Lv3 or below on BATTLE is chosen and pruned as pick A (`scaleFrom` keeps reading it
 * after it has left the board); only if the prune was done does this card get Power+X with X the
 * pruned Power. A missing Human leaves the card unchanged and nothing throws (304.1.d, discussions
 * 09 and 10; discussion 10 is ESCALATE-OPEN and the "If you do" reading is the engine default,
 * tier: user decision below a head-judge ruling). ONCE PER TURN is the `oncePerTurn` marker on the
 * IR. X is the effective Power the pick had when it was chosen (registered engine reading
 * `effective-power-lv-basis`, UNRULED).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  bind,
  characters,
  effect,
  ifDone,
  prune,
  scaleFrom,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-023');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.3'), reviewedHash: 'a05bc11524e4' }, // COUNTER-Activated Effect
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('301.1.a'), reviewedHash: 'f5fb571c54b2' }, // printed Condition (ONCE PER TURN)
    { key: asRuleKey('305.2.a'), reviewedHash: 'b350a4f6db4e' }, // BLOCK
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
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
      step(prune(bind(select('self', 'BATTLE', characters({ lvMax: 3, feature: 'Human' })), 'A'))),
      ifDone(scaleFrom(source(), 'power', 1, 'A', 'power')),
    ),
    trigger('activate-counter', 'BATTLE'),
    { oncePerTurn: true },
  );
}
