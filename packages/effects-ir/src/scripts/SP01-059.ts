/**
 * SP01-059, a card that attaches itself from the HAND to a Human character on the field and gives
 * that character Power+1000.
 *
 * Printed text (official card):
 *
 *   ACTI【HAND】:You attach this card from HAND to 1 of the characters with 【Human】 in their
 *   features on the field. If you do, that character gets Power+1000 this turn.
 *   TRIG【BATTLE】:When your turn ends, if the character this card is attached to did not attack
 *   this turn, you prune that character.
 *
 * Event tag: activate, HAND. A script carries one clause, so this is the first printed clause
 * (ACTI): this card is stacked under one Human character (301.25.a) and, only if that was done,
 * the host gets Power+1000 this turn. The text has no "your", so the host is any Human character
 * on the field, own or opposing (selectEitherSide); the attached card then sits on the host's
 * seat. With no legal host the activation is not done and the card stays in the HAND. The
 * TRIG【BATTLE】 turn-end prune of a host that did not attack is not modelled and stays on the
 * manual path, so the card badges partial. The community discussion 32 (attachments follow the
 * host) is cited by path only: .planning/research/community-rulings/discussions/32-*.md.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import {
  attach,
  characters,
  effect,
  hostOfSource,
  ifDone,
  power,
  selectEitherSide,
  sequence,
  source,
  step,
  trigger,
} from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-059');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('201.10.f.2'), reviewedHash: 'cd3f45d43dbb' }, // activated effect
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    sequence(
      step(attach(source(), selectEitherSide('FIELD', characters({ feature: 'Human' })))),
      ifDone(power(hostOfSource(), 1000)),
    ),
    trigger('activate', 'HAND'),
  );
}
