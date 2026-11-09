/**
 * SP01-038, a BATTLE character that retreats itself to lower the Power of an opposing field
 * character. Only the Power-1000 part is scripted; the extra draw is not modelled.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/ONCE PER TURN】:You retreat this card on BATTLE. If you do, 1 of your opponent's
 *   characters on the field gets Power-1000 this turn. If that character is retreated by this
 *   effect, you draw 1 card extra.
 *
 * Event tag: activate, BATTLE, once per turn. This card is retreated; only if that was done does
 * one opposing field character get Power-1000 until the end of the turn (304.1.d, discussions 09
 * and 10; discussion 10 item 3 is CLOSED as USER-DECISION Reading B, the engine default, a tier
 * below a head-judge ruling). With no opposing character the retreat stays and the
 * Power step is not done.
 *
 * Not modelled: "If that character is retreated by this effect, you draw 1 card extra". The IR has
 * no condition on whether a stat change retreated its target, so the extra draw stays on the
 * manual path and the card badges partial. The player is told by that partial badge and by the
 * retained Apply effect control, which keeps the omitted extra draw reachable; the engine verdict
 * itself is unchanged.
 *
 * Partial marker: it covers the omitted "draw 1 card extra" sub-clause. The user decision of
 * UAT test 1 keeps the script; the basis is FAQ F-33 as relayed by mhrdecklab (a relayed statement,
 * not an official tier), CR 301.16.a.1 and 301.16.b. The "If you do" reading is discussion 10
 * item 3, CLOSED 2026-11-04 as USER-DECISION Reading B. The marker stays until the extra draw is
 * implemented.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  characters,
  effect,
  ifDone,
  power,
  retreat,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-038');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.1.a'), reviewedHash: 'f5fb571c54b2' }, // printed Condition (ONCE PER TURN)
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
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
      step(retreat(source())),
      ifDone(power(select('opponent', 'FIELD', characters()), -1000)),
    ),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true, partial: true },
  );
}
