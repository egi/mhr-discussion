#!/usr/bin/env node
// Fails when anything under packages/ references card data or loads files at runtime.
// Plain Node, no dependencies. `--self-test` proves the detector flags a violating sample
// and spares a clean one.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const FORBIDDEN = ['text.en.json', 'data/cards', 'janime', 'marvelherorush'];
const NODE_IMPORT = /(?:from\s+|import\s*\(\s*|require\s*\(\s*|import\s+)['"]node:/;

/** Exempt from the node: import rule (tests and the vitest config run under Node). */
function allowsNode(file) {
  return /\.test\.ts$/.test(file) || /(^|\/)vitest\.config\.ts$/.test(file);
}

/** Returns the violations of one file as `{ line, reason }` records. */
export function scanText(file, text) {
  const found = [];
  const lines = text.split('\n');
  lines.forEach((content, index) => {
    for (const needle of FORBIDDEN) {
      if (content.toLowerCase().includes(needle)) {
        found.push({ line: index + 1, reason: `contains "${needle}"` });
      }
    }
    if (file.endsWith('.ts') && !allowsNode(file) && NODE_IMPORT.test(content)) {
      found.push({ line: index + 1, reason: 'imports a node: module' });
    }
  });
  return found;
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function selfTest() {
  const flagged = scanText('packages/x/src/a.ts', "import { readFileSync } from 'node:fs';\nconst p = 'data/cards/text.en.json';\n");
  const clean = scanText('packages/x/src/b.ts', "import { z } from 'zod';\nexport const a = z.string();\n");
  if (flagged.length === 0 || clean.length !== 0) {
    console.error('NO_CARD_DATA_SELF_TEST_FAILED');
    process.exit(1);
  }
  console.log('no-card-data self-test ok');
}

function main() {
  if (process.argv.includes('--self-test')) {
    selfTest();
    return;
  }
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const files = walk(join(root, 'packages'), []);
  const violations = [];
  for (const file of files) {
    const rel = relative(root, file);
    if (!/\.(ts|tsx|js|mjs|cjs|json)$/.test(file)) continue;
    for (const v of scanText(rel, readFileSync(file, 'utf8'))) {
      violations.push(`${rel}:${v.line} ${v.reason}`);
    }
  }
  console.log(`scanned ${files.length} files under packages/`);
  if (violations.length > 0) {
    console.error(`NO_CARD_DATA_VIOLATION\n${violations.join('\n')}`);
    process.exit(1);
  }
  console.log('no-card-data ok');
}

main();
