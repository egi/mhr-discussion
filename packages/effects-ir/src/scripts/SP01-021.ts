/**
 * SP01-021, a UNIQUE card in the BASE that attaches a Web character from the HAND when a Web card
 * enters the field.
 *
 * Printed text (official card):
 *
 *   UNIQUE
 *   TRIG【BASE/ONCE PER TURN】:When your card with 【Web】 in its feature enters the field, you may
 *   attach 1 of your characters with 【Web】 in their features from HAND to 1 of the characters on
 *   the field.
 *   TRIG【VOID】:When this card enters VOID by your effect, you may place this card from VOID into
 *   your BASE.
 *
 * Event tag: own-character-enters-field narrowed to the Web feature, BASE, once per turn. A script
 * carries one trigger, so this is the first printed clause. The entry filter is an own card with
 * Web in its feature (a non-Web entry does not fire it); the attach is optional (304.1.a), takes
 * one own Web character from the HAND and puts it under a character on the field. The text says
 * "the characters on the field" without "your"; the IR selector has no either-side choice, so the
 * host is one of the player's own field characters and an opposing host is not modelled. The
 * TRIG【VOID】 clause (place this card from VOID into BASE) is not modelled and stays on the manual
 * path, so the card badges partial. UNIQUE is a rule keyword, not an effect.
 *
 * own-character-enters-field fires for characters; every card with Web in the current pool is a
 * character (checked by a test), so a non-character Web entry cannot occur today; if a
 * non-character Web card is ever printed this narrowing must be revisited.
 *
 * Ruling note: community-rulings discussion 18 (HEAD-JUDGE, 304.1.k RESOLVED, on the vendor board) lists this
 * card; it concerns HAND triggers and drawn cards, which this clause is not, so it is linked for
 * traceability only and changes nothing in the script.
 */

import { asCardNo, asRuleKey } from '@mhr/core';
import { attach, characters, effect, optional, select, trigger } from '../combinators';
import { declareRules } from '../declaration';
import type { EffectIR } from '../ir';

export const CARD_NO = asCardNo('SP01-021');

export const RULE_DECLARATION = declareRules({
  rules: [
    { key: asRuleKey('304.1.a'), reviewedHash: 'd1cde41a6928' }, // optional trigger
    { key: asRuleKey('301.25.a'), reviewedHash: 'c2f486b7c72e' }, // attached card
    { key: asRuleKey('304.1.k'), reviewedHash: '1c37c93f925c' }, // trigger timing
    { key: asRuleKey('304.1.d'), reviewedHash: '7986869359ce' }, // resolve to the greatest extent
  ],
  rulings: [{ discussion: '18', rule: asRuleKey('304.1.k') }],
});

/** The effect's IR. */
export function script(): EffectIR {
  return effect(
    CARD_NO,
    optional(
      attach(select('self', 'HAND', characters({ feature: 'Web' })), select('self', 'FIELD', characters())),
    ),
    trigger('own-character-enters-field', 'BASE', undefined, { feature: 'Web' }),
    { oncePerTurn: true },
  );
}
