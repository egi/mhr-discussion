/**
 * SD02-009, a Vision that lowers an opposing BATTLE character's Power and then covers itself.
 *
 * Printed text (official card):
 *
 *   ACTI【BASE/ONCE PER TURN】:1 of your opponent's characters in BATTLE gets Power-1000 in this
 *   turn. If you do, cover this card.
 *
 * Event tag: activate, BASE, once per turn (201.10.f.1). The script is the effect after the
 * activation: one opposing BATTLE character gets Power-1000 until the end of the turn; only if that
 * was done is this card covered (turned face-down in the BASE, the survey reading of "cover", see
 * the interpreter's cover note, OPEN-RULING). With no opposing BATTLE character neither step is done.
 * The "If you do" reading is the engine default Reading B (discussion 10, ESCALATE-OPEN on the
 * board; user decision of 2026-11-03).
 *
 * A target the -1000 takes to Power 0 Retreats at once (301.16.a.1, 301.16.b; discussion 10 item
 * 2) and the effect's remaining steps do not run (USER DECISION 2026-11-10, no source), so the
 * cover step is not done in that case and this card stays face-up.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, cover, effect, ifDone, power, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD02-009');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect: printed Condition (ONCE PER TURN) is an additional Condition
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
      step(power(select('opponent', 'BATTLE', characters()), -1000)),
      ifDone(cover(source())),
    ),
    trigger('activate', 'BASE'),
    { oncePerTurn: true },
  );
}
