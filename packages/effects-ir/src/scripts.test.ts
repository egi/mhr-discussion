import { describe, expect, it } from 'vitest';
import { EFFECT_DESTINATION_AREAS, EFFECT_OP_KINDS, type EffectArea, type EffectOp } from './ir';
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
const NOT_AUTHORED: readonly string[] = [
  // Vocabulary added from the survey of unfinished effect texts; scripts for them come later.
  'draw-by-board-comparison',
  'flip',
  'copy-attached-effects',
];

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
  Record<string, { event: string; area: EffectArea; attacker?: object; subject?: object }>
> = {
  'BP01-002': { event: 'activate-counter', area: 'HAND' },
  'BP01-005': { event: 'attacks', area: 'HAND', attacker: { controller: 'self', color: 'red' } },
  'BP01-008': { event: 'enters-field', area: 'FIELD' },
  'BP01-010': { event: 'activate', area: 'HAND' },
  'BP01-011': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-012': { event: 'enters-field-by-call', area: 'BATTLE' },
  'BP01-015': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-017': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-018': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-020': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-014': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-022': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-023': { event: 'activate-counter', area: 'FIELD' },
  'BP01-028': { event: 'activate', area: 'HAND' },
  'BP01-030': { event: 'activate', area: 'HAND' },
  'BP01-033': { event: 'attacks', area: 'BACK', attacker: { controller: 'self', feature: 'Avengers' } },
  'BP01-035': { event: 'activate-counter', area: 'FIELD' },
  'BP01-037': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-038': { event: 'opponent-turn-starts', area: 'BATTLE' },
  'BP01-041': { event: 'attacks-weakness-successfully', area: 'BATTLE' },
  'BP01-043': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-045': { event: 'power-increases', area: 'BATTLE' },
  'BP01-047': { event: 'activate-counter', area: 'FIELD' },
  'BP01-050': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-053': { event: 'attacks', area: 'BATTLE' },
  'BP01-054': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-057': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-059': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-060': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-061': { event: 'activate-counter', area: 'HAND' },
  'SD02-017': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-063': { event: 'own-character-power-decreases', area: 'HAND' },
  'BP01-069': { event: 'activate', area: 'FIELD' },
  'BP01-077': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-073': { event: 'card-moved-to-deck-bottom', area: 'FIELD' },
  'BP01-090': { event: 'activate', area: 'HAND' },
  'BP01-093': { event: 'attacks', area: 'WING' },
  'BP01-096': { event: 'activate-counter', area: 'FIELD' },
  'BP01-048': { event: 'activate', area: 'BATTLE' },
  'BP01-051': { event: 'enters-retreat-by-call', area: 'RETREAT' },
  'BP01-052': { event: 'own-character-enters-field', area: 'HAND', subject: { levelAtLeast: 4, feature: 'Machine' } },
  'BP01-070': { event: 'own-character-enters-field', area: 'FIELD', subject: { color: 'blue' } },
  'BP01-072': { event: 'own-weakness-attacked', area: 'HAND' },
  'BP01-078': { event: 'enters-retreat-by-losing-fight', area: 'RETREAT' },
  'BP01-081': { event: 'own-character-attacked', area: 'HAND', subject: { color: 'blue' } },
  'BP01-092': { event: 'enters-retreat-from-field', area: 'RETREAT' },
  'BP01-095': { event: 'enters-retreat-by-discard-effect', area: 'RETREAT' },
  'BP01-102': { event: 'enters-retreat-from-field', area: 'RETREAT' },
  'BP01-107': { event: 'enters-retreat-by-discard-effect', area: 'RETREAT' },
  'BP01-108': { event: 'activate', area: 'FIELD' },
  'BP01-120': { event: 'enters-retreat-from-field', area: 'RETREAT' },
  'BP01-103': { event: 'base-move', area: 'FIELD' },
  'BP01-104': { event: 'enters-retreat-by-discard-effect', area: 'RETREAT' },
  'BP01-105': { event: 'attacks', area: 'FIELD', attacker: { controller: 'self' } },
  'BP01-106': { event: 'enters-field-by-call', area: 'FIELD' },
  'BP01-109': { event: 'enters-field', area: 'FIELD' },
  'BP01-112': { event: 'enters-field', area: 'FIELD' },
  'BP01-113': { event: 'opponent-character-attacks', area: 'FIELD', subject: { lane: 'BACK' } },
  'BP01-091': { event: 'opponent-set-card-in-base-increases', area: 'FIELD' },
  'BP01-099': { event: 'opponent-character-enters-field', area: 'FIELD', subject: { levelAtLeast: 4 } },
  'BP01-114': { event: 'base-move', area: 'FIELD' },
  'BP01-116': { event: 'opponent-character-attacks', area: 'FIELD', subject: { lane: 'WING' } },
  'BP01-118': { event: 'base-move', area: 'FIELD' },
  'BP01-119': { event: 'enters-retreat-by-discard-effect', area: 'RETREAT' },
  'EB01-006': { event: 'opponent-character-enters-field', area: 'BATTLE', subject: { level: 6 } },
  'EB01-007': { event: 'activate', area: 'BATTLE' },
  'EB01-009': { event: 'wins-fight', area: 'BATTLE' },
  'PB01-001': { event: 'wins-fight', area: 'BATTLE' },
  'PB01-002': { event: 'attacks', area: 'BATTLE' },
  'PB01-003': { event: 'opponent-character-enters-field-by-effect', area: 'BASE' },
  'PB01-005': { event: 'activate', area: 'HAND' },
  'PB01-007': { event: 'attacks', area: 'BATTLE' },
  'SD01-003': { event: 'own-character-r-or-power-increases', area: 'BATTLE' },
  'SD01-006': { event: 'activate', area: 'HAND' },
  'SD01-016': { event: 'activate-counter', area: 'FIELD' },
  'SP01-032': { event: 'this-card-enters-void', area: 'VOID' },
  'SP01-042': { event: 'activate', area: 'BATTLE' },
  'SD01-007': { event: 'enters-field-by-call', area: 'FIELD' },
  'SP01-001': { event: 'enters-retreat-from-field', area: 'RETREAT' },
  'SP01-006': { event: 'activate', area: 'BATTLE' },
  'SP01-031': { event: 'enters-retreat-by-losing-fight', area: 'RETREAT' },
  'SP01-022': { event: 'wins-fight-by-attacking', area: 'HAND', subject: { feature: 'Web' } },
  'SP01-023': { event: 'activate-counter', area: 'BATTLE' },
  'SP01-050': { event: 'enters-field-by-call', area: 'FIELD' },
  'SD03-001': { event: 'enters-field', area: 'FIELD' },
  'SD02-010': { event: 'enters-field-by-call', area: 'BATTLE' },
  'SD02-016': { event: 'enters-field-by-call', area: 'FIELD' },
  'SD04-002': { event: 'enters-field', area: 'FIELD' },
  'SD04-003': { event: 'enters-retreat-from-field', area: 'RETREAT' },
  'SD04-004': { event: 'activate-counter', area: 'BATTLE' },
  'SD04-014': { event: 'enters-retreat-by-discard-effect', area: 'RETREAT' },
};

/** The kinds the interpreter refuses today (everything else runs, for the restrictions and abilities it records). */
const NOT_RUNNABLE_KINDS = ['copy-attached-effects'];

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
    expect(tagged).toHaveLength(91);
    for (const [key, script] of tagged) {
      expect(script().trigger).toEqual(TAGGED[key]);
    }
  });

  it('tags only runnable scripts', () => {
    for (const [, script] of tagged) {
      const op = script().op;
      for (const kind of kindsIn(op)) expect(NOT_RUNNABLE_KINDS).not.toContain(kind);
      // A relocate to the FIELD or the BATTLE is run: the lane is the player's choice
      // (`EffectInvocation.placement`), so the destination no longer makes a script unrunnable.
      for (const area of relocateAreas(op)) expect(EFFECT_DESTINATION_AREAS).toContain(area);
    }
  });

  it('uses an area of FIELD, BATTLE, WING, BACK, BASE, HAND, RETREAT or VOID', () => {
    for (const [, script] of tagged) {
      expect(['FIELD', 'BATTLE', 'WING', 'BACK', 'BASE', 'HAND', 'RETREAT', 'VOID']).toContain(script().trigger?.area);
    }
  });
});

describe('oncePerTurn marker', () => {
  it('is set on EB01-007, BP01-023, BP01-035, BP01-045, BP01-047, BP01-069, BP01-073, BP01-105, SP01-006, SP01-023, SP01-043, SP01-062, SP01-042, SD01-003, SD01-016, BP01-096, BP01-108, BP01-113, BP01-091, BP01-048, BP01-070 and SD04-004 alone and absent (not undefined-valued) everywhere else', () => {
    for (const [cardNo, script] of Object.entries(CARD_SCRIPTS)) {
      const ir = script();
      if (
        cardNo === 'EB01-007' ||
        cardNo === 'BP01-023' ||
        cardNo === 'BP01-035' ||
        cardNo === 'BP01-045' ||
        cardNo === 'BP01-047' ||
        cardNo === 'BP01-096' ||
        cardNo === 'SD01-016' ||
        cardNo === 'SD01-003' ||
        cardNo === 'SP01-042' ||
        cardNo === 'BP01-069' ||
        cardNo === 'BP01-073' ||
        cardNo === 'BP01-105' ||
        cardNo === 'SP01-006' ||
        cardNo === 'SP01-023' ||
        cardNo === 'SP01-043' ||
        cardNo === 'SP01-062' ||
        cardNo === 'BP01-108' ||
        cardNo === 'BP01-113' ||
        cardNo === 'BP01-091' ||
        cardNo === 'BP01-048' ||
        cardNo === 'BP01-070' ||
        cardNo === 'SD04-004'
      ) {
        expect(ir.oncePerTurn).toBe(true);
      } else {
        expect('oncePerTurn' in ir).toBe(false);
      }
    }
  });
});
