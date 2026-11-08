/**
 * PB01-009, a Lv6 Human that joins the field from the HAND by retreating six cards of the BASE.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:You retreat 6 of your cards in BASE. If you do, you place this card from HAND
 *   into your field.
 *
 * An activation from the HAND. Six of the player's own BASE cards (any card, face up or face
 * down) are retreated; only if that was done is this card placed face up into the field, the
 * lane or the BASE being the player's placement choice. With fewer than six cards in the BASE
 * the engine retreats the cards it can (304.1.d) but the retreat of six is not fully done, so this
 * card stays in the HAND (the engine reading of "If you do" is
 * Reading B, discussion 10 item 3, ESCALATE-OPEN, tier: user decision of 2026-11-03/04 below a
 * head-judge ruling; resolving to the greatest extent is 304.1.d, discussion 09 RESOLVED and
 * discussion 24 HEAD-JUDGE principle). No ruling is specific to this card.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { ANY_CARD, effect, ifDone, relocate, retreat, select, sequence, source, step, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('PB01-009');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.2.a'), reviewedHash: '27e81bd820cf' }, // activated effect resolves immediately
    { key: asRuleKey('301.16.a'), reviewedHash: '72a1ab425b37' }, // retreat
    { key: asRuleKey('301.12.a'), reviewedHash: 'dadfa25956d9' }, // place face-up
    { key: asRuleKey('302.1.a'), reviewedHash: 'ea63c3694178' }, // FIELD area
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(retreat(select('self', 'BASE', ANY_CARD, 6))),
      ifDone(relocate(source(), { side: 'self', area: 'FIELD', faceDown: false })),
    ),
    trigger('activate', 'HAND'),
  );
}
