import { describe, expect, it } from 'vitest';
import { asCardNo } from '@mhr/core';
import { EFFECT_OP_KINDS, EFFECT_TRIGGER_EVENTS, type EffectFilter, type EffectIR, type EffectOp, type EffectTarget } from './ir';
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
    expect([...EFFECT_TRIGGER_EVENTS]).toEqual([
      'enters-field-by-call',
      'enters-field',
      'attacks',
      'base-move',
      'activate',
      'activate-counter',
    ]);
  });
});
