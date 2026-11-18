/**
 * SP01-011, a BATTLE character that discards X cards from the HAND to grow by X in Lv and R and by
 * X000 in Power.
 *
 * Printed text (official card):
 *
 *   ACTI【BATTLE/ONCE PER TURN】:You discard X of your cards in HAND. If you do, this card gets
 *   Lv+X, R+X and Power+X000 this turn. X is the number of your opponent's characters on BATTLE.
 *
 * Event tag: activate, BATTLE, once per turn (201.10.f.2; ONCE PER TURN is an additional
 * Condition). X is counted when the effect resolves (`opponent-characters-in-battle`). The first
 * step discards X cards from the HAND (301.15.a.2): the count is the scale source times 1, and an
 * X of 0 selects nothing, so nothing is discarded and nothing is gained. The discard must be done
 * in full for the second part to run (Reading B, user decision 2026-11-03, discussion 10 item 3):
 * with fewer than X cards in the HAND the discard is partial and this card gets no bonus. Then
 * this card gets Lv+X, R+X and Power+X000 this turn (301.40.a), three stat changes each scaled by
 * the same X.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, discard, effect, ifDone, select, sequence, source, statMod, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-011');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect, ONCE PER TURN
    { key: asRuleKey('301.15.a.2'), reviewedHash: '7ff4da381ca1' }, // discard from HAND
    { key: asRuleKey('301.40.a'), reviewedHash: 'a6bcd3ba3fa8' }, // Lv/R/Power +-X effects
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  const handCards = {
    ...select('self', 'HAND', ANY_CARD),
    countScale: 'opponent-characters-in-battle',
  } as ReturnType<typeof select>;
  return effect(
    CARD_NO,
    sequence(
      step(discard(handCards)),
      ifDone(statMod(source(), 'lv', 1, 'opponent-characters-in-battle')),
      ifDone(statMod(source(), 'r', 1, 'opponent-characters-in-battle')),
      ifDone(statMod(source(), 'power', 1000, 'opponent-characters-in-battle')),
    ),
    trigger('activate', 'BATTLE'),
    { oncePerTurn: true },
  );
}
