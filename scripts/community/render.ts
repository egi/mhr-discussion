/** Markdown job summary for the consistency report. */

import type { Report } from './evaluate';

export const renderSummary = (report: Report): string => {
  const t = report.totals;
  const lines: string[] = [
    '## Script consistency report',
    '',
    `Rules revision: ${report.revision ?? 'unknown'}`,
    '',
    `Undeclared scripts: ${t.undeclared}`,
    '',
    `Scripts: ${t.scripts}, declared: ${t.declared}, with hash drift: ${t.withDrift}, flagged by open rulings: ${t.withRulingFlags}, failing: ${t.failing}`,
    '',
  ];
  const rows = report.scripts.filter((s) => s.flags.length > 0 || s.failures.length > 0);
  if (rows.length > 0) {
    lines.push('| Card | Failures | Flags |', '|---|---|---|');
    for (const s of rows) {
      lines.push(`| ${s.cardNo} | ${s.failures.join(', ') || '-'} | ${s.flags.join(', ') || '-'} |`);
    }
    lines.push('');
  }
  return lines.join('\n');
};
