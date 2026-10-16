/** Parses the rule-key snapshot into a lookup of current text hashes. */

import { z } from 'zod';

export type Snapshot = Map<string, { revision: string; textHash: string }>;

const EntrySchema = z.object({
  ruleKey: z.string().min(1),
  revision: z.string().min(1),
  textHash: z.string().regex(/^[0-9a-f]{12}$/),
});

const SnapshotSchema = z.array(EntrySchema);

/** Validates the parsed JSON and indexes it by rule key. Identical hashes across keys are fine. */
export const parseSnapshot = (input: unknown): Snapshot => {
  const entries = SnapshotSchema.parse(input);
  const snapshot: Snapshot = new Map();
  for (const entry of entries) {
    snapshot.set(entry.ruleKey, { revision: entry.revision, textHash: entry.textHash });
  }
  return snapshot;
};
