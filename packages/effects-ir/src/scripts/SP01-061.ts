/**
 * SP01-061, a Lv6 character that lands on the WING from the HAND, flips every card in BASE and
 * then keeps high-Lv characters from paying for a call this turn.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:In your turn, if you did not call a character, and the number of your set cards
 *   in BASE and the number of your characters in BASE are the same, you place this card from HAND
 *   onto your WING. If you do, you flip all your cards in BASE.
 *   TRIG【BATTLE】:When this card enters the field, you cannot retreat any of your characters with
 *   Lv5 or above to call a character this turn.
 *
 * Two clauses, in printed order (a multi-clause script, read through `scriptClauses`):
 *
 *   0  ACTI HAND   (activate, HAND)
 *   1  TRIG BATTLE (enters-field, BATTLE)
 *
 * Clause 0. "In your turn" is the activation timing itself (201.10.f.2: an Activated Effect needs
 * the Action Phase of the controller's own turn), so it is not a condition of the script. The two
 * conditions are `no-call-this-turn` and `set-equals-character-count-in-base`, nested so that the
 * card moves only when both hold; the count compares the set (face-down) cards in BASE with the
 * Characters in BASE, the English wording, which wins over the Indonesian one (discussion 07,
 * RESOLVED, head-judge: "Yg bener yg eng"). Then the card is relocated from the HAND to the WING
 * and, only if that was done (301.38.a, "If you do", Reading B), every card of the controller in
 * BASE is flipped with `flip-toggle` (user decision K8, answer A, recorded in
 * 17.5.2.1-CHECKPOINTS.md): the Characters turn face-down first and the cards that were
 * face-down when the effect started flip face-up second (301.2.a.2), a Character turned down by
 * this effect is not turned up again, and a UNIQUE Face-Down Card that the rules forbid face-up
 * stays face-down (301.22.d; the reveal is not modelled). Which BASE cards "your BASE" covers:
 * discussion 07 settles that an opponent's card placed into your BASE is a card you control, so
 * the controller reading applies (tier: RESOLVED, rulebook 301.4 and the EN card text, with
 * head-judge statements in the chat). A flipped card is not entering the field (discussion 30,
 * HEAD-JUDGE, FAQ F-11), so a flip fires no enters-field event of its own.
 *
 * Clause 1. The placement made by clause 0 is the card entering the field, so this TRIG fires
 * right after the ACTI in the same resolution (D-03, D-05). The text names the controller's
 * characters by Lv, so the restriction is the operand form of `retreat-to-call` (17.5.1.1 D-05 to
 * D-07, D-28): one entry on the controller's record naming no card, Lv5 or above by effective Lv,
 * unknown Lv failing closed, applying to characters on the field now and to those that enter
 * later this turn. The record is not relied on across a retreat-and-recall (17.5.2 D-04).
 *
 * Discussions 07 (RESOLVED) and 30 (HEAD-JUDGE) both name SP01-061; neither is OPEN or ESCALATE,
 * so the script carries no OPEN-RULING marker.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  conditional,
  effect,
  flipToggle,
  ifDone,
  relocate,
  restrict,
  selectAll,
  sequence,
  source,
  step,
  trigger,
  ANY_CARD,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-061');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.38.a'), reviewedHash: '35e8b25aa5b6' }, // "if you do" needs the earlier text resolved in full
    { key: asRuleKey('301.2.a.2'), reviewedHash: 'c561311a7cf1' }, // Characters turn face-down first, then Face-Down Cards flip face-up
    { key: asRuleKey('301.14.a.2'), reviewedHash: '65b460eb5946' }, // a Character resolving Flip a Card turns face-down
    { key: asRuleKey('301.22.c.2'), reviewedHash: '31660664ba0e' }, // a Face-Down Card resolving Flip a Card turns face-up
    { key: asRuleKey('301.22.d'), reviewedHash: '561defd4704b' }, // UNIQUE blocks the face-up flip
    { key: asRuleKey('304.1.b'), reviewedHash: '8c3ab46e7230' }, // mandatory trigger timing
    { key: asRuleKey('301.19.b'), reviewedHash: '4804fb75db07' }, // the retreat paid for a call
    { key: asRuleKey('303.2.a.6.1.2'), reviewedHash: '06effe272462' }, // this-turn effects end
  ],
  rulings: [
    { discussion: '07', rule: asRuleKey('301.22.d') },
    { discussion: '30', rule: asRuleKey('301.22.d') },
  ],
});

/** The two clauses' IR, in printed order. */
export function script(): readonly [EffectIR, EffectIR] {
  return [
    effect(
      CARD_NO,
      conditional(
        { kind: 'no-call-this-turn' },
        conditional(
          { kind: 'set-equals-character-count-in-base' },
          sequence(
            step(relocate(source(), { side: 'self', area: 'WING', faceDown: false })),
            ifDone(flipToggle(selectAll('self', 'BASE', ANY_CARD))),
          ),
        ),
      ),
      trigger('activate', 'HAND'),
    ),
    effect(
      CARD_NO,
      restrict(source(), 'retreat-to-call', { lv: 5, lane: null, direction: 'at-least' }),
      trigger('enters-field', 'BATTLE'),
    ),
  ];
}
