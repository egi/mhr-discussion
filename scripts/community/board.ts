/** Parses the public status board (`discussions/00-README.md`) into rows keyed by discussion id. */

import { z } from 'zod';

export const MARKS = [
  'RESOLVED',
  'HEAD-JUDGE',
  'CONSENSUS',
  'ESCALATE-OPEN',
  'ESCALATE',
  'WITHHELD',
] as const;

export type Mark = (typeof MARKS)[number];

export type BoardRow = { id: string; file: string; mark: Mark; detail: string };

export class BoardUnreadableError extends Error {
  readonly code = 'BOARD_UNREADABLE';
}

const RowSchema = z.object({
  id: z.string().regex(/^\d+$/),
  file: z.string().min(1),
  status: z.string().min(1),
});

const cells = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

const isSeparator = (line: string): boolean => /^\|?\s*:?-{3,}/.test(line.trim());

/** ESCALATE-OPEN is listed before ESCALATE so the longer mark wins. */
const markOf = (status: string): Mark | undefined => {
  const first = status.split(/[\s(]/)[0] ?? '';
  return MARKS.find((mark) => mark === first);
};

export const parseBoard = (text: string): Map<string, BoardRow> => {
  const lines = text.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => {
    const c = cells(line);
    return line.trim().startsWith('|') && c[0] === '#' && c[1] === 'File' && c[2] === 'Status';
  });
  if (headerIndex < 0) {
    throw new BoardUnreadableError('status table header "| # | File | Status |" not found');
  }
  const rows = new Map<string, BoardRow>();
  for (let i = headerIndex + 1; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    if (!line.trim().startsWith('|')) break;
    if (isSeparator(line)) continue;
    const c = cells(line);
    const parsed = RowSchema.safeParse({ id: c[0], file: c[1], status: c[2] });
    if (!parsed.success) {
      throw new BoardUnreadableError(`malformed board row: ${line.trim()}`);
    }
    const { id, file, status } = parsed.data;
    const mark = markOf(status);
    if (mark === undefined) {
      throw new BoardUnreadableError(`row ${id} has unknown status mark: ${status}`);
    }
    if (mark === 'WITHHELD' && status !== 'WITHHELD') {
      throw new BoardUnreadableError(`row ${id} WITHHELD must be the whole status cell`);
    }
    const key = id.padStart(2, '0');
    if (rows.has(key)) throw new BoardUnreadableError(`duplicate board row ${key}`);
    rows.set(key, { id: key, file, mark, detail: status });
  }
  return rows;
};
