/**
 * Strict schemas for every boundary of the card mirror.
 *
 * Three kinds of boundary live here, and they are deliberately not the same shape:
 *
 * - **the vendor wire** — the unofficial card API's own JSON, typed the way the feed
 *   actually sends it (every scalar a string, blanks as `""` or `" "`). A field that
 *   arrives under a new name, or one that quietly disappears, is a parse failure
 *   rather than a silently missing value.
 * - **the committed snapshot** — derived from the wire row by removing `image`
 *   entirely and adding `imageKey`. The feed's `image.url` is signed and expires within
 *   about a day, so projecting it away is what keeps a committed artifact free of a
 *   dead, signed address; because the committed shape has no key to hold one, writing
 *   a URL is a validation failure rather than a matter of review discipline. Dropping
 *   it is also what makes the payload byte-identical across two pulls.
 * - **the committed artifacts** the catalog and the CI gate read: the index, the two
 *   per-language text files, the repair audit, the quarantine list, the term map, the
 *   image provenance and the sync manifest.
 *
 * Every level is a `z.strictObject` (and every map a `z.record`), for the reason the
 * project applies to all its boundaries: zod's non-strict object form *strips*
 * unrecognised keys and reports success, so a newer artifact would parse into a subtly
 * wrong shape with no error. Strict parsing turns that into a failure, and it is also what closes
 * the prototype-pollution shape — an unexpected `__proto__` or `constructor` key is a
 * parse error, never a merged property.
 *
 * The types are inferred from these schemas with `z.infer`, so a row type cannot drift
 * from the validator that admits it.
 */
import { z } from 'zod';
import { ABILITIES } from '../state/gameState';
import { CardNoSchema, type CardColor } from './identity';

/** A 12-character hex text hash: a staleness signal, never an identity. */
const TextHashSchema = z.string().regex(/^[0-9a-f]{12}$/);

/** A 64-character hex sha256: content digests and per-language snapshot hashes. */
const Sha256Schema = z.string().regex(/^[0-9a-f]{64}$/);

/**
 * An image key: the durable handle for one card image, and the name of the file the
 * scrape writes for it (`{imageKey}.webp`).
 *
 * Validated as a filename rather than as an opaque string, because that is what it
 * becomes: a narrow character class, a length cap, and no `..` traversal segment. A key
 * that fails this is a write-outside-the-target bug, not a data quirk to be tolerated.
 */
const ImageKeySchema = z
  .string()
  .regex(/^[A-Za-z0-9._-]{1,64}$/)
  .refine((key) => !key.includes('..'), { message: 'An image key must not contain a traversal segment' });

/**
 * The vendor's wire row, exactly as it arrives: fifteen keys, every scalar a string.
 *
 * The feed sends `level: "6"`, `power: "6500"` and `attack_range: "1"` as text, and
 * `""` or `" "` when a field does not apply — so every numeric-looking field is typed
 * as the string it is and parsed later, where "absent" can be distinguished from `0`.
 *
 * Two fields the feed does *not* send are as load-bearing as the ones it does: there is
 * no `traits` field (traits live in `feature`, slash-separated and not localized) and no
 * `abilities` field at all (the six named abilities are printed inside the English
 * effect text). Typing the row from the feed rather than from recollection is what makes
 * an invented field a failure instead of an assumption.
 */
export const VendorCardRowSchema = z.strictObject({
  attack_range: z.string(),
  attribute: z.string(),
  card_no: z.string(),
  card_type: z.string(),
  effect: z.string(),
  environment: z.string(),
  feature: z.string(),
  id: z.string(),
  image: z.strictObject({ key: z.string(), url: z.string() }),
  language: z.string(),
  level: z.string(),
  name: z.string(),
  power: z.string(),
  product_series: z.string(),
  rarity: z.string(),
});

export type VendorCardRow = z.infer<typeof VendorCardRowSchema>;

/**
 * The vendor's success envelope.
 *
 * `list` is nullable because the feed answers HTTP 200 with `"list": null` for a page
 * index past the last one. That is part of the success contract rather than an error
 * case, which is why a pagination loop bounds itself on `page_count` and treats a null
 * list inside that range as a refusal: a caller that tested only the status code would
 * dereference a null three-quarters of the way through a pull.
 */
export const VendorEnvelopeSchema = z.strictObject({
  current_page: z.number().int(),
  list: z.array(VendorCardRowSchema).nullable(),
  page_count: z.number().int(),
  page_size: z.number().int(),
  total: z.number().int().nonnegative(),
});

export type VendorEnvelope = z.infer<typeof VendorEnvelopeSchema>;

/**
 * The vendor's error envelope — a different shape from the success one, not a variant
 * of it: nothing here is named `list` and nothing there is named `code`, so the two
 * cannot be confused by a parse in either direction.
 *
 * `code` and `debug` are the machine-readable fields. `msg` is human text and is
 * sometimes Chinese (`语言不能为空`), so it must never be read as a decision input.
 * `debug` is nullish because the feed's own unrecognised-language refusal carries no
 * `debug` key at all — a schema that required it would crash the very path that exists
 * to report the failure.
 */
export const VendorErrorEnvelopeSchema = z.strictObject({
  code: z.number().int(),
  msg: z.string(),
  debug: z.record(z.string(), z.string()).nullish(),
});

export type VendorErrorEnvelope = z.infer<typeof VendorErrorEnvelopeSchema>;

/**
 * The committed snapshot row: the wire row with the signed `image` object removed and a
 * durable `imageKey` in its place.
 *
 * Deriving the shape rather than restating it is the point — the two cannot drift, and
 * the committed form has no key that could hold a signed address. `omit`/`extend`
 * preserve the strict object, so an attempt to smuggle `image` back in is an
 * unrecognised-key failure.
 */
export const SnapshotRowSchema = VendorCardRowSchema.omit({ image: true }).extend({
  imageKey: ImageKeySchema,
});

export type SnapshotRow = z.infer<typeof SnapshotRowSchema>;

/** One language's rows plus the row count the feed reported for that language. */
const LanguageSnapshotSchema = z.strictObject({
  rows: z.array(SnapshotRowSchema),
  total: z.number().int().nonnegative(),
});

/**
 * The committed mirror input: both languages in one file, each with the digest of its
 * serialized rows.
 *
 * `snapshotSha256` is what makes a re-run checkable: the projected rows must hash to
 * the same value on the next pull, and a digest that moves means either the vendor
 * changed the data or the projection stopped being stable. Both are findings, and
 * neither is visible from the rows alone.
 */
export const SnapshotFileSchema = z.strictObject({
  languages: z.strictObject({ en: LanguageSnapshotSchema, id: LanguageSnapshotSchema }),
  snapshotSha256: z.strictObject({ en: Sha256Schema, id: Sha256Schema }),
});

export type SnapshotFile = z.infer<typeof SnapshotFileSchema>;

/**
 * Rule 201.5.b's colour union as a runtime list, for the artifact schema.
 *
 * The engine's `CardColor` type is the source of truth; the `satisfies` clause rejects
 * an invented member here, and the test file asserts the list is complete, because a
 * schema that cannot name a colour would reject a card the engine can represent.
 */
const CARD_COLOR_VALUES = [
  'red',
  'yellow',
  'blue',
  'green',
  'orange',
  'purple',
] as const satisfies readonly CardColor[];

export const CardColorSchema = z.enum(CARD_COLOR_VALUES);

/**
 * The two card types the feed produces. `impact` is a Rush Point: placed on the
 * Timeline, with no colour, level, power or attack range. A third type is a schema
 * change and a deliberate one, not a row the mirror quietly treats as a character.
 */
export const CardTypeSchema = z.enum(['character', 'impact']);

export type CardType = z.infer<typeof CardTypeSchema>;

/**
 * Where an Indonesian text row's text came from: the vendor's own publication, or a
 * human-authored override from the committed override file. There is no `machine`
 * member — a machine translation would be citable as if it were authoritative text.
 */
export const CardTextProvenanceSchema = z.enum(['official', 'community']);

export type CardTextProvenance = z.infer<typeof CardTextProvenanceSchema>;

/**
 * How complete a card's Indonesian side is, as the index reports it — the card-level
 * status, not the row-level provenance above. `missing` is a real member here: a card
 * whose Indonesian row the vendor never published has no text row at all, and the
 * catalog must be able to say so rather than render a blank column.
 */
export const CardTranslationStatusSchema = z.enum(['official', 'community', 'missing']);

export type CardTranslationStatus = z.infer<typeof CardTranslationStatusSchema>;

/**
 * One row of the browsable index — one per canonical card number, never per printing.
 *
 * `color`, `level`, `power` and `attackRange` are nullable because every Rush Point row
 * leaves `attribute`, `level`, `power` and `attack_range` blank, and the engine's
 * `CardColor` union has no "none" member. A committed row must therefore be able to say
 * "this card has no colour" instead of being forced to choose one.
 *
 * `abilities` is checked against the engine's `ABILITIES` union rather than typed as a
 * free string: the feed prints `Double Attack` and `AIR STRIKE`, and those reach the
 * index only through the mapping table that translates them, so a raw vendor spelling
 * here is a failure.
 */
export const CardIndexRowSchema = z.strictObject({
  cardNo: CardNoSchema,
  nameKey: z.string().min(1),
  cardType: CardTypeSchema,
  nameEn: z.string().min(1),
  nameId: z.string().min(1).nullable(),
  color: CardColorSchema.nullable(),
  level: z.number().int().nullable(),
  power: z.number().int().nullable(),
  attackRange: z.number().int().nullable(),
  rarity: z.string().min(1),
  traits: z.array(z.string().min(1)),
  abilities: z.array(z.enum(ABILITIES)),
  setLabel: z.string().min(1),
  translationStatus: CardTranslationStatusSchema,
  imageKey: ImageKeySchema,
  printingCount: z.number().int().positive(),
});

export type CardIndexRow = z.infer<typeof CardIndexRowSchema>;

/**
 * The browsable index: the row list plus the content digest a saved version envelope
 * carries.
 *
 * The digest lives here and nowhere else, which is why it is excluded from its own
 * inputs — hashing a file that carries the hash would be circular.
 */
export const CardIndexSchema = z.strictObject({
  cardDataVersion: Sha256Schema,
  rows: z.array(CardIndexRowSchema),
});

export type CardIndex = z.infer<typeof CardIndexSchema>;

/** One card's English effect text and its staleness hash. */
export const CardTextEnRowSchema = z.strictObject({
  cardNo: CardNoSchema,
  text: z.string(),
  textHash: TextHashSchema,
});

export type CardTextEnRow = z.infer<typeof CardTextEnRowSchema>;

/**
 * The English text artifact.
 *
 * A row carries no `provenance` key: English text is never community-overridden, so a
 * constant field here would only invite drift — and the strict object makes its
 * appearance a parse failure rather than an ignored value.
 */
export const CardTextEnFileSchema = z.strictObject({ rows: z.array(CardTextEnRowSchema) });

export type CardTextEnFile = z.infer<typeof CardTextEnFileSchema>;

/** One card's Indonesian effect text, with where that text came from. */
export const CardTextIdRowSchema = z.strictObject({
  cardNo: CardNoSchema,
  text: z.string(),
  textHash: TextHashSchema,
  provenance: CardTextProvenanceSchema,
});

export type CardTextIdRow = z.infer<typeof CardTextIdRowSchema>;

/**
 * The Indonesian text artifact.
 *
 * A card the vendor never translated has no row here, so absence — never an empty
 * `text` — is how "unavailable" is represented. `text: ''` says something different:
 * the vendor published a row whose effect is blank.
 */
export const CardTextIdFileSchema = z.strictObject({ rows: z.array(CardTextIdRowSchema) });

export type CardTextIdFile = z.infer<typeof CardTextIdFileSchema>;

/**
 * One value repair: what the feed sent, what the rule made of it, and which named rule
 * fired. The raw value is retained so the repair reads as a change a reviewer can check
 * rather than as the value the mirror happened to produce.
 */
const CardValueRepairSchema = z.strictObject({
  kind: z.literal('value'),
  field: z.string().min(1),
  rawValue: z.string(),
  repairedValue: z.string(),
  rule: z.string().min(1),
});

/**
 * One canonical-effect decision for a card number whose printings disagree.
 *
 * The losing values travel with the choice: a divergent effect is a value-level
 * judgement about card text, so the record has to show what was not chosen as well as
 * what was.
 */
const CardCanonicalEffectSchema = z.strictObject({
  kind: z.literal('canonical-effect'),
  cardNo: CardNoSchema,
  chosenPrintingId: z.string().min(1),
  alternates: z.array(z.strictObject({ printingId: z.string().min(1), effect: z.string() })),
});

/** The repair audit trail: every repaired value plus every canonical-effect decision. */
export const CardRepairSchema = z.strictObject({
  rows: z.array(z.discriminatedUnion('kind', [CardValueRepairSchema, CardCanonicalEffectSchema])),
});

export type CardRepair = z.infer<typeof CardRepairSchema>;

/**
 * One value no rule could repair. `reason` is a stable code rather than prose: it is
 * what a reviewer reads to decide whether to write a rule or accept the value.
 */
const QuarantineEntrySchema = z.strictObject({
  field: z.string().min(1),
  rawValue: z.string(),
  reason: z.string().min(1),
});

/**
 * The quarantine list. An empty one is valid and expected — the file must be readable
 * when there is nothing to report — and a non-empty one is the build's business, not
 * the schema's: refusing the run is a gate decision, and each entry stays legible
 * either way. Keeping the two concerns apart is what lets the gate be the single place
 * that decides when unseen dirt stops a mirror.
 */
export const QuarantineFileSchema = z.strictObject({ rows: z.array(QuarantineEntrySchema) });

export type QuarantineFile = z.infer<typeof QuarantineFileSchema>;

/**
 * One committed image's provenance: the durable key, the source address *without* its
 * query string, and the fetched file's shape.
 *
 * The query string carries the signature and the expiry and is stripped before this row
 * is written, so `sourcePath` is the vendor origin plus pathname — enough to identify
 * the asset for a takedown, and useless as a signed address. A path that still carries
 * a query fails the parse rather than being committed.
 *
 * Success rows only: a fetch that failed has no row here, because this file's rows
 * describe files that exist. Per-image failures belong in the sync manifest.
 */
export const ProvenanceRowSchema = z.strictObject({
  imageKey: ImageKeySchema,
  sourcePath: z.string().min(1).refine((path) => !path.includes('?') && !path.includes('token='), {
    message: 'A provenance source path must be query-free (origin plus pathname only)',
  }),
  fetchedAt: z.iso.datetime(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().positive(),
});

export type ProvenanceRow = z.infer<typeof ProvenanceRowSchema>;

export const ProvenanceFileSchema = z.strictObject({ rows: z.array(ProvenanceRowSchema) });

export type ProvenanceFile = z.infer<typeof ProvenanceFileSchema>;

/**
 * One human-authored Indonesian effect text, keyed by canonical card number.
 *
 * This is the only way a community translation enters the mirror: a person supplies the
 * text, the pipeline never generates one. A row carrying no text at all is not a
 * translation, so blank and whitespace-only values are rejected here.
 */
const CommunityOverrideSchema = z.strictObject({
  cardNo: CardNoSchema,
  text: z.string().trim().min(1),
});

/**
 * The committed override input. An empty file is the expected shipping state: it exists
 * so that a translation has a home, not because one exists yet.
 */
export const CommunityOverrideFileSchema = z.strictObject({
  overrides: z.array(CommunityOverrideSchema),
});

export type CommunityOverrideFile = z.infer<typeof CommunityOverrideFileSchema>;

/**
 * One terminology pair: an English term and its Indonesian counterpart, both required
 * and both non-empty after trimming.
 *
 * The map is what lets a query written in either language reach the same cards, so a
 * half-empty pair would expand a search term to the empty string — a value that matches
 * everything, which is the opposite of a synonym.
 *
 * The optional `ruleKey` is the rule's stable first-seen number (a RuleKey) and is what a
 * glossary row deep-links to. This schema only checks that it is non-blank: membership in
 * the rules registry is asserted by `artifacts.test.ts`, because the schema must not import
 * the registry.
 */
const TermPairSchema = z.strictObject({
  en: z.string().trim().min(1),
  id: z.string().trim().min(1),
  ruleKey: z.string().trim().min(1).optional(),
});

/**
 * The committed term map. An empty pair list is schema-valid — the file ships as a seed
 * and grows — so "the map is not empty" is an assertion for the gate, not for this
 * schema.
 */
export const TermMapFileSchema = z.strictObject({ pairs: z.array(TermPairSchema) });

export type TermMapFile = z.infer<typeof TermMapFileSchema>;

/** One language's pull result: the rows actually received, against what the feed claimed. */
const ManifestLanguageSchema = z.strictObject({
  rows: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  pageCount: z.number().int().positive(),
});

/**
 * One image the sync could not fetch, with the failure it recorded. Failures travel in
 * the manifest because the provenance file's rows describe files that exist.
 */
const ManifestImageFailureSchema = z.strictObject({
  imageKey: ImageKeySchema,
  error: z.string().min(1),
});

/**
 * The sync manifest — the mirror's one place for the wall clock (`syncedAt`, the date
 * the catalog footer shows) and for per-image fetch results, including the failures a
 * tolerant run commits with.
 *
 * The key set is pinned here deliberately: this file is written by the network stage and
 * parsed strictly by the artifact gate, so a key added on one side and not the other is
 * a failure rather than a field that is silently ignored. It carries no URL of any
 * kind — not even the endpoint it was pulled from — which is what makes it safe for the
 * catalog to show its timestamp.
 *
 * `failureRate` is a fraction in `[0, 1]`, not a percentage: the manifest states a rate
 * so the "commit below the tolerance, refuse above it" decision is arithmetic on one
 * number.
 */
export const CardSyncManifestSchema = z.strictObject({
  syncedAt: z.iso.datetime(),
  languages: z.strictObject({ en: ManifestLanguageSchema, id: ManifestLanguageSchema }),
  snapshotSha256: z.strictObject({ en: Sha256Schema, id: Sha256Schema }),
  images: z.strictObject({
    requested: z.number().int().nonnegative(),
    fetched: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative(),
    failedKeys: z.array(ManifestImageFailureSchema),
    failureRate: z.number().min(0).max(1),
  }),
});

export type CardSyncManifest = z.infer<typeof CardSyncManifestSchema>;
