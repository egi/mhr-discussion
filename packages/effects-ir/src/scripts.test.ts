import { describe, expect, it } from 'vitest';
import { EFFECT_OP_KINDS, type EffectArea, type EffectOp } from './ir';
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
const NOT_AUTHORED: readonly string[] = ['show'];

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

/** Every tagged script with the Effect Location printed in its header (201.10.d.2). */
const TAGGED: Readonly<
  Record<string, { event: string; area: EffectArea; attacker?: object }>
> = {
  'BP01-002': { event: 'activate-counter', area: 'HAND' },
  'BP01-005': { event: 'attacks', area: 'HAND', attacker: { controller: 'self', color: 'red' } },
  'BP01-008': { event: 'enters-field', area: 'FIELD' },
  'BP01-010': { event: 'activate', area: 'HAND' },
  'BP01-012': { event: 'enters-field-by-call', area: 'BATTLE' },
  'BP01-015': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-017': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-018': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-020': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-014': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-028': { event: 'activate', area: 'HAND' },
  'BP01-030': { event: 'activate', area: 'HAND' },
  'BP01-053': { event: 'attacks', area: 'BATTLE' },
  'BP01-060': { event: 'enters-field-by-call', area: 'FIELD' },
  'SD02-017': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-077': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-106': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-109': { event: 'enters-field', area: 'FIELD' },
  'BP01-112': { event: 'enters-field', area: 'FIELD' },
  'BP01-114': { event: 'base-move', area: 'FIELD' },
  'BP01-118': { event: 'base-move', area: 'FIELD' },
  'SD01-007': { event: 'enters-field-by-call', area: 'FIELD' },
  'SD02-010': { event: 'enters-field-by-call', area: 'BATTLE' },
  'SD04-002': { event: 'enters-field', area: 'FIELD' },
};

const NOT_RUNNABLE_KINDS = ['restrict', 'grant-ability', 'cover', 'swap', 'battle-move', 'dig'];

function relocateAreas(op: EffectOp): string[] {
  switch (op.kind) {
    case 'sequence':
      return op.steps.flatMap((s) => relocateAreas(s.op));
    case 'conditional':
      return [...relocateAreas(op.then), ...(op.otherwise ? relocateAreas(op.otherwise) : [])];
    case 'optional':
      return relocateAreas(op.op);
    case 'relocate':
      return [op.to.area];
    default:
      return [];
  }
}

describe('trigger tags', () => {
  const entries = Object.entries(CARD_SCRIPTS);
  const tagged = entries.filter(([, script]) => script().trigger !== undefined);

  it('tags exactly the pinned scripts, with the pinned event and area', () => {
    expect(tagged.map(([key]) => key).sort()).toEqual(Object.keys(TAGGED).sort());
    expect(tagged).toHaveLength(24);
    for (const [key, script] of tagged) {
      expect(script().trigger).toEqual(TAGGED[key]);
    }
  });

  it('tags only runnable scripts', () => {
    for (const [, script] of tagged) {
      const op = script().op;
      for (const kind of kindsIn(op)) expect(NOT_RUNNABLE_KINDS).not.toContain(kind);
      for (const area of relocateAreas(op)) expect(['FIELD', 'BATTLE']).not.toContain(area);
    }
  });

  it('uses an area of FIELD, BATTLE or HAND', () => {
    for (const [, script] of tagged) {
      expect(['FIELD', 'BATTLE', 'HAND']).toContain(script().trigger?.area);
    }
  });
});
