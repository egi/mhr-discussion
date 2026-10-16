import { asRuleKey } from '@mhr/core';
import { describe, expect, it } from 'vitest';
import * as barrel from './index';
import { declareRules, RuleDeclarationSchema } from './declaration';

const valid = {
  rules: [{ key: asRuleKey('301.18.b'), reviewedHash: '0123456789ab' }],
  rulings: [],
};

describe('RuleDeclaration', () => {
  it('declareRules returns its argument', () => {
    expect(declareRules(valid)).toBe(valid);
  });

  it('accepts a valid declaration', () => {
    expect(RuleDeclarationSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts an empty rules list', () => {
    expect(RuleDeclarationSchema.safeParse({ rules: [], rulings: [] }).success).toBe(true);
  });

  it('accepts a ruling whose rule is not declared', () => {
    const value = { ...valid, rulings: [{ discussion: '05', rule: '999.1' }] };
    expect(RuleDeclarationSchema.safeParse(value).success).toBe(true);
  });

  it('rejects a bad hash', () => {
    for (const reviewedHash of ['ABCDEF012345', '0123', '0123456789abc', 'zzzzzzzzzzzz']) {
      const value = { ...valid, rules: [{ key: '301.18.b', reviewedHash }] };
      expect(RuleDeclarationSchema.safeParse(value).success).toBe(false);
    }
  });

  it('rejects a bad discussion id', () => {
    for (const discussion of ['5', '005', 'ab']) {
      const value = { ...valid, rulings: [{ discussion, rule: '301.18.b' }] };
      expect(RuleDeclarationSchema.safeParse(value).success).toBe(false);
    }
  });

  it('rejects an empty key', () => {
    const value = { ...valid, rules: [{ key: '', reviewedHash: '0123456789ab' }] };
    expect(RuleDeclarationSchema.safeParse(value).success).toBe(false);
  });

  it('rejects duplicate keys', () => {
    const rule = { key: '301.18.b', reviewedHash: '0123456789ab' };
    expect(RuleDeclarationSchema.safeParse({ rules: [rule, rule], rulings: [] }).success).toBe(
      false,
    );
  });

  it('rejects unknown properties', () => {
    expect(RuleDeclarationSchema.safeParse({ ...valid, status: 'RESOLVED' }).success).toBe(false);
    const rule = { key: '301.18.b', reviewedHash: '0123456789ab', text: 'x' };
    expect(RuleDeclarationSchema.safeParse({ rules: [rule], rulings: [] }).success).toBe(false);
  });

  it('is exported from the package barrel', () => {
    expect(typeof barrel.declareRules).toBe('function');
  });
});
