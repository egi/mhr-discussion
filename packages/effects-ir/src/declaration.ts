/**
 * The typed declaration a card script exports to say which rules it was written against
 * and which community rulings it implements.
 *
 * - Status of a ruling is read from the public status board by CI and is never stored
 *   here, so a declaration cannot drift from the board.
 * - `reviewedHash` is the `textHash` from `rules/rule-key-snapshot.json` at the time a
 *   human re-read the rule. When the rule text changes, the hash no longer matches and
 *   the consistency report flags the script for review.
 * - Every script is expected to declare at least one rule. The schema accepts an empty
 *   list; the consistency report reports it separately.
 * - A declaration holds keys, hashes and discussion ids only, never rule or card text.
 */

import type { RuleKey } from '@mhr/core';
import { z } from 'zod';

/** A rule a script depends on, paired with the hash of the text a human last reviewed. */
export type DeclaredRule = {
  readonly key: RuleKey;
  readonly reviewedHash: string;
};

/** A link from a public discussion (two-digit id, for example `'05'`) to a declared rule. */
export type RulingLink = {
  readonly discussion: string;
  readonly rule: RuleKey;
};

export type RuleDeclaration = {
  readonly rules: readonly DeclaredRule[];
  readonly rulings: readonly RulingLink[];
};

const DeclaredRuleSchema = z
  .object({
    key: z.string().min(1),
    reviewedHash: z.string().regex(/^[0-9a-f]{12}$/),
  })
  .strict();

const RulingLinkSchema = z
  .object({
    discussion: z.string().regex(/^\d{2}$/),
    rule: z.string().min(1),
  })
  .strict();

export const RuleDeclarationSchema = z
  .object({
    rules: z.array(DeclaredRuleSchema),
    rulings: z.array(RulingLinkSchema),
  })
  .strict()
  .superRefine((declaration, ctx) => {
    const seen = new Set<string>();
    declaration.rules.forEach((rule, index) => {
      if (seen.has(rule.key)) {
        ctx.addIssue({
          code: 'custom',
          message: `duplicate rule key ${rule.key}`,
          path: ['rules', index, 'key'],
        });
      }
      seen.add(rule.key);
    });
  });

/** Identity helper that type-checks a script's declaration at its definition site. */
export const declareRules = (declaration: RuleDeclaration): RuleDeclaration => declaration;
