import { expect, expectTypeOf, test } from 'vitest';
import type { CardDefinition, CardInstance, CardNo, Printing } from './identity';
import { CardNoSchema, asCardNo, isCardNo, normalizeCardNo } from './identity';

/**
 * Real card numbers sampled from the vendor feed (verified 2026-09-25): `BP01-005`,
 * `EB01-013` and `SP01-001` are canonical values, `"BP01-096 "` and `"SP01-046\n"` are
 * the observed dirty variants (trailing space, embedded newline), and `"SPO1-001"` is
 * an observed letter-O typo that normalizes to nothing valid — it must be REJECTED, not
 * repaired, because repairing it is the mirror pipeline's explicit decision to make.
 */
const CANONICAL_SAMPLES = ['BP01-005', 'EB01-013', 'SP01-001', 'MH01-001'] as const;
const DIRTY_SAMPLES = ['  BP01-096 ', 'SP01-046\n', 'bp01-005', 'Bp01-013'] as const;
const REJECTED_SAMPLES = [
  'SPO1-001', // letter-O typo: OCR-class, repaired (or not) by the mirror, never here
  'bp01-005', // un-normalized case
  ' BP01-005', // un-normalized padding
  'BP01-05', // too few digits
  'BP01-0005', // too many digits
  'B01-005', // one product letter
  'BP1-005', // one product digit
  'BP01_005', // wrong separator
  'BP01-005 ', // trailing space is not canonical form
  'bp01 - 005', // un-normalized separator whitespace
  '', // empty
  'MH01-001-02', // suffix
] as const;

const FIXTURE_INSTANCE: CardInstance = {
  iid: 1,
  cardNo: asCardNo('MH01-001'),
  nameKey: 'synthetic-hero',
  faceDown: false,
  attached: [],
};

test('normalizeCardNo trims, uppercases, and collapses whitespace around the separator', () => {
  expect(normalizeCardNo('bp01-005')).toBe('BP01-005');
  expect(normalizeCardNo('Bp01-005')).toBe('BP01-005');
  expect(normalizeCardNo('  BP01-096 ')).toBe('BP01-096');
  expect(normalizeCardNo('SP01-046\n')).toBe('SP01-046');
  expect(normalizeCardNo('\tEB01-013\t')).toBe('EB01-013');
  expect(normalizeCardNo('BP01 - 005')).toBe('BP01-005');
  expect(normalizeCardNo('BP01\t-\n005')).toBe('BP01-005');
});

test('normalizeCardNo is idempotent on both canonical and dirty input', () => {
  for (const raw of [...CANONICAL_SAMPLES, ...DIRTY_SAMPLES]) {
    const once = normalizeCardNo(raw);
    expect(normalizeCardNo(once)).toBe(once);
  }
});

test('isCardNo accepts the canonical feed samples', () => {
  for (const sample of CANONICAL_SAMPLES) {
    expect(isCardNo(sample), sample).toBe(true);
  }
});

test('isCardNo rejects dirty, malformed, and un-normalized values', () => {
  for (const sample of REJECTED_SAMPLES) {
    expect(isCardNo(sample), sample).toBe(false);
  }
});

test('normalizing a dirty feed sample yields a value isCardNo accepts', () => {
  // The two helpers are separate on purpose: detection stays strict, and the caller
  // decides when a value has been repaired enough to become an identity.
  for (const sample of DIRTY_SAMPLES) {
    expect(isCardNo(normalizeCardNo(sample)), sample).toBe(true);
  }
  // The letter-O typo is the counter-example: it is dirty in a way normalization does
  // not (and must not) silently fix.
  expect(isCardNo(normalizeCardNo('SPO1-001'))).toBe(false);
});

test('asCardNo mints an identity for canonical values and throws otherwise', () => {
  expect(asCardNo('MH01-001')).toBe('MH01-001');
  expect(() => asCardNo('bp01-005')).toThrow(/INVALID_CARD_NO/);
  expect(() => asCardNo('SPO1-001')).toThrow(/INVALID_CARD_NO/);
});

test('CardNoSchema mints the identity brand and rejects non-canonical values', () => {
  expect(CardNoSchema.safeParse('BP01-005').success).toBe(true);
  expect(CardNoSchema.safeParse('bp01-005').success).toBe(false);
  expect(CardNoSchema.safeParse('SPO1-001').success).toBe(false);
  expect(CardNoSchema.safeParse(42).success).toBe(false);
});

test('type-level: a bare string is not a card identity', () => {
  // The tripwire for the brand. If the brand is dropped from CardNoSchema, this line
  // stops erroring, the directive becomes unused, and typecheck fails — which is the
  // point: identity must never be a plain string.
  // @ts-expect-error — a raw string does not satisfy CardNo
  const notAnIdentity: CardNo = 'BP01-005';
  expect(notAnIdentity).toBe('BP01-005');
});

test('type-level: identity, the definition, and the ordered attachment list', () => {
  expectTypeOf<CardDefinition['cardNo']>().toEqualTypeOf<CardNo>();
  expectTypeOf<CardDefinition['nameKey']>().toEqualTypeOf<string>();
  expectTypeOf<CardInstance['nameKey']>().toEqualTypeOf<string>();
  // An ordered array, not a set (301.25.m/n).
  expectTypeOf<CardInstance['attached']>().toEqualTypeOf<CardInstance[]>();

  const instance = FIXTURE_INSTANCE;

  // The tripwire: if a printing identifier is ever added to CardInstance, this line
  // stops erroring, the `@ts-expect-error` directive becomes unused, and typecheck
  // fails. A printing identifier in a game instance would put a language-specific
  // vendor id into the wire format.
  // @ts-expect-error — printingId is confined to Printing and must never reach an instance
  const leakedPrintingId = instance.printingId;
  expect(leakedPrintingId).toBeUndefined();

  // Same tripwire for the derived face-down level: 301.21.g makes it a read-time
  // computation, so storing it would create a second source of truth.
  // @ts-expect-error — effective Lv is derived from faceDown (301.21.g), never stored
  const derivedLevel = instance.effectiveLevel;
  expect(derivedLevel).toBeUndefined();
});

test('type-level: Printing carries the per-language printing identifier', () => {
  expectTypeOf<Printing['printingId']>().toEqualTypeOf<string>();
  expectTypeOf<Printing['language']>().toEqualTypeOf<'en' | 'id'>();

  const printing: Printing = {
    printingId: 'vendor-printing-id-123',
    cardNo: asCardNo('BP01-005'),
    language: 'id',
    setLabel: 'BP01',
  };
  expect(printing.printingId).toBe('vendor-printing-id-123');
});
