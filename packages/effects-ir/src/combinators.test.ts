import { describe, expect, it } from 'vitest';
import {
  ANY_CARD,
  attach,
  battleMove,
  characters,
  colored,
  conditional,
  cover,
  dig,
  discard,
  draw,
  effect,
  grantAbility,
  ifDone,
  trigger,
  mill,
  optional,
  power,
  prune,
  relocate,
  restrict,
  retreat,
  select,
  selectAll,
  selectUpTo,
  sequence,
  show,
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
    ]) {
      expect(target.kind).toBe('selected');
      expect(EffectIRSchema.safeParse(effect(card.cardNo, discard(target))).success).toBe(true);
    }
  });

  it('builds filters from invented cards', () => {
    for (const c of SYNTHETIC_CARDS) {
      const filter = colored(c.color, { feature: c.feature, lvMin: c.level, lvMax: c.level, powerMax: c.power });
      const ir = effect(c.cardNo, power(select('self', 'BATTLE', filter), 1000));
      expect(EffectIRSchema.safeParse(ir).success).toBe(true);
    }
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
