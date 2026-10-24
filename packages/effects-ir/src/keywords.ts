/**
 * Printed keyword abilities that are a fact about a card, not an effect to resolve.
 *
 * The printed line "COUNTER(AUTO【HAND】: This card may be called in COUNTER PHASE or COUNTER
 * STEP.)" gives the card the COUNTER ability (305.1.a): it may be called with a COUNTER CALL
 * from the HAND (303.2.a.4.3.2.3.1, 303.2.a.5.2.1). Nothing resolves, so the IR has no op for
 * it; the fact is data here instead, and the engine reads it to decide which hand cards may be
 * counter-called. Not every hand character carries it.
 *
 * This table is declarative and loads without the script registry, so the engine can read it
 * from its first load. BP01-100 and SD03-001 print the same COUNTER line beside a trigger line;
 * they join this table when their trigger line is scripted.
 *
 * A declaration holds keys, hashes and the printed keyword line only; the engine test compares
 * the printed line with the card mirror, so the table cannot drift from the card text.
 */

import { asRuleKey } from '@mhr/core';
import type { RuleKey } from '@mhr/core';

/** The keyword abilities declared as data. */
export type KeywordAbility = 'COUNTER';

export type KeywordDeclaration = {
  readonly ability: KeywordAbility;
  /** The area the card must stand in for the ability to apply. */
  readonly area: 'HAND';
  /** The printed keyword line the declaration is read from. */
  readonly printed: string;
  /** The rule that defines the ability, with the hash of the text a human last reviewed. */
  readonly rule: { readonly key: RuleKey; readonly reviewedHash: string };
};

const COUNTER_FROM_HAND_LINE =
  'COUNTER(AUTO【HAND】: This card may be called in COUNTER PHASE or COUNTER STEP.)';

/** 305.1.a: the effect of [COUNTER]. */
const COUNTER_RULE = { key: asRuleKey('305.1.a'), reviewedHash: '20e318b40744' } as const;

const counterFromHand = (printed: string): KeywordDeclaration => ({
  ability: 'COUNTER',
  area: 'HAND',
  printed,
  rule: COUNTER_RULE,
});

/**
 * The card numbers whose text is only the keyword line, or whose bare COUNTER keyword is read as
 * the default 305.1.a effect (EB01-011, user-confirmed 2026-10-24), in card-number order.
 */
export const CARD_KEYWORDS: Readonly<Record<string, readonly KeywordDeclaration[]>> = {
  'BP01-083': [counterFromHand(COUNTER_FROM_HAND_LINE)],
  'EB01-011': [counterFromHand('COUNTER')],
  'SD01-011': [counterFromHand(COUNTER_FROM_HAND_LINE)],
  'SD02-004': [counterFromHand(COUNTER_FROM_HAND_LINE)],
  'SD03-014': [counterFromHand(COUNTER_FROM_HAND_LINE)],
  'SD04-010': [counterFromHand(COUNTER_FROM_HAND_LINE)],
};

/** The keyword abilities a card is declared to carry; an empty list for any other card. */
export function cardKeywords(cardNo: string): readonly KeywordDeclaration[] {
  return CARD_KEYWORDS[cardNo] ?? [];
}

/** Every card number declared with `ability` in `area`, in card-number order. */
export function keywordCardNumbers(ability: KeywordAbility, area: 'HAND'): readonly string[] {
  return Object.entries(CARD_KEYWORDS)
    .filter(([, list]) => list.some((entry) => entry.ability === ability && entry.area === area))
    .map(([cardNo]) => cardNo);
}
