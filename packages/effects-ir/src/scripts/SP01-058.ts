/**
 * SP01-058, a FRONT character that mills X cards from the bottom of each deck when the opponent
 * has WING characters, and grows by X in R.
 *
 * Printed text (official card):
 *
 *   ACTI【FRONT/ONCE PER TURN】:If your opponent has the characters on WING, you discard the
 *   bottom X cards of each player's deck. If you do, this card gets R+X this turn. X is the number
 *   of your opponent's characters on WING.
 *
 * Event tag: activate, FRONT, once per turn (201.10.f.2; ONCE PER TURN is an additional
 * Condition). The condition is "the opponent has at least 1 character on WING"; without one the
 * effect does nothing. X is counted when the effect resolves (`opponent-characters-on-wing`). The
 * bottom X cards of this player's deck are discarded (301.15.a.3), then those of the opponent's
 * deck; a deck holding fewer than X cards loses what it has (304.1.d). The R+X part runs only if
 * the opponent's mill, the step before it, was done in full (Reading B, user decision 2026-11-03,
 * discussion 10 item 3), then this card gets R+X this turn (301.40.a).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { characters, conditional, effect, ifDone, sequence, source, statMod, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR, EffectOp } from '../ir';

export const CARD_NO = asCardNo('SP01-058');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect, ONCE PER TURN
    { key: asRuleKey('301.15.a.3'), reviewedHash: '9ac3aa7c9412' }, // discard from the deck
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The bottom X cards of one deck, X being the opponent's characters on WING. */
function millBottom(side: 'self' | 'opponent'): EffectOp {
  return { kind: 'mill', side, end: 'bottom', count: 1, countScale: 'opponent-characters-on-wing', disposal: 'discard' };
}

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    conditional(
      { kind: 'have', side: 'opponent', area: 'WING', filter: characters(), min: 1, max: null },
      sequence(
        step(millBottom('self')),
        step(millBottom('opponent')),
        ifDone(statMod(source(), 'r', 1, 'opponent-characters-on-wing')),
      ),
    ),
    trigger('activate', 'FRONT'),
    { oncePerTurn: true },
  );
}
