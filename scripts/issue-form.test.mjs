import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const templateDir = join(root, '.github', 'ISSUE_TEMPLATE');
const formPath = join(templateDir, 'challenge.yml');
const form = existsSync(formPath) ? readFileSync(formPath, 'utf8') : '';

describe('challenge issue form', () => {
  it('exists', () => {
    expect(existsSync(formPath)).toBe(true);
  });

  it('carries the challenge label', () => {
    expect(form).toMatch(/^labels:\s*\[\s*"challenge"\s*\]/m);
  });

  it.each(['card-number', 'rule', 'script-behavior', 'disagreement', 'evidence', 'no-private-data'])(
    'declares the %s field',
    (id) => {
      expect(form).toMatch(new RegExp(`^\\s+id: ${id}$`, 'm'));
    },
  );

  it('marks at least five fields required', () => {
    expect((form.match(/required: true/g) ?? []).length).toBeGreaterThanOrEqual(5);
  });

  it('warns against private chat and card text', () => {
    expect(form).toMatch(/private chat/i);
    expect(form).toMatch(/card text/i);
  });

  it('does not add a config.yml, which would break the blank takedown issue path', () => {
    expect(existsSync(join(templateDir, 'config.yml'))).toBe(false);
  });

  it('has no workflow reacting to issues or the issue templates', () => {
    const dir = join(root, '.github', 'workflows');
    const files = existsSync(dir) ? readdirSync(dir) : [];
    for (const f of files) {
      const text = readFileSync(join(dir, f), 'utf8');
      expect(text, f).not.toMatch(/ISSUE_TEMPLATE/);
      expect(text, f).not.toMatch(/^\s*issues:/m);
      expect(text, f).not.toMatch(/^\s*issue_comment:/m);
    }
  });
});
