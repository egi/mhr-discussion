import { describe, expect, it } from 'vitest';
import { asCardNo } from '@mhr/core';
import {
  EFFECT_CONDITION_KINDS,
  EFFECT_FILTER_FACETS,
  EFFECT_OP_KINDS,
  EFFECT_RESTRICTIONS,
  EFFECT_SCALE_SOURCES,
  EFFECT_TARGET_KINDS,
  EFFECT_TRIGGER_EVENTS,
  type EffectCondition,
  type EffectFilter, type EffectIR, type EffectOp, type EffectTarget } from './ir';
import { EffectIRSchema, type EffectIR as WireEffectIR } from './schema';

const NO_FILTER: EffectFilter = {
  color: null,
  lvMin: null,
  lvMax: null,
  powerMin: null,
  powerMax: null,
  feature: null,
  characterOnly: true,
  faceDown: null,
  exceptSource: false,
};

const SOURCE: EffectTarget = { kind: 'source' };
const OPPONENT_BATTLE: EffectTarget = {
  kind: 'selected',
  side: 'opponent',
  area: 'BATTLE',
  count: 1,
  upTo: false,
  filter: { ...NO_FILTER, lvMax: 3 },
};
const OWN_HAND: EffectTarget = {
  kind: 'selected',
  side: 'self',
  area: 'HAND',
  count: 1,
  upTo: false,
  filter: { ...NO_FILTER, characterOnly: false },
};

const DRAW_ONE: EffectOp = { kind: 'draw', side: 'self', count: 1 };

/** One valid literal per kind. Typed as a record so a new kind without a fixture will not compile. */
const VALID: Readonly<Record<EffectOp['kind'], EffectOp>> = {
  'stat-mod': {
    kind: 'stat-mod',
    target: OPPONENT_BATTLE,
    stat: 'power',
    delta: -1000,
    scaleBy: 'none',
    duration: 'this-turn',
  },
  'stat-set': { kind: 'stat-set', target: OPPONENT_BATTLE, stat: 'r', value: 2, duration: 'this-turn' },
  draw: DRAW_ONE,
  discard: { kind: 'discard', target: OWN_HAND },
  mill: { kind: 'mill', side: 'self', end: 'top', count: 2, disposal: 'discard' },
  prune: { kind: 'prune', target: OPPONENT_BATTLE },
  retreat: { kind: 'retreat', target: OPPONENT_BATTLE },
  relocate: {
    kind: 'relocate',
    target: OPPONENT_BATTLE,
    to: { side: 'opponent', area: 'BASE', faceDown: false },
  },
  attach: { kind: 'attach', card: SOURCE, host: OPPONENT_BATTLE },
  cover: { kind: 'cover', target: SOURCE },
  swap: { kind: 'swap', a: SOURCE, b: { kind: 'subject' } },
  dig: { kind: 'dig', side: 'self', count: 3, pick: { ...NO_FILTER, feature: 'Human' }, rest: 'discard' },
  show: { kind: 'show', target: OWN_HAND },
  'battle-move': { kind: 'battle-move', target: SOURCE },
  restrict: { kind: 'restrict', target: OPPONENT_BATTLE, restriction: 'move', duration: 'this-turn' },
  'grant-ability': {
    kind: 'grant-ability',
    target: SOURCE,
    ability: 'DOUBLE ATTACK',
    duration: 'this-turn',
  },
  sequence: {
    kind: 'sequence',
    steps: [
      { gate: 'always', op: { kind: 'discard', target: OWN_HAND } },
      { gate: 'if-done', op: DRAW_ONE },
    ],
  },
  conditional: {
    kind: 'conditional',
    condition: { kind: 'have', side: 'self', area: 'BASE', filter: NO_FILTER, min: 0, max: 0 },
    then: DRAW_ONE,
    otherwise: { kind: 'discard', target: OWN_HAND },
  },
  optional: { kind: 'optional', op: DRAW_ONE },
  'retreat-attached-of-host': {
    kind: 'retreat-attached-of-host',
    host: { kind: 'host-of-source' },
    scope: 'all',
    exceptSource: true,
  },
  'rearrange-deck-top': { kind: 'rearrange-deck-top', side: 'self', count: 3 },
  'draw-by-board-comparison': { kind: 'draw-by-board-comparison', count: 1 },
  flip: { kind: 'flip', target: OWN_HAND, faceDown: false },
  'retarget-attack': { kind: 'retarget-attack', target: OPPONENT_BATTLE },
  'skip-phase': { kind: 'skip-phase', phase: 'battle', duration: 'this-turn' },
  'grant-second-chance-attack': {
    kind: 'grant-second-chance-attack',
    target: SOURCE,
    duration: 'this-turn',
  },
  'copy-attached-effects': { kind: 'copy-attached-effects', target: SOURCE, duration: 'this-turn' },
};

const wrap = (op: unknown): unknown => ({ cardNo: 'BP01-001', rulesVersion: '1.0', op });

/** An op with one unexpected key added at its top level. */
const withExtraKey = (op: EffectOp): unknown => ({ ...op, surplus: true });

describe('EffectIRSchema, accepting', () => {
  it.each(EFFECT_OP_KINDS)('accepts a valid %s', (kind) => {
    const parsed = EffectIRSchema.parse(wrap(VALID[kind]));
    expect(parsed.op).toEqual(VALID[kind]);
  });

  it('accepts every kind nested under optional, conditional and sequence', () => {
    for (const kind of EFFECT_OP_KINDS) {
      const inner = VALID[kind];
      expect(() => EffectIRSchema.parse(wrap({ kind: 'optional', op: inner }))).not.toThrow();
      expect(() =>
        EffectIRSchema.parse(wrap({ kind: 'sequence', steps: [{ gate: 'always', op: inner }] })),
      ).not.toThrow();
    }
  });

  it('accepts a conditional with no otherwise branch', () => {
    const op: EffectOp = {
      kind: 'conditional',
      condition: { kind: 'source-did-not-attack' },
      then: DRAW_ONE,
      otherwise: null,
    };
    expect(() => EffectIRSchema.parse(wrap(op))).not.toThrow();
  });
});

describe('EffectIRSchema, rejecting', () => {
  it.each(EFFECT_OP_KINDS)('rejects a %s carrying an unexpected key', (kind) => {
    expect(() => EffectIRSchema.parse(wrap(withExtraKey(VALID[kind])))).toThrow();
  });

  it.each(EFFECT_OP_KINDS)('rejects a %s missing a required field', (kind) => {
    const fields = { ...(VALID[kind] as Record<string, unknown>) };
    const names = Object.keys(fields).filter((name) => name !== 'kind');
    expect(names.length).toBeGreaterThan(0);
    delete fields[names[0] as string];
    expect(() => EffectIRSchema.parse(wrap(fields))).toThrow();
  });

  it('rejects an own __proto__ key at the top level, in a target and in a nested op', () => {
    const top = JSON.parse(
      '{"cardNo":"BP01-001","rulesVersion":"1.0","op":{"kind":"draw","side":"self","count":1},"__proto__":{"polluted":true}}',
    );
    expect(() => EffectIRSchema.parse(top)).toThrow();

    const inTarget = wrap({
      kind: 'cover',
      target: JSON.parse('{"kind":"source","__proto__":{"polluted":true}}'),
    });
    expect(() => EffectIRSchema.parse(inTarget)).toThrow();

    const nested = wrap({
      kind: 'optional',
      op: JSON.parse('{"kind":"draw","side":"self","count":1,"constructor":{"x":1}}'),
    });
    expect(() => EffectIRSchema.parse(nested)).toThrow();
    expect(({} as Record<string, unknown>)['polluted']).toBeUndefined();
  });

  it('rejects a kind outside the vocabulary and a card-name field', () => {
    expect(() => EffectIRSchema.parse(wrap({ kind: 'teleport', target: SOURCE }))).toThrow();
    expect(() =>
      EffectIRSchema.parse(wrap({ ...VALID['prune'], cardName: 'Test Hero' })),
    ).toThrow();
    expect(() =>
      EffectIRSchema.parse(
        wrap({ kind: 'prune', target: { ...OPPONENT_BATTLE, filter: { ...NO_FILTER, name: 'Test Hero' } } }),
      ),
    ).toThrow();
  });

  it('rejects an unnamed ability, a bad duration, an empty sequence and a blank rulesVersion', () => {
    expect(() =>
      EffectIRSchema.parse(wrap({ ...VALID['grant-ability'], ability: 'FLY' })),
    ).toThrow();
    expect(() =>
      EffectIRSchema.parse(wrap({ ...VALID['stat-mod'], duration: 'permanent' })),
    ).toThrow();
    expect(() => EffectIRSchema.parse(wrap({ kind: 'sequence', steps: [] }))).toThrow();
    expect(() =>
      EffectIRSchema.parse({ cardNo: 'BP01-001', rulesVersion: '', op: VALID['draw'] }),
    ).toThrow();
    expect(() =>
      EffectIRSchema.parse({ cardNo: 'not a card', rulesVersion: '1.0', op: VALID['draw'] }),
    ).toThrow();
  });
});

describe('the schema and the IR types agree', () => {
  it('assigns in both directions', () => {
    const ir: EffectIR = { cardNo: asCardNo('BP01-001'), rulesVersion: '1.0', op: VALID['sequence'] };
    const wire: WireEffectIR = ir;
    const back: EffectIR = wire;
    expect(EffectIRSchema.parse(back)).toEqual(ir);
  });
});

describe('the optional trigger tag', () => {
  const base = { cardNo: 'BP01-001', rulesVersion: '1.0', op: VALID['draw'] };

  it('parses an IR with no trigger key', () => {
    expect(EffectIRSchema.safeParse(base).success).toBe(true);
  });

  it('accepts a known event and area', () => {
    const ir = { ...base, trigger: { event: 'enters-field-by-call', area: 'FIELD' } };
    expect(EffectIRSchema.safeParse(ir).success).toBe(true);
  });

  it('rejects an unknown event, an extra key, or an unknown area', () => {
    const bad = [
      { event: 'nope', area: 'FIELD' },
      { event: 'attacks', area: 'FIELD', extra: 1 },
      { event: 'attacks', area: 'MOON' },
    ];
    for (const trigger of bad) {
      expect(EffectIRSchema.safeParse({ ...base, trigger }).success).toBe(false);
    }
  });

  it('keeps the event table append-only', () => {
    expect([...EFFECT_TRIGGER_EVENTS].slice(0, 6)).toEqual([
      'enters-field-by-call',
      'enters-field',
      'attacks',
      'base-move',
      'activate',
      'activate-counter',
    ]);
  });

  it('names every surveyed event after the first six, once each', () => {
    const appended = [...EFFECT_TRIGGER_EVENTS].slice(6);
    expect(new Set(appended).size).toBe(appended.length);
    for (const name of [
      'enters-retreat-from-field',
      'enters-retreat-by-losing-fight',
      'enters-retreat-by-discard-effect',
      'wins-fight',
      'is-attacked',
      'turn-starts',
      'turn-ends',
      'this-card-attached',
      'follows-host-to-retreat',
      'opponent-character-enters-field',
    ]) {
      expect(appended).toContain(name);
    }
  });

  it('accepts an appended event and rejects an unknown tag', () => {
    const base = { cardNo: 'BP01-033', rulesVersion: '1.03', op: VALID['draw'] };
    const tag = (event: string): unknown => ({ ...base, trigger: { event, area: 'HAND' } });
    expect(EffectIRSchema.safeParse(tag('turn-ends')).success).toBe(true);
    expect(EffectIRSchema.safeParse(tag('turn-ended')).success).toBe(false);
  });

  it('accepts a subject filter on a seat event only', () => {
    const base = { cardNo: 'BP01-033', rulesVersion: '1.03', op: VALID['draw'] };
    const subject = { color: 'blue', levelAtLeast: 4 };
    const withTag = (event: string): unknown => ({
      ...base,
      trigger: { event, area: 'HAND', subject },
    });
    expect(EffectIRSchema.safeParse(withTag('opponent-character-enters-field')).success).toBe(true);
    expect(EffectIRSchema.safeParse(withTag('attacks')).success).toBe(false);
    expect(EffectIRSchema.safeParse(withTag('activate')).success).toBe(false);
  });
});

describe('the optional attacker feature filter', () => {
  const base = {
    cardNo: 'BP01-033',
    rulesVersion: '1.03',
    op: VALID['draw'],
  };
  const withTrigger = (trigger: Record<string, unknown>): unknown => ({ ...base, trigger });

  it('accepts a feature on an attacks trigger and keeps it', () => {
    const parsed = EffectIRSchema.safeParse(
      withTrigger({ event: 'attacks', area: 'BACK', attacker: { controller: 'self', feature: 'Avengers' } }),
    );
    expect(parsed.success).toBe(true);
    expect(JSON.stringify(parsed.data)).toContain('"feature":"Avengers"');
  });

  it('reads a filter with no feature as before', () => {
    const parsed = EffectIRSchema.safeParse(
      withTrigger({ event: 'attacks', area: 'HAND', attacker: { controller: 'self', color: 'red' } }),
    );
    expect(parsed.success).toBe(true);
    expect(JSON.stringify(parsed.data)).not.toContain('feature');
  });

  it('rejects an empty feature and an attacker filter on a non-attacks event', () => {
    expect(
      EffectIRSchema.safeParse(
        withTrigger({ event: 'attacks', area: 'BACK', attacker: { controller: 'self', feature: '' } }),
      ).success,
    ).toBe(false);
    expect(
      EffectIRSchema.safeParse(
        withTrigger({ event: 'activate', area: 'HAND', attacker: { controller: 'self', feature: 'Avengers' } }),
      ).success,
    ).toBe(false);
  });
});

describe('the optional name filter', () => {
  const named = (filter: Record<string, unknown>): unknown =>
    wrap({
      kind: 'prune',
      target: { kind: 'selected', side: 'self', area: 'BATTLE', count: 1, upTo: false, filter },
    });

  it('parses a filter with no name text, as every earlier script wrote it', () => {
    expect(() => EffectIRSchema.parse(named({ ...NO_FILTER }))).not.toThrow();
  });

  it('accepts a non-empty name text and keeps it', () => {
    const parsed = EffectIRSchema.parse(named({ ...NO_FILTER, nameIncludes: 'ULTRON' }));
    expect(JSON.stringify(parsed)).toContain('"nameIncludes":"ULTRON"');
  });

  it('rejects an empty name text and a non-text one', () => {
    expect(() => EffectIRSchema.parse(named({ ...NO_FILTER, nameIncludes: '' }))).toThrow();
    expect(() => EffectIRSchema.parse(named({ ...NO_FILTER, nameIncludes: 7 }))).toThrow();
  });
});

describe('the vocabulary tables are append-only', () => {
  it('keeps the first 19 op kinds in place and appends every later one', () => {
    expect([...EFFECT_OP_KINDS].slice(0, 19)).toEqual([
      'stat-mod',
      'stat-set',
      'draw',
      'discard',
      'mill',
      'prune',
      'retreat',
      'relocate',
      'attach',
      'cover',
      'swap',
      'dig',
      'show',
      'battle-move',
      'restrict',
      'grant-ability',
      'sequence',
      'conditional',
      'optional',
    ]);
    expect(EFFECT_OP_KINDS.length).toBeGreaterThan(19);
    expect(new Set(EFFECT_OP_KINDS).size).toBe(EFFECT_OP_KINDS.length);
  });

  it('keeps the first five scale sources, the first two restrictions and the first four conditions', () => {
    expect([...EFFECT_SCALE_SOURCES].slice(0, 5)).toEqual([
      'none',
      'self-power',
      'characters-in-void',
      'opponent-characters-in-battle',
      'discarded-lv-total',
    ]);
    expect([...EFFECT_RESTRICTIONS].slice(0, 2)).toEqual(['move', 'attack']);
    expect([...EFFECT_CONDITION_KINDS].slice(0, 4)).toEqual([
      'have',
      'fewer-than-opponent',
      'source-did-not-attack',
      'subject-matches',
    ]);
    expect([...EFFECT_TARGET_KINDS].slice(0, 3)).toEqual(['source', 'subject', 'selected']);
    expect(EFFECT_FILTER_FACETS[0]).toBe('nameIncludes');
  });

  it('has no duplicate entry in any table', () => {
    for (const table of [EFFECT_SCALE_SOURCES, EFFECT_RESTRICTIONS, EFFECT_CONDITION_KINDS, EFFECT_FILTER_FACETS]) {
      expect(new Set(table).size).toBe(table.length);
    }
  });
});

describe('the appended conditions, targets, facets, scale sources and restrictions', () => {
  const conditional = (condition: unknown): unknown =>
    wrap({ kind: 'conditional', condition, then: DRAW_ONE, otherwise: null });
  const CONDITIONS: Readonly<Record<EffectCondition['kind'], EffectCondition>> = {
    have: { kind: 'have', side: 'self', area: 'BASE', filter: NO_FILTER, min: 1, max: null },
    'fewer-than-opponent': { kind: 'fewer-than-opponent', area: 'BATTLE', filter: NO_FILTER },
    'source-did-not-attack': { kind: 'source-did-not-attack' },
    'subject-matches': { kind: 'subject-matches', filter: NO_FILTER },
    'attack-target-matches': { kind: 'attack-target-matches', filter: NO_FILTER, powerAboveSource: true },
    'have-weakness': { kind: 'have-weakness' },
    'host-did-not-attack': { kind: 'host-did-not-attack' },
    'more-set-cards-than-opponent': { kind: 'more-set-cards-than-opponent' },
    'no-call-this-turn': { kind: 'no-call-this-turn' },
    'owner-is-opponent': { kind: 'owner-is-opponent' },
    'previous-step-retreated': { kind: 'previous-step-retreated' },
    'set-equals-character-count-in-base': { kind: 'set-equals-character-count-in-base' },
    'target-attacked-before': { kind: 'target-attacked-before' },
    'top-card-matches': { kind: 'top-card-matches', filter: NO_FILTER },
    'total-lv-lower-than-opponent': { kind: 'total-lv-lower-than-opponent' },
  };

  it.each(EFFECT_CONDITION_KINDS)('accepts a %s condition and rejects an unknown key on it', (kind) => {
    const condition = CONDITIONS[kind];
    expect(() => EffectIRSchema.parse(conditional(condition))).not.toThrow();
    expect(() => EffectIRSchema.parse(conditional({ ...condition, surplus: 1 }))).toThrow();
  });

  it('rejects an unknown condition kind', () => {
    expect(() => EffectIRSchema.parse(conditional({ kind: 'the-moon-is-full' }))).toThrow();
  });

  it('accepts the host-of-source target and rejects a target kind outside the table', () => {
    expect(EFFECT_TARGET_KINDS).toContain('host-of-source');
    expect(() => EffectIRSchema.parse(wrap({ kind: 'cover', target: { kind: 'host-of-source' } }))).not.toThrow();
    expect(() => EffectIRSchema.parse(wrap({ kind: 'cover', target: { kind: 'host' } }))).toThrow();
  });

  it('accepts named picks and rejects unknown pick names', () => {
    const bound = (bind: unknown): unknown =>
      wrap({ ...VALID['prune'], target: { ...OPPONENT_BATTLE, bind } });
    expect(() => EffectIRSchema.parse(bound('A'))).not.toThrow();
    expect(() => EffectIRSchema.parse(bound('B'))).not.toThrow();
    expect(() => EffectIRSchema.parse(bound('C'))).toThrow();
    expect(EFFECT_TARGET_KINDS).toContain('named');
    expect(() => EffectIRSchema.parse(wrap({ kind: 'cover', target: { kind: 'named', name: 'A' } }))).not.toThrow();
    expect(() => EffectIRSchema.parse(wrap({ kind: 'cover', target: { kind: 'named', name: 'C' } }))).toThrow();
    expect(() => EffectIRSchema.parse(wrap({ kind: 'cover', target: { kind: 'named' } }))).toThrow();
    const scaled = (scaleFrom: unknown): unknown =>
      wrap({ ...VALID['stat-mod'], scaleFrom });
    expect(() => EffectIRSchema.parse(scaled({ name: 'A', stat: 'power' }))).not.toThrow();
    expect(() => EffectIRSchema.parse(scaled({ name: 'A', stat: 'name' }))).toThrow();
    expect(() => EffectIRSchema.parse(scaled({ name: 'Z', stat: 'lv' }))).toThrow();
    expect(() => EffectIRSchema.parse(wrap({ ...VALID['prune'], scaleFrom: { name: 'A', stat: 'lv' } }))).toThrow();
    const ref = (value: unknown): unknown =>
      wrap({ kind: 'prune', target: { ...OPPONENT_BATTLE, filter: { ...NO_FILTER, ref: value } } });
    expect(() => EffectIRSchema.parse(ref('B'))).not.toThrow();
    expect(() => EffectIRSchema.parse(ref('C'))).toThrow();
  });

  it('accepts a random selection and rejects a non-boolean one', () => {
    const selection = (random: unknown): unknown =>
      wrap({ ...VALID['prune'], target: { ...OPPONENT_BATTLE, random } });
    expect(() => EffectIRSchema.parse(selection(true))).not.toThrow();
    expect(() => EffectIRSchema.parse(selection('yes'))).toThrow();
  });

  it('accepts every filter facet and rejects a malformed one', () => {
    const named = (filter: Record<string, unknown>): unknown =>
      wrap({ kind: 'prune', target: { ...OPPONENT_BATTLE, filter: { ...NO_FILTER, ...filter } } });
    const FACETS: Readonly<Record<(typeof EFFECT_FILTER_FACETS)[number], unknown>> = {
      nameIncludes: 'ULTRON',
      nameExcludes: 'WASP',
      differentNameFrom: 'source',
      sameNameAsSelected: true,
      lvSameAsRevealed: true,
      lvOffsetFromSelected: 1,
      equalLvAcrossSides: true,
      extreme: { stat: 'lv', which: 'highest' },
      lvBy: { mode: 'max', source: 'source-lv' },
      noEffects: true,
      original: true,
      hasAutoEffect: true,
      ref: 'B',
    };
    for (const facet of EFFECT_FILTER_FACETS) {
      expect(() => EffectIRSchema.parse(named({ [facet]: FACETS[facet] })), facet).not.toThrow();
    }
    expect(() => EffectIRSchema.parse(named({ nameExcludes: '' }))).toThrow();
    expect(() => EffectIRSchema.parse(named({ differentNameFrom: 'anyone' }))).toThrow();
    expect(() => EffectIRSchema.parse(named({ extreme: { stat: 'r', which: 'highest' } }))).toThrow();
    expect(() => EffectIRSchema.parse(named({ lvBy: { mode: 'max', source: 'moonlight' } }))).toThrow();
  });

  it('accepts every scale source and rejects an unknown one', () => {
    for (const scaleBy of EFFECT_SCALE_SOURCES) {
      expect(() => EffectIRSchema.parse(wrap({ ...VALID['stat-mod'], scaleBy }))).not.toThrow();
    }
    expect(() => EffectIRSchema.parse(wrap({ ...VALID['stat-mod'], scaleBy: 'moonlight' }))).toThrow();
  });

  it('accepts every restriction with and without a limit, and rejects a bad limit', () => {
    for (const restriction of EFFECT_RESTRICTIONS) {
      const base = { ...VALID['restrict'], restriction };
      expect(() => EffectIRSchema.parse(wrap(base))).not.toThrow();
      expect(() => EffectIRSchema.parse(wrap({ ...base, limit: { lv: 6, lane: null } }))).not.toThrow();
      expect(() => EffectIRSchema.parse(wrap({ ...base, limit: { lv: null, lane: 'FRONT' } }))).not.toThrow();
    }
    expect(() => EffectIRSchema.parse(wrap({ ...VALID['restrict'], limit: { lv: null, lane: 'MOON' } }))).toThrow();
    expect(() => EffectIRSchema.parse(wrap({ ...VALID['restrict'], limit: { lv: 6 } }))).toThrow();
    expect(() => EffectIRSchema.parse(wrap({ ...VALID['restrict'], restriction: 'levitate' }))).toThrow();
  });

  it('rejects an op kind outside the table', () => {
    expect(() => EffectIRSchema.parse(wrap({ kind: 'summon', target: SOURCE }))).toThrow();
  });

  it('accepts oncePerTurn true, rejects other values, and accepts its absence', () => {
    const base = wrap(VALID['restrict']) as Record<string, unknown>;
    expect(() => EffectIRSchema.parse({ ...base, oncePerTurn: true })).not.toThrow();
    expect(() => EffectIRSchema.parse({ ...base, oncePerTurn: false })).toThrow();
    expect(() => EffectIRSchema.parse({ ...base, oncePerTurn: 1 })).toThrow();
    expect(() => EffectIRSchema.parse(base)).not.toThrow();
  });
});
