/**
 * PB01-003, a Star-Lord that sends an opposing character back to the bottom of its deck at the
 * price of itself.
 *
 * Printed text (official card):
 *
 *   UNIQUE(AUTO【FIELD】:You cannot have another card with the same name as this card on the
 *   field. This effect cannot be lost.)
 *   TRIG【BASE】:When your opponent's character enters the field by effect, you may prune this
 *   card in BASE. If you do, you move that character back to the bottom of your opponent's deck.
 *
 * The UNIQUE line is the keyword ability (305.6.a), not a scripted clause. The trigger tag is
 * `opponent-character-enters-field-by-effect` from the BASE: it fires for an opposing character
 * that enters the field because of an effect, not for a call, not for an own entry, and not for
 * a face-down card turned face up (discussion 30, HEAD-JUDGE via FAQ F-11: a flip is not
 * placing, and it moves no card between areas, so no entry event exists for it). The prune is
 * optional (304.1.a). Only if it was done does the entering character (the fire's subject) go
 * face down to the bottom of its owner's deck (301.3.c); if that character has already left the
 * field the prune stays and the effect resolves as far as it can (304.1.d). "If you do" is
 * Reading B (discussion 10 item 3, rule 301.38.a); this script does not declare discussion 10.
 *
 * Rulings (tiers read from the status marks): discussion 30 is HEAD-JUDGE. Discussion 42
 * (CONSENSUS, trusted members) says Star-Lord can return a card Kingpin called, which this
 * script allows because a card placed by an effect enters by effect; the vendor pack carries no
 * file for 42, so it is cited here and not declared.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { effect, ifDone, optional, prune, relocate, sequence, source, step, subject, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('PB01-003');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.17.a'), reviewedHash: '3200ad9250ee' }, // prune places the card into VOID
    { key: asRuleKey('301.3.c'), reviewedHash: '2914f553b53d' }, // a card returned to the Deck goes to its owner's Deck
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // [After doing so] needs the earlier text in full
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
    { key: asRuleKey('305.6.a'), reviewedHash: 'bd86e15d7866' }, // the UNIQUE ability
    { key: asRuleKey('301.22.d'), reviewedHash: '561defd4704b' }, // a flip face-up restricted by UNIQUE (the rule behind discussion 30)
  ],
  rulings: [{ discussion: '30', rule: asRuleKey('301.22.d') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(prune(source())),
        ifDone(relocate(subject(), { side: 'opponent', area: 'DECK-BOTTOM', faceDown: true })),
      ),
    ),
    trigger('opponent-character-enters-field-by-effect', 'BASE'),
  );
}
