import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CARD_KEYWORDS, cardKeywords, keywordCardNumbers } from './keywords';

type SnapshotEntry = { readonly ruleKey: string; readonly textHash: string };
const snapshot = JSON.parse(
  readFileSync(resolve(import.meta.dirname, '../../../rules/rule-key-snapshot.json'), 'utf8'),
) as readonly SnapshotEntry[];
const hashOf = new Map(snapshot.map((entry) => [entry.ruleKey, entry.textHash]));

describe('printed keyword declarations', () => {
  it('lists card numbers in order', () => {
    const keys = Object.keys(CARD_KEYWORDS);
    expect(keys).toEqual([...keys].sort());
  });

  it('declares COUNTER from the HAND for exactly the six keyword-only cards', () => {
    expect(keywordCardNumbers('COUNTER', 'HAND')).toEqual([
      'BP01-083',
      'EB01-011',
      'SD01-011',
      'SD02-004',
      'SD03-014',
      'SD04-010',
    ]);
  });

  it('answers an empty list, without throwing, for any other card', () => {
    expect(cardKeywords('BP01-005')).toEqual([]);
    expect(cardKeywords('XX99-999')).toEqual([]);
  });

  it('cites a rule whose reviewed hash is the current text hash', () => {
    for (const [cardNo, list] of Object.entries(CARD_KEYWORDS)) {
      for (const entry of list) {
        expect(entry.printed.length, cardNo).toBeGreaterThan(0);
        expect(hashOf.get(entry.rule.key), `${cardNo} ${entry.rule.key}`).toBe(entry.rule.reviewedHash);
      }
    }
  });
});
