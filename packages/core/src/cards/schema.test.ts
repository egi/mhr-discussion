import { expect, test } from 'vitest';
import type { CardColor } from './identity';
import {
  CardColorSchema,
  CardIndexRowSchema,
  CardIndexSchema,
  CardRepairSchema,
  CardSyncManifestSchema,
  CardTextEnFileSchema,
  CardTextIdFileSchema,
  CommunityOverrideFileSchema,
  ProvenanceFileSchema,
  QuarantineFileSchema,
  SnapshotFileSchema,
  SnapshotRowSchema,
  TermMapFileSchema,
  VendorCardRowSchema,
  VendorEnvelopeSchema,
  VendorErrorEnvelopeSchema,
} from './schema';

/**
 * Fixtures use the measured feed values (a full pull of both languages): every scalar
 * arrives as a string, the signed address nests under `image`, and a Rush Point row
 * carries `""`/`" "` where a character row carries a colour, level or power.
 */
const WIRE_ROW = {
  attack_range: '1',
  attribute: 'Red',
  card_no: 'BP01-001',
  card_type: 'character',
  effect: 'TRIG【FIELD】: When this card is placed, draw a card.',
  environment: 'S1',
  feature: 'Human/Avengers',
  id: '6a86a6bc9da74fc0904ed862',
  image: { key: '6a86a5c7c9d84b0a8f3e1d20', url: 'https://cdn.example.test/a.png?e=1790472243&token=abc:u1' },
  language: 'en',
  level: '6',
  name: 'Test Hero Alpha',
  power: '6500',
  product_series: 'BP01',
  rarity: 'MR',
};

const RUSH_POINT_ROW = {
  attack_range: ' ',
  attribute: '',
  card_no: 'BP01-100',
  card_type: 'impact',
  effect: '',
  environment: '',
  feature: ' ',
  id: '6a86a6bc9da74fc0904ed863',
  image: { key: '6a86a5c7c9d84b0a8f3e1d21', url: 'https://cdn.example.test/b.png?e=1790472243&token=abc:u2' },
  language: 'en',
  level: ' ',
  name: 'RUSH POINT',
  power: '',
  product_series: 'BP01',
  rarity: 'C',
};

const SUCCESS_ENVELOPE = {
  current_page: 1,
  list: [WIRE_ROW, RUSH_POINT_ROW],
  page_count: 1,
  page_size: 1000,
  total: 448,
};

/** The projection the sync stage performs: drop `image`, keep the durable key. */
const toSnapshotRow = (row: typeof WIRE_ROW | typeof RUSH_POINT_ROW): Record<string, unknown> => {
  const rest: Record<string, unknown> = { ...row };
  delete rest.image;
  return { ...rest, imageKey: row.image.key };
};

const INDEX_ROW = {
  cardNo: 'BP01-001',
  nameKey: 'TEST HERO ALPHA',
  cardType: 'character',
  nameEn: 'Test Hero Alpha',
  nameId: 'Test Hero Alpha',
  color: 'red',
  level: 6,
  power: 6500,
  attackRange: 1,
  rarity: 'MR',
  traits: ['Human', 'Avengers'],
  abilities: ['DOUBLE ATTACK'],
  setLabel: 'BP01',
  translationStatus: 'official',
  imageKey: '6a86a5c7c9d84b0a8f3e1d20',
  printingCount: 2,
};

const MANIFEST = {
  syncedAt: '2026-09-26T13:52:27.123Z',
  languages: {
    en: { rows: 448, total: 448, pageCount: 1 },
    id: { rows: 383, total: 383, pageCount: 1 },
  },
  snapshotSha256: {
    en: '7ff2a973d4888e5a4ba6070e471c25586858c2b272bf8caca9822d1651ad1f80',
    id: 'b60759a3ad40f08ef97f1ff9f109598e6920d726745ae33b6d0206013802e3bc',
  },
  images: {
    requested: 352,
    fetched: 350,
    failed: 2,
    failedKeys: [{ imageKey: '6a86a5c7c9d84b0a8f3e1d20', error: 'HTTP 404' }],
    failureRate: 0.0057,
  },
};

test('parses a vendor row typed exactly as the feed sends it', () => {
  const parsed = VendorCardRowSchema.safeParse(WIRE_ROW);
  expect(parsed.success).toBe(true);
  // Every numeric-looking field arrives as text, including the blank forms.
  expect(VendorCardRowSchema.safeParse(RUSH_POINT_ROW).success).toBe(true);
});

test('rejects a vendor row carrying an unknown key', () => {
  const drifted = { ...WIRE_ROW, image_url: 'https://example.test/a.png' };
  expect(VendorCardRowSchema.safeParse(drifted).success).toBe(false);
});

test('rejects a vendor row with a renamed or missing measured field', () => {
  const renamed = { ...WIRE_ROW, traits: 'Human/Avengers' };
  delete (renamed as Record<string, unknown>).feature;
  expect(VendorCardRowSchema.safeParse(renamed).success).toBe(false);
});

test('parses the success envelope and models a null list as part of the contract', () => {
  expect(VendorEnvelopeSchema.safeParse(SUCCESS_ENVELOPE).success).toBe(true);
  // Past the last page the feed answers HTTP 200 with `list: null` — not 400, not [].
  expect(VendorEnvelopeSchema.safeParse({ ...SUCCESS_ENVELOPE, list: null }).success).toBe(true);
  expect(VendorEnvelopeSchema.safeParse({ ...SUCCESS_ENVELOPE, list: undefined }).success).toBe(false);
});

test('parses the error envelope and refuses to confuse it with the success one', () => {
  const error = { code: 4000000002, msg: 'validate fail', debug: { language: 'required' } };
  expect(VendorErrorEnvelopeSchema.safeParse(error).success).toBe(true);
  // The feed's own unrecognised-language refusal carries no `debug` at all, and its
  // `msg` is sometimes Chinese — neither may crash the path that reports the error.
  expect(VendorErrorEnvelopeSchema.safeParse({ code: 4000201000, msg: '语言不能为空' }).success).toBe(true);

  expect(VendorErrorEnvelopeSchema.safeParse(SUCCESS_ENVELOPE).success).toBe(false);
  expect(VendorEnvelopeSchema.safeParse(error).success).toBe(false);
});

test('rejects a snapshot row carrying image', () => {
  const withSignedUrl = toSnapshotRow(WIRE_ROW);
  expect(SnapshotRowSchema.safeParse(withSignedUrl).success).toBe(true);

  // The committed shape has no `image` key, so a signed address cannot be persisted by
  // accident: writing one is an unrecognised-key failure, not a review miss.
  withSignedUrl.image = { key: 'k', url: 'https://cdn.example.test/a.png?token=abc' };
  expect(SnapshotRowSchema.safeParse(withSignedUrl).success).toBe(false);
});

test('rejects a snapshot row with an empty or filename-unsafe image key', () => {
  expect(SnapshotRowSchema.safeParse({ ...toSnapshotRow(WIRE_ROW), imageKey: '' }).success).toBe(false);
  expect(SnapshotRowSchema.safeParse({ ...toSnapshotRow(WIRE_ROW), imageKey: '../escape' }).success).toBe(false);
  expect(SnapshotRowSchema.safeParse({ ...toSnapshotRow(WIRE_ROW), imageKey: 'a/b' }).success).toBe(false);
});

test('parses a snapshot file with both languages and their digests', () => {
  const file = {
    languages: {
      en: { total: 448, rows: [toSnapshotRow(WIRE_ROW)] },
      id: { total: 383, rows: [toSnapshotRow(RUSH_POINT_ROW)] },
    },
    snapshotSha256: { ...MANIFEST.snapshotSha256 },
  };
  expect(SnapshotFileSchema.safeParse(file).success).toBe(true);

  const withoutId: Record<string, unknown> = { ...file, languages: { en: file.languages.en } };
  expect(SnapshotFileSchema.safeParse(withoutId).success).toBe(false);

  const withoutTotal: Record<string, unknown> = {
    ...file,
    languages: { en: { rows: file.languages.en.rows }, id: file.languages.id },
  };
  expect(SnapshotFileSchema.safeParse(withoutTotal).success).toBe(false);
});

test('rejects an index row missing nameKey or carrying an unknown key', () => {
  expect(CardIndexRowSchema.safeParse(INDEX_ROW).success).toBe(true);

  const withoutNameKey: Record<string, unknown> = { ...INDEX_ROW };
  delete withoutNameKey.nameKey;
  expect(CardIndexRowSchema.safeParse(withoutNameKey).success).toBe(false);

  expect(CardIndexRowSchema.safeParse({ ...INDEX_ROW, productSeries: 'BP01' }).success).toBe(false);
});

test('rejects an index row whose cardNo is not canonical', () => {
  expect(CardIndexRowSchema.safeParse({ ...INDEX_ROW, cardNo: 'bp01-001' }).success).toBe(false);
  expect(CardIndexRowSchema.safeParse({ ...INDEX_ROW, cardNo: 'BPO1-001' }).success).toBe(false);
});

test('rejects an index row carrying an ability outside the engine union', () => {
  expect(CardIndexRowSchema.safeParse({ ...INDEX_ROW, abilities: ['Double Attack'] }).success).toBe(false);
  expect(CardIndexRowSchema.safeParse({ ...INDEX_ROW, abilities: ['SUPER'] }).success).toBe(false);
});

test('models the absent stat row a Rush Point produces', () => {
  const rushPoint = {
    ...INDEX_ROW,
    cardType: 'impact',
    cardNo: 'BP01-100',
    nameEn: 'RUSH POINT',
    nameId: null,
    color: null,
    level: null,
    power: null,
    attackRange: null,
    traits: [],
    abilities: [],
    translationStatus: 'missing',
  };
  expect(CardIndexRowSchema.safeParse(rushPoint).success).toBe(true);

  // `null` means "absent"; the empty string is not a stand-in for it.
  expect(CardIndexRowSchema.safeParse({ ...rushPoint, nameId: '' }).success).toBe(false);
});

test('parses the index artifact and requires a content digest', () => {
  const index = { cardDataVersion: MANIFEST.snapshotSha256.en, rows: [INDEX_ROW] };
  expect(CardIndexSchema.safeParse(index).success).toBe(true);

  const withoutDigest: Record<string, unknown> = { rows: [INDEX_ROW] };
  expect(CardIndexSchema.safeParse(withoutDigest).success).toBe(false);
  expect(CardIndexSchema.safeParse({ ...index, cardDataVersion: 'abc' }).success).toBe(false);
});

test('parses an English text row and refuses a provenance key on it', () => {
  const file = { rows: [{ cardNo: 'BP01-001', text: 'TRIG【FIELD】: draw a card.', textHash: 'a1b2c3d4e5f6' }] };
  expect(CardTextEnFileSchema.safeParse(file).success).toBe(true);

  // English text is never community-overridden, so the per-language schema split makes
  // a `provenance` key here structurally impossible rather than merely unused.
  const withProvenance = { rows: [{ ...file.rows[0], provenance: 'official' }] };
  expect(CardTextEnFileSchema.safeParse(withProvenance).success).toBe(false);

  const withSha256 = { rows: [{ ...file.rows[0], textHash: 'a'.repeat(64) }] };
  expect(CardTextEnFileSchema.safeParse(withSha256).success).toBe(false);
});

test('requires an Indonesian text row to say where its text came from', () => {
  const base = { cardNo: 'BP01-001', text: 'TRIG【FIELD】: ambil satu kartu.', textHash: 'a1b2c3d4e5f6' };
  expect(CardTextIdFileSchema.safeParse({ rows: [{ ...base, provenance: 'official' }] }).success).toBe(true);
  expect(CardTextIdFileSchema.safeParse({ rows: [{ ...base, provenance: 'community' }] }).success).toBe(true);

  expect(CardTextIdFileSchema.safeParse({ rows: [base] }).success).toBe(false);
  expect(CardTextIdFileSchema.safeParse({ rows: [{ ...base, provenance: 'machine' }] }).success).toBe(false);
});

test('parses an empty quarantine file', () => {
  // Emptiness is the gate's business, not the schema's: the file must be readable when
  // there is nothing to report.
  expect(QuarantineFileSchema.safeParse({ rows: [] }).success).toBe(true);

  const entry = { field: 'card_no', rawValue: 'SPO1-00', reason: 'UNREPAIRABLE_CARD_NO' };
  expect(QuarantineFileSchema.safeParse({ rows: [entry] }).success).toBe(true);
  expect(QuarantineFileSchema.safeParse({ rows: [{ ...entry, rawValue: undefined }] }).success).toBe(false);
});

test('parses the repair audit with both a value repair and a canonical-effect choice', () => {
  const file = {
    rows: [
      { kind: 'value', field: 'card_no', rawValue: 'SPO1-001', repairedValue: 'SP01-001', rule: 'card-no-letter-o' },
      {
        kind: 'canonical-effect',
        cardNo: 'SD04-001',
        chosenPrintingId: '6a86a6bc9da74fc0904ed862',
        alternates: [{ printingId: '6a86a6bc9da74fc0904ed863', effect: 'Power+1001' }],
      },
    ],
  };
  expect(CardRepairSchema.safeParse(file).success).toBe(true);
  expect(QuarantineFileSchema.safeParse(file).success).toBe(false);
});

test('models provenance success rows only, with a query-free source path', () => {
  const row = {
    imageKey: '6a86a5c7c9d84b0a8f3e1d20',
    sourcePath: 'https://cdn.example.test/path/to/a.png',
    fetchedAt: '2026-09-26T13:52:27.123Z',
    width: 314,
    height: 433,
    bytes: 32_300,
  };
  expect(ProvenanceFileSchema.safeParse({ rows: [row] }).success).toBe(true);

  // A fetch failure is recorded in the sync manifest, never here: this file describes
  // files that exist.
  expect(ProvenanceFileSchema.safeParse({ rows: [{ imageKey: row.imageKey, error: 'HTTP 404' }] }).success).toBe(false);

  // The signed query string is stripped before the row is written, so a persisted
  // address is query-free by validation rather than by discipline.
  const withSignature = { ...row, sourcePath: `${row.sourcePath}?e=1790472243&token=abc:u1` };
  expect(ProvenanceFileSchema.safeParse({ rows: [withSignature] }).success).toBe(false);
});

test('parses an empty term map and rejects a half-empty pair', () => {
  // The seed file ships with no pairs, and the "there are terms in it" floor belongs to
  // the gate rather than to the schema.
  expect(TermMapFileSchema.safeParse({ pairs: [] }).success).toBe(true);
  expect(TermMapFileSchema.safeParse({ pairs: [{ en: 'Rush Point', id: 'Rush Point' }] }).success).toBe(true);

  expect(TermMapFileSchema.safeParse({ pairs: [{ en: 'Rush Point', id: '   ' }] }).success).toBe(false);
  expect(TermMapFileSchema.safeParse({ pairs: [{ en: '', id: 'Titik Rush' }] }).success).toBe(false);
});

test('parses a term pair with an optional rule key and rejects a blank or extra key', () => {
  const parse = (pair: unknown) => TermMapFileSchema.safeParse({ pairs: [pair] }).success;

  expect(parse({ en: 'Weakness', id: 'Kelemahan', ruleKey: '301.20.a' })).toBe(true);
  expect(parse({ en: 'Weakness', id: 'Kelemahan' })).toBe(true);
  expect(parse({ en: 'Rush Point', id: 'Rush Point' })).toBe(true);

  expect(parse({ en: 'Weakness', id: 'Kelemahan', ruleKey: '' })).toBe(false);
  expect(parse({ en: 'Weakness', id: 'Kelemahan', ruleKey: '   ' })).toBe(false);
  expect(parse({ en: 'Weakness', id: 'Kelemahan', note: 'x' })).toBe(false);
});

test('parses the community override file empty and with a human translation', () => {
  expect(CommunityOverrideFileSchema.safeParse({ overrides: [] }).success).toBe(true);
  expect(
    CommunityOverrideFileSchema.safeParse({ overrides: [{ cardNo: 'EB01-001', text: 'TRIG: ...' }] }).success,
  ).toBe(true);

  // An override that says nothing is not a translation.
  expect(CommunityOverrideFileSchema.safeParse({ overrides: [{ cardNo: 'EB01-001', text: '  ' }] }).success).toBe(
    false,
  );
});

test('parses the sync manifest and rejects a key outside its pinned set', () => {
  expect(CardSyncManifestSchema.safeParse(MANIFEST).success).toBe(true);

  const extra: Record<string, unknown> = { ...MANIFEST, vendorEndpoint: 'https://example.test' };
  expect(CardSyncManifestSchema.safeParse(extra).success).toBe(false);

  const wrongRate: Record<string, unknown> = {
    ...MANIFEST,
    images: { ...MANIFEST.images, failureRate: 5 },
  };
  expect(CardSyncManifestSchema.safeParse(wrongRate).success).toBe(false);
});

test('the colour schema covers the engine CardColor union exactly', () => {
  // Typed as a total map so a colour added to `CardColor` fails to compile here.
  const everyColour: Record<CardColor, true> = {
    red: true,
    yellow: true,
    blue: true,
    green: true,
    orange: true,
    purple: true,
  };
  for (const colour of Object.keys(everyColour)) {
    expect(CardColorSchema.safeParse(colour).success, colour).toBe(true);
  }
  expect(CardColorSchema.options.length).toBe(Object.keys(everyColour).length);
  expect(CardColorSchema.safeParse('pink').success).toBe(false);
});
