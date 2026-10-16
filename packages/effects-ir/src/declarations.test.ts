import { describe, expect, it } from 'vitest';
import { RuleDeclarationSchema, type RuleDeclaration } from './declaration';
import { scriptedCardNumbers } from './registry';

type DeclaredModule = { readonly RULE_DECLARATION?: RuleDeclaration };
const modules = (
  import.meta as unknown as {
    glob(pattern: string, options: { eager: true }): Record<string, DeclaredModule>;
  }
).glob('./scripts/*.ts', { eager: true });

const entries = Object.entries(modules)
  .filter(([path]) => !path.endsWith('/index.ts'))
  .map(([path, mod]) => [path.replace(/^.*\//, ''), mod] as const);

describe('rule declarations', () => {
  it.each(entries)('%s exports a schema-valid declaration with at least one rule', (_file, mod) => {
    expect(mod.RULE_DECLARATION).toBeDefined();
    const parsed = RuleDeclarationSchema.safeParse(mod.RULE_DECLARATION);
    expect(parsed.success).toBe(true);
    expect(mod.RULE_DECLARATION?.rules.length).toBeGreaterThan(0);
  });

  it.each(entries)('%s links rulings only to rules it declares', (_file, mod) => {
    const declared = new Set(mod.RULE_DECLARATION?.rules.map((r) => r.key));
    for (const link of mod.RULE_DECLARATION?.rulings ?? []) {
      expect(declared.has(link.rule)).toBe(true);
    }
  });

  it('has one declaration per manifest entry', () => {
    expect(entries.length).toBe(scriptedCardNumbers().length);
  });
});
