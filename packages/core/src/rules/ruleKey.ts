/**
 * Rule identity, in two tiers that must never be confused.
 *
 * A `RuleKey` is the machine identifier and is stable forever: it is the rule's
 * FIRST-SEEN display number, for example `301.19.b`. The v1.00 -> v1.03 revision
 * log records exactly one deletion (`301.7.c`) and no renumberings at all, so the
 * document's own editorial practice is that a number is never reused once it has
 * appeared. That practice is what lets the first-seen number double as the key,
 * and it removes the need for 484 hand-authored slugs.
 *
 * A *display number* is per-revision. `RuleRef` therefore pairs a key with the
 * revision it is being read under and carries the number that revision used for
 * it. Resolution is only ever `(key, revision) -> registry row`; a display number
 * is never re-derived from the shape of a key at runtime, and a hierarchy is never
 * parsed back out of a key (use the precomputed `children` instead).
 *
 * Both are branded so they cannot be passed for one another: handing a revision
 * string where a key is expected has to be a compile error rather than a citation
 * that silently points at the wrong rule.
 */

/** The stable machine identifier: the rule's first-seen display number. */
export type RuleKey = string & { readonly __brand: 'RuleKey' };

/** A rules revision identifier, for example `'1.03'`. */
export type RuleRevision = string & { readonly __brand: 'RuleRevision' };

/**
 * The single construction point for a `RuleKey`. It is deliberately a cast with
 * no validation: keys arrive from the generated registry, and the registry's own
 * `kind`/`section`/`children` gates are what prove a key is real. Validating here
 * would mean re-deriving structure from a key, which is the thing this module
 * exists to forbid.
 */
export const asRuleKey = (value: string): RuleKey => value as RuleKey;

/** The single construction point for a `RuleRevision`. */
export const asRuleRevision = (value: string): RuleRevision => value as RuleRevision;

/**
 * A citation: a key read under one revision, carrying that revision's display
 * number, the text hash observed for it, and its deep-link anchor. Constructed
 * only by the registry accessor, never by hand — an uncited verdict is meant to
 * be unrepresentable.
 */
export type RuleRef = {
  readonly key: RuleKey;
  readonly revision: RuleRevision;
  /** The display number this key had in this revision — may change between revisions. */
  readonly number: string;
  /** Staleness signal only: 12 pairs of v1.03 rules share byte-identical text. */
  readonly textHash: string;
  /** `'#' + number` — stable enough to be a shared deep link. */
  readonly anchor: string;
};
