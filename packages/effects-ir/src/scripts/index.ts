/**
 * The manifest of authored card scripts: one entry per file in this directory.
 *
 * This is a plain object literal of direct imports, not `import.meta.glob`. A glob resolves
 * under Vite and Vitest but throws under plain `tsx`/`node`, and the coverage build script has
 * to enumerate scripted card numbers from Node. A literal manifest reads identically from the
 * app bundle, a test and a Node script.
 *
 * Adding a card: write `src/scripts/<CARD-NO>.ts` exporting `CARD_NO` and `script`, then
 * append ONE entry below, keyed by the card number. Every card-authoring change must do this.
 * Parallel authoring changes will all edit this one file; that is the accepted merge-conflict
 * point. Resolve it by combining the entries from both sides, never by dropping one.
 * `registry.test.ts` fails if a script file has no entry here, or an entry has no file.
 */
import type { CardScript } from '../ir';
import * as BP01_002 from './BP01-002';
import * as BP01_003 from './BP01-003';
import * as BP01_005 from './BP01-005';
import * as BP01_007 from './BP01-007';
import * as BP01_008 from './BP01-008';
import * as BP01_009 from './BP01-009';
import * as BP01_010 from './BP01-010';
import * as BP01_012 from './BP01-012';
import * as BP01_013 from './BP01-013';
import * as BP01_014 from './BP01-014';
import * as BP01_015 from './BP01-015';
import * as BP01_016 from './BP01-016';
import * as BP01_017 from './BP01-017';
import * as BP01_018 from './BP01-018';
import * as BP01_019 from './BP01-019';
import * as BP01_020 from './BP01-020';
import * as BP01_021 from './BP01-021';
import * as BP01_026 from './BP01-026';
import * as BP01_028 from './BP01-028';
import * as BP01_030 from './BP01-030';
import * as BP01_032 from './BP01-032';
import * as BP01_033 from './BP01-033';
import * as BP01_034 from './BP01-034';
import * as BP01_039 from './BP01-039';
import * as BP01_042 from './BP01-042';
import * as BP01_050 from './BP01-050';
import * as BP01_053 from './BP01-053';
import * as BP01_059 from './BP01-059';
import * as BP01_060 from './BP01-060';
import * as BP01_061 from './BP01-061';
import * as BP01_065 from './BP01-065';
import * as BP01_066 from './BP01-066';
import * as BP01_074 from './BP01-074';
import * as BP01_077 from './BP01-077';
import * as BP01_085 from './BP01-085';
import * as BP01_087 from './BP01-087';
import * as BP01_106 from './BP01-106';
import * as BP01_109 from './BP01-109';
import * as BP01_111 from './BP01-111';
import * as BP01_112 from './BP01-112';
import * as BP01_114 from './BP01-114';
import * as BP01_118 from './BP01-118';
import * as BP01_119 from './BP01-119';
import * as EB01_008 from './EB01-008';
import * as EB01_010 from './EB01-010';
import * as EB01_012 from './EB01-012';
import * as EB01_013 from './EB01-013';
import * as SD01_007 from './SD01-007';
import * as SD01_018 from './SD01-018';
import * as SD02_005 from './SD02-005';
import * as SD02_008 from './SD02-008';
import * as SD02_010 from './SD02-010';
import * as SD02_016 from './SD02-016';
import * as SD02_017 from './SD02-017';
import * as SD03_003 from './SD03-003';
import * as SD03_005 from './SD03-005';
import * as SD03_008 from './SD03-008';
import * as SD03_009 from './SD03-009';
import * as SD03_018 from './SD03-018';
import * as SD04_002 from './SD04-002';
import * as SD04_004 from './SD04-004';
import * as SD04_006 from './SD04-006';
import * as SD04_007 from './SD04-007';
import * as SD04_011 from './SD04-011';
import * as SD04_014 from './SD04-014';
import * as SD04_015 from './SD04-015';
import * as SP01_016 from './SP01-016';
import * as SP01_043 from './SP01-043';
import * as SP01_048 from './SP01-048';

export const CARD_SCRIPTS: Readonly<Record<string, CardScript>> = {
  'BP01-002': BP01_002.script,
  'BP01-003': BP01_003.script,
  'BP01-005': BP01_005.script,
  'BP01-007': BP01_007.script,
  'BP01-008': BP01_008.script,
  'BP01-009': BP01_009.script,
  'BP01-010': BP01_010.script,
  'BP01-012': BP01_012.script,
  'BP01-013': BP01_013.script,
  'BP01-014': BP01_014.script,
  'BP01-015': BP01_015.script,
  'BP01-016': BP01_016.script,
  'BP01-017': BP01_017.script,
  'BP01-018': BP01_018.script,
  'BP01-019': BP01_019.script,
  'BP01-020': BP01_020.script,
  'BP01-021': BP01_021.script,
  'BP01-026': BP01_026.script,
  'BP01-028': BP01_028.script,
  'BP01-030': BP01_030.script,
  'BP01-032': BP01_032.script,
  'BP01-033': BP01_033.script,
  'BP01-034': BP01_034.script,
  'BP01-039': BP01_039.script,
  'BP01-042': BP01_042.script,
  'BP01-050': BP01_050.script,
  'BP01-053': BP01_053.script,
  'BP01-059': BP01_059.script,
  'BP01-060': BP01_060.script,
  'BP01-061': BP01_061.script,
  'BP01-065': BP01_065.script,
  'BP01-066': BP01_066.script,
  'BP01-074': BP01_074.script,
  'BP01-077': BP01_077.script,
  'BP01-085': BP01_085.script,
  'BP01-087': BP01_087.script,
  'BP01-106': BP01_106.script,
  'BP01-109': BP01_109.script,
  'BP01-111': BP01_111.script,
  'BP01-112': BP01_112.script,
  'BP01-114': BP01_114.script,
  'BP01-118': BP01_118.script,
  'BP01-119': BP01_119.script,
  'EB01-008': EB01_008.script,
  'EB01-010': EB01_010.script,
  'EB01-012': EB01_012.script,
  'EB01-013': EB01_013.script,
  'SD01-007': SD01_007.script,
  'SD01-018': SD01_018.script,
  'SD02-005': SD02_005.script,
  'SD02-008': SD02_008.script,
  'SD02-010': SD02_010.script,
  'SD02-016': SD02_016.script,
  'SD02-017': SD02_017.script,
  'SD03-003': SD03_003.script,
  'SD03-005': SD03_005.script,
  'SD03-008': SD03_008.script,
  'SD03-009': SD03_009.script,
  'SD03-018': SD03_018.script,
  'SD04-002': SD04_002.script,
  'SD04-004': SD04_004.script,
  'SD04-006': SD04_006.script,
  'SD04-007': SD04_007.script,
  'SD04-011': SD04_011.script,
  'SD04-014': SD04_014.script,
  'SD04-015': SD04_015.script,
  'SP01-016': SP01_016.script,
  'SP01-043': SP01_043.script,
  'SP01-048': SP01_048.script,
};
