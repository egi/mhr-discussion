import { describe, expect, it } from 'vitest';
import { EFFECT_OP_KINDS, type EffectOp } from './ir';
import { EffectIRSchema } from './schema';
import { CARD_SCRIPTS } from './scripts';
import { EFFECT_RULES_VERSION } from './version';

type ScriptModule = { readonly CARD_NO: string };
const modules = (
  import.meta as unknown as {
    glob(pattern: string, options: { eager: true }): Record<string, ScriptModule>;
  }
).glob('./scripts/*.ts', { eager: true });

function fileCardNo(key: string): string | undefined {
  const entry = Object.entries(modules).find(([path]) => path.endsWith(`/${key}.ts`));
  return entry?.[1].CARD_NO;
}

function kindsIn(op: EffectOp): string[] {
  switch (op.kind) {
    case 'sequence':
      return [op.kind, ...op.steps.flatMap((s) => kindsIn(s.op))];
    case 'conditional':
      return [op.kind, ...kindsIn(op.then), ...(op.otherwise ? kindsIn(op.otherwise) : [])];
    case 'optional':
      return [op.kind, ...kindsIn(op.op)];
    default:
      return [op.kind];
  }
}

/** Op kinds with no authored script, pinned so opening or closing a gap fails the test. */
const NOT_AUTHORED: readonly string[] = ['attach', 'show', 'grant-ability'];

describe('card scripts', () => {
  const entries = Object.entries(CARD_SCRIPTS);

  it.each(entries)('%s parses, names its own file and carries the current revision', (key, script) => {
    const ir = script();
    expect(EffectIRSchema.safeParse(ir).success).toBe(true);
    expect(ir.cardNo).toBe(key);
    expect(fileCardNo(key)).toBe(key);
    expect(ir.rulesVersion).toBe(EFFECT_RULES_VERSION);
  });

  it('uses only kinds from the frozen vocabulary', () => {
    const frozen = new Set<string>(EFFECT_OP_KINDS);
    for (const [, script] of entries) {
      for (const kind of kindsIn(script().op)) expect(frozen.has(kind)).toBe(true);
    }
  });

  it('authors every kind except the pinned gaps', () => {
    const used = new Set(entries.flatMap(([, script]) => kindsIn(script().op)));
    const missing = EFFECT_OP_KINDS.filter((kind) => !used.has(kind));
    expect(missing).toEqual([...NOT_AUTHORED]);
  });
});
