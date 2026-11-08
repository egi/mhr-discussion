/**
 * SD01-005, a Lv3 red Asgard character that turns a pair of red BASE cards into a draw when it is
 * called.
 *
 * Printed text (official card):
 *
 *   TRIG【FIELD】: When this card enters the field by calling, you may retreat 2 of your cards in
 *   BASE. If you do and the cards retreated by this effect are red, you draw 2 cards.
 *
 * Event tag: enters-field-by-call, FIELD. The script is optional (the player takes it by running
 * the activation): 2 of the player's own BASE cards are retreated, and only if that was done the
 * player draws 2 cards. Resolving to the greatest extent possible is 304.1.d (discussion 24,
 * HEAD-JUDGE principle); the engine reading of "If you do" is Reading B (discussion 10 item 3,
 * ESCALATE-OPEN, user decision of 2026-11-03).
 *
 * PROVISIONAL (user decision D-07, D-09). The survey label "11 O3" resolves, through the
 * community-rulings imports.md, to chat-source discussions 32 and 28. Both are cited by path and
 * tier only; neither is on the pinned vendor board, so no rulings link is encoded:
 *
 * - community-rulings/discussions/32-attachments-follow-the-host.md: HEAD-JUDGE (FAQ F-37). It
 *   does not govern this clause.
 * - community-rulings/discussions/28-face-down-cards-effects-and-costs.md: whether a set
 *   (face-down) card counts as red for a "retreat 2 red cards" cost is ESCALATE-OPEN (rules 301.21
 *   and 301.26 are silent on colour). That discussion never names this card; the link from
 *   SD01-005 to it is an unconfirmed inference (28, "What I need from you"), not a ruling.
 *
 * OPEN READING (no ruling tier): "the cards retreated by this effect are red" is read as ALL
 * retreated cards being red. No ruling or rule text fixes whether all, either or both is meant.
 * The IR has no condition on the colour of the retreated cards, so the reading is modelled by
 * restricting the retreat to red cards: the script retreats 2 red BASE cards and then draws 2. The
 * choice of retreating a non-red pair (which draws nothing) is not modelled; it stays on the
 * manual path. Whether a face-down BASE card is red is not implemented as settled: the retreat
 * filter reads the card facts of face-up cards only. Printed Lv, Power and colour are used
 * (effective-power-lv-basis is UNRULED).
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { colored, draw, effect, ifDone, optional, retreat, select, sequence, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD01-005');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.16.a'), reviewedHash: '72a1ab425b37' }, // retreat
    { key: asRuleKey('302.13.b'), reviewedHash: 'f4fd473858f6' }, // draw
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      sequence(
        step(retreat(select('self', 'BASE', { ...colored('red'), characterOnly: false }, 2))),
        ifDone(draw('self', 2)),
      ),
    ),
    trigger('enters-field-by-call', 'FIELD'),
  );
}
