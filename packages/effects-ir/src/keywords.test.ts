import { describe, expect, it } from 'vitest';
import { CARD_KEYWORDS, cardKeywords, keywordCardNumbers } from './keywords';

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

  it('cites the COUNTER rule with a well-formed reviewed hash and a non-empty printed line', () => {
    for (const [cardNo, list] of Object.entries(CARD_KEYWORDS)) {
      for (const entry of list) {
        expect(entry.printed.length, cardNo).toBeGreaterThan(0);
        expect(entry.rule.key, cardNo).toBe('305.1.a');
        expect(entry.rule.reviewedHash, cardNo).toMatch(/^[0-9a-f]{12}$/);
      }
    }
  });
});
