/**
 * Card identity.
 *
 * Two identity concepts live side by side here and must never be conflated:
 *
 * - `CardNo` is *data* identity — the normalized card number, e.g. `BP01-005`.
 *   It is what a share link and the engine reference. The vendor feed's own `id`
 *   column cannot serve as identity: it is per-printing, so an English row and an
 *   Indonesian row of the same card carry different `id` values.
 * - `nameKey` is *rules* identity. Rule 201.7.c makes the name "the sole basis for
 *   distinguishing different cards", 101.1.d caps a deck at 3 copies per name, and
 *   305.6 makes UNIQUE a name test. Names are not language-stable (the same card
 *   number can carry divergent EN and ID names), so the key is language-independent.
 *
 * The split between `CardDefinition` and `Printing` exists to keep the two apart: a
 * definition is the card as a *rules object*, a printing is one physical, language-
 * specific record of it.
 */
import { z } from 'zod';

/**
 * The card-number format as observed in the vendor feed: two product letters, a
 * two-digit product number, a separator, and a three-digit card number.
 *
 * Exported so the state boundary schema can enforce the same single source of truth
 * rather than restating the pattern.
 *
 * Deliberately not a global regex: a `g`-flagged pattern carries `lastIndex` state
 * across `.test()` calls, which would make `isCardNo` results depend on call order.
 */
export const CARD_NO_PATTERN = /^[A-Z]{2}[0-9]{2}-[0-9]{3}$/;

/**
 * Normalize a raw feed value into canonical card-number form.
 *
 * Three mechanical steps, in order: trim the ends, uppercase, and collapse whitespace
 * around the separator. The observed dirty feed values are trailing spaces
 * (`"BP01-096 "`) and embedded newlines (`"SP01-046\n"`), both of which the trim
 * handles.
 *
 * This is deliberately *mechanical* normalization only. Repairing OCR-class
 * confusions (the feed also contains `"SPO1-001"`, a letter-O typo for `"SP01-001"`)
 * is an ETL concern that belongs to the build-time mirror, which keeps the raw value
 * for provenance. Silently rewriting characters here would let the engine accept a
 * card number no card actually has. Note that such a typo is *rejected* by
 * {@link isCardNo} rather than repaired, which is the point: the mirror must decide
 * explicitly what a dirty value meant.
 *
 * Returns `string` rather than `CardNo` on purpose: a value only becomes an identity
 * once it has been asserted valid. Pass the result through {@link asCardNo}.
 */
export function normalizeCardNo(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s*-\s*/g, '-');
}

/**
 * Is this value already a canonical card number?
 *
 * Strict: the value is tested exactly as given, with no normalization applied. Call
 * {@link normalizeCardNo} first if the input may be a raw feed value. Keeping the two
 * separate is what lets the mirror pipeline detect and report dirty data instead of
 * having a dirty value silently pass as clean.
 */
export function isCardNo(value: string): boolean {
  return CARD_NO_PATTERN.test(value);
}

/**
 * The card-number schema — the single definition site for the identity format.
 *
 * The brand is minted by zod rather than by a hand-written `{ __brand }` intersection
 * type. That is deliberate: the state boundary is parsed by zod, and a hand-rolled
 * intersection is a *different* type from zod's branded output, so `parseGameState`
 * could not return a `GameState` without a cast. A cast at the trust boundary is
 * exactly the thing this schema exists to avoid. Minting the brand here also means one
 * place decides what a card number is.
 *
 * The format check comes first, so only a value that passes is branded. A raw `string`
 * is not assignable to the resulting type.
 *
 * `z.string()` + `.refine()` rather than a transform or `z.custom`: a transform or a
 * custom type cannot be represented by `z.toJSONSchema`, which the state-boundary
 * module exports for community tooling.
 */
export const CardNoSchema = z
  .string()
  .refine(isCardNo, { message: 'Not a canonical card number (expected e.g. "BP01-005")' })
  .brand<'CardNo'>();

/**
 * A normalized card number — the canonical identity. Derived from
 * {@link CardNoSchema} so the type cannot drift from the validator.
 */
export type CardNo = z.infer<typeof CardNoSchema>;

/**
 * Mint a {@link CardNo} from a value that must already be canonical.
 *
 * Throws rather than casting, so an invalid identity is a loud failure at the one
 * door that mints brands. Normalize first if the input is a raw feed value.
 */
export function asCardNo(value: string): CardNo {
  if (!isCardNo(value)) {
    throw new Error(`INVALID_CARD_NO: ${JSON.stringify(value)}`);
  }
  return value as CardNo;
}

/** A card's colour. Rule 201.5.b. */
export type CardColor = 'red' | 'yellow' | 'blue' | 'green' | 'orange' | 'purple';

/**
 * A localized string pair. `id` is `null` when the Indonesian row is genuinely absent
 * or blank in the feed — never a machine translation, which would be citable as if it
 * were authoritative text.
 */
export type LocalizedText = {
  readonly en: string;
  readonly id: string | null;
};

/**
 * One physical printing of a card: a language-specific record from the vendor feed.
 *
 * A printing is display/lookup data. It never appears in engine state and never in a
 * share link — the `printingId` here is the vendor's own per-language `id`, which is
 * unstable across languages. Confine it to this type: do not add it to
 * {@link CardDefinition} or {@link CardInstance}, and do not add a field of this shape
 * to either. Doing so would put a language-specific vendor identifier into the wire
 * format, where it could not survive a language switch.
 */
export type Printing = {
  /** The vendor feed's `id`. Language-specific; display and lookup only. */
  readonly printingId: string;
  readonly cardNo: CardNo;
  readonly language: 'en' | 'id';
  readonly setLabel: string;
  /**
   * A key into a runtime image cache — never a signed image address. The feed's signed
   * addresses expire, and mirroring the images is an IP risk the project has ruled out.
   */
  readonly imageKey?: string;
};

/**
 * A card as a *rules object*. Identity is the normalized card number.
 *
 * No image address belongs on this type, for the reasons given on
 * {@link Printing.imageKey}. No derived characteristic belongs here either: effective
 * Lv is computed from `faceDown` at read time (301.21.g), not stored.
 */
export type CardDefinition = {
  /** Canonical identity. See {@link CardNo}. */
  readonly cardNo: CardNo;
  /**
   * The rules-identity key — the card's name, made language-independent.
   *
   * Rule 201.7.c: a Character's name is "the sole basis for distinguishing different
   * cards". 101.1.d caps a deck at 3 copies per name, and 305.6 makes UNIQUE a name
   * test, so both read this key rather than {@link cardNo}.
   *
   * Required from the start because it cannot be added later without touching every
   * check that reads a name. The *derivation* from the feed's canonical EN name (and
   * its collision report) is Phase 2 work; the feed's 352 card numbers collapse to
   * 272 English names, so this is a real many-to-one key and not an alias.
   */
  readonly nameKey: string;
  readonly name: LocalizedText;
  readonly text: LocalizedText;
  /** Rule 201.5.b. */
  readonly color: CardColor;
  /** Rule 201.6.b. */
  readonly level: number;
  readonly rarity: string;
  /** Rule 201.12; a minimum of 0 per 301.8.a. */
  readonly power: number;
  /**
   * Ability names as printed on the card. The closed set of six *named* abilities the
   * rules define — COUNTER, BLOCK, DOUBLE ATTACK, ASSAULT, AIR-ATTACK, UNIQUE (305) —
   * is modelled separately as the `Ability` union in `state/gameState.ts`.
   */
  readonly abilities: readonly string[];
};

/**
 * A physical card in a game. Source facts only: no definition object, and no derived
 * value.
 *
 * The instance carries `cardNo` and `nameKey` as plain keys rather than embedding a
 * {@link CardDefinition}, which keeps state small and directly serializable.
 */
export type CardInstance = {
  /** Per-game instance id. Identifies *this* physical card, not the card it depicts. */
  readonly iid: number;
  readonly cardNo: CardNo;
  /**
   * PLACED FACT, copied from the definition at instantiation — source state, never
   * derived.
   *
   * It is stored here deliberately. The deck-construction limit (3 copies per name,
   * 101.1.d) and the UNIQUE test (305.6) must be computable from the instance alone;
   * a derivation would need a card-definition lookup the engine does not have, and
   * would break the moment a card's definition is unavailable. Do not "normalize" this
   * field away into a lookup.
   */
  readonly nameKey: string;
  /**
   * Rule 301.21.g: a face-down card is treated as a single Lv1 card. That effective
   * level is DERIVED at read time, never stored — a stored copy would be a second
   * source of truth that desynchronizes the first time a card is flipped.
   */
  readonly faceDown: boolean;
  /**
   * Attached cards, in attachment order. An ORDERED array, never a set: 301.25.m
   * requires cards to be stacked underneath their host in the order they were
   * attached, and 301.25.n forbids reordering. That order is semantically meaningful
   * and must survive serialization.
   */
  readonly attached: CardInstance[];
};
