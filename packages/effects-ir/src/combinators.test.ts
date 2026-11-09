import { describe, expect, it } from 'vitest';
import {
  ANY_CARD,
  attach,
  attackerFilter,
  bind,
  named,
  scaleCount,
  scaleFrom,
  battleMove,
  characters,
  colored,
  conditional,
  copyAttachedEffects,
  cover,
  dig,
  discard,
  draw,
  drawByBoardComparison,
  effect,
  flip,
  grantAbility,
  grantSecondChanceAttack,
  hostOfSource,
  ifDone,
  trigger,
  mill,
  optional,
  power,
  prune,
  rearrangeDeckTop,
  relocate,
  restrict,
  retargetAttack,
  retreat,
  retreatAttachedOfHost,
  select,
  selectAll,
  selectEitherSide,
  selectUpTo,
  sequence,
  show,
  skipBattlePhase,
  source,
  statSet,
  step,
  subject,
  swap,
} from './combinators';
import type { EffectOp } from './ir';
import { EffectIRSchema, EffectTriggerSchema } from './schema';
import { EFFECT_RULES_VERSION } from './version';
import { SYNTHETIC_CARDS } from './fixtures/synthetic-cards';

const card = SYNTHETIC_CARDS[0]!;
const mine = select('self', 'BATTLE', characters());

const OPS: Record<string, EffectOp> = {
  power: power(mine, 1000),
  statSet: statSet(mine, 'r', 2),
  draw: draw('self', 1),
  discard: discard(source()),
  mill: mill('opponent', 'top', 2, 'discard'),
  prune: prune(subject()),
  retreat: retreat(mine),
  relocate: relocate(mine, { side: 'self', area: 'HAND', faceDown: false }),
  attach: attach(source(), mine),
  cover: cover(mine),
  swap: swap(source(), mine),
  dig: dig('self', 3, colored('red', { lvMax: 2 }), 'bottom'),
  show: show(mine),
  battleMove: battleMove(mine),
  restrict: restrict(mine, 'attack'),
  grantAbility: grantAbility(mine, 'BLOCK'),
  sequence: sequence(step(draw('self', 1)), ifDone(power(mine, 2000))),
  conditional: conditional({ kind: 'source-did-not-attack' }, draw('self', 1), draw('opponent', 1)),
  optional: optional(draw('self', 2)),
  retreatAttachedOfHost: retreatAttachedOfHost(hostOfSource(), 'all', true),
  rearrangeDeckTop: rearrangeDeckTop('self', 3),
  drawByBoardComparison: drawByBoardComparison(1),
  flip: flip(mine, false),
  retargetAttack: retargetAttack(mine),
  skipBattlePhase: skipBattlePhase(),
  grantSecondChanceAttack: grantSecondChanceAttack(source()),
  copyAttachedEffects: copyAttachedEffects(source()),
};

describe('combinators', () => {
  it.each(Object.entries(OPS))('%s builds a schema-valid IR stamped with the current revision', (_name, op) => {
    const ir = effect(card.cardNo, op);
    expect(ir.rulesVersion).toBe(EFFECT_RULES_VERSION);
    expect(ir.cardNo).toBe(card.cardNo);
    expect(EffectIRSchema.safeParse(ir).success).toBe(true);
  });

  it('covers every builder kind', () => {
    const kinds = new Set(Object.values(OPS).map((op) => op.kind));
    expect(kinds.size).toBe(Object.keys(OPS).length);
  });

  it('colored sets the colour and keeps the character restriction', () => {
    const filter = colored('red');
    expect(filter.color).toBe('red');
    expect(filter.characterOnly).toBe(true);
    expect(ANY_CARD.characterOnly).toBe(false);
  });

  it('selectors produce targets the schema accepts', () => {
    for (const target of [
      select('self', 'FIELD', ANY_CARD, 2),
      selectUpTo('opponent', 'HAND', ANY_CARD, 3),
      selectAll('self', 'BASE', ANY_CARD),
      selectEitherSide('FIELD', ANY_CARD),
    ]) {
      expect(target.kind).toBe('selected');
      expect(EffectIRSchema.safeParse(effect(card.cardNo, discard(target))).success).toBe(true);
    }
  });

  it('only selectEitherSide emits the eitherSide key', () => {
    expect(selectEitherSide('FIELD', ANY_CARD)).toMatchObject({ side: 'self', eitherSide: true, count: 1 });
    expect('eitherSide' in select('self', 'FIELD', ANY_CARD)).toBe(false);
  });

  it('builds filters from invented cards', () => {
    for (const c of SYNTHETIC_CARDS) {
      const filter = colored(c.color, { feature: c.feature, lvMin: c.level, lvMax: c.level, powerMax: c.power });
      const ir = effect(c.cardNo, power(select('self', 'BATTLE', filter), 1000));
      expect(EffectIRSchema.safeParse(ir).success).toBe(true);
    }
  });
});

describe('the appended combinators', () => {
  it('restrict leaves the limit key out unless one is given', () => {
    expect('limit' in restrict(mine, 'attack')).toBe(false);
    expect(restrict(mine, 'attack-target', { lv: null, lane: 'FRONT' })).toMatchObject({
      limit: { lv: null, lane: 'FRONT' },
    });
  });

  it('retreatAttachedOfHost defaults to all attached cards and keeps the source', () => {
    expect(retreatAttachedOfHost(hostOfSource())).toEqual({
      kind: 'retreat-attached-of-host',
      host: { kind: 'host-of-source' },
      scope: 'all',
      exceptSource: false,
    });
  });
});

describe('effect trigger tag', () => {
  const op = draw('self', 1);

  it('omits the trigger key when none is given', () => {
    expect('trigger' in effect(card.cardNo, op)).toBe(false);
  });

  it('carries the tag when given and still parses', () => {
    const ir = effect(card.cardNo, op, trigger('enters-field-by-call', 'FIELD'));
    expect(ir.trigger).toEqual({ event: 'enters-field-by-call', area: 'FIELD' });
    expect(EffectIRSchema.safeParse(ir).success).toBe(true);
  });

  it('carries an optional attacker filter only when given, and only on attacks', () => {
    expect(trigger('attacks', 'HAND')).toEqual({ event: 'attacks', area: 'HAND' });
    expect('attacker' in trigger('attacks', 'HAND')).toBe(false);
    const filtered = trigger('attacks', 'HAND', { controller: 'self', color: 'red' });
    expect(filtered).toEqual({
      event: 'attacks',
      area: 'HAND',
      attacker: { controller: 'self', color: 'red' },
    });
    expect(EffectTriggerSchema.safeParse(filtered).success).toBe(true);
    expect(
      EffectTriggerSchema.safeParse({ ...filtered, attacker: { controller: 'self', extra: 1 } })
        .success,
    ).toBe(false);
    expect(
      EffectTriggerSchema.safeParse({ event: 'activate', area: 'HAND', attacker: filtered.attacker })
        .success,
    ).toBe(false);
  });
});

describe('the pick-name and scale helpers', () => {
  const parses = (op: EffectOp): boolean => EffectIRSchema.safeParse(effect(card.cardNo, op)).success;

  it('bind sets the pick name on a selected target and named refers to it', () => {
    const picked = bind(select('self', 'BASE', ANY_CARD), 'A');
    expect(picked).toMatchObject({ kind: 'selected', bind: 'A' });
    expect(named('A')).toEqual({ kind: 'named', name: 'A' });
    expect(parses(power(named('A'), 1000))).toBe(true);
    expect(parses(sequence(step(retreat(picked)), ifDone(power(named('A'), 1000))))).toBe(true);
    expect(() => bind(source(), 'A')).toThrow(Error);
  });

  it('scaleFrom scales the delta by a stat of a bound pick', () => {
    const op = scaleFrom(source(), 'power', 1000, 'A', 'power');
    expect(op).toEqual({
      kind: 'stat-mod',
      target: source(),
      stat: 'power',
      delta: 1000,
      scaleBy: 'none',
      scaleFrom: { name: 'A', stat: 'power' },
      duration: 'this-turn',
    });
    expect(parses(sequence(step(prune(bind(select('self', 'BASE', ANY_CARD), 'A'))), ifDone(op)))).toBe(true);
  });

  it('scaleCount scales the delta by a filtered count', () => {
    const count = { side: 'self', area: 'BATTLE', filter: characters(), exceptSource: true } as const;
    const op = scaleCount(source(), 'power', 500, count);
    expect(op).toMatchObject({ kind: 'stat-mod', scaleBy: 'filtered-count', scaleCount: count });
    expect(parses(op)).toBe(true);
  });

  it('attackerFilter builds the attacker narrowing for an attacks trigger', () => {
    expect(attackerFilter()).toEqual({ controller: 'self' });
    expect(attackerFilter({ color: 'red', feature: 'X' })).toEqual({
      controller: 'self',
      color: 'red',
      feature: 'X',
    });
    expect(EffectTriggerSchema.safeParse(trigger('attacks', 'HAND', attackerFilter({ color: 'red' }))).success).toBe(
      true,
    );
  });
});
