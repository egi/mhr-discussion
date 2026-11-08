/**
 * SD04-009, a card that may return to the field when another effect discards it, stocking the
 * opponent's BASE.
 *
 * Printed text (official card):
 *
 *   TRIG【RETREAT】:When this card enters RETREAT by discarding of effect, you may place this card
 *   from RETREAT into your field. If you do, your opponent place the top card of their deck face
 *   down into your opponent's BASE.
 *
 * Event tag: enters-retreat-by-discard-effect, RETREAT. Which discards count as "by effect" is
 * discussion 26 (.planning/research/community-rulings/discussions/26-discard-by-effect.md,
 * RESOLVED by 301.15.a and 303.2.a.6.1.3): the End Phase hand-limit discard does not. The
 * placement is optional (304.1.a). Only if this card was placed does the opponent put the top card
 * of their own deck face down into their own BASE; a declined placement, or one that is not done,
 * skips that step. "If you do" follows Reading B (discussion 10 item 3, ESCALATE-OPEN, user
 * decision of 2026-11-03). The lane for the placement is the player's choice.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  ANY_CARD,
  effect,
  ifDone,
  optional,
  relocate,
  select,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SD04-009');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.13.a'), reviewedHash: 'ece044bdbe4a' }, // SET cards face-down
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
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
    optional(
      sequence(
        step(relocate(source(), { side: 'self', area: 'FIELD', faceDown: false })),
        ifDone(
          relocate(select('opponent', 'DECK', ANY_CARD), {
            side: 'opponent',
            area: 'BASE',
            faceDown: true,
          }),
        ),
      ),
    ),
    trigger('enters-retreat-by-discard-effect', 'RETREAT'),
  );
}
