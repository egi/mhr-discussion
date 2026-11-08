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
import * as BP01_011 from './BP01-011';
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
import * as BP01_022 from './BP01-022';
import * as BP01_023 from './BP01-023';
import * as BP01_026 from './BP01-026';
import * as BP01_028 from './BP01-028';
import * as BP01_030 from './BP01-030';
import * as BP01_032 from './BP01-032';
import * as BP01_033 from './BP01-033';
import * as BP01_034 from './BP01-034';
import * as BP01_035 from './BP01-035';
import * as BP01_037 from './BP01-037';
import * as BP01_038 from './BP01-038';
import * as BP01_039 from './BP01-039';
import * as BP01_040 from './BP01-040';
import * as BP01_041 from './BP01-041';
import * as BP01_042 from './BP01-042';
import * as BP01_043 from './BP01-043';
import * as BP01_045 from './BP01-045';
import * as BP01_047 from './BP01-047';
import * as BP01_048 from './BP01-048';
import * as BP01_050 from './BP01-050';
import * as BP01_051 from './BP01-051';
import * as BP01_052 from './BP01-052';
import * as BP01_053 from './BP01-053';
import * as BP01_054 from './BP01-054';
import * as BP01_057 from './BP01-057';
import * as BP01_059 from './BP01-059';
import * as BP01_060 from './BP01-060';
import * as BP01_061 from './BP01-061';
import * as BP01_063 from './BP01-063';
import * as BP01_065 from './BP01-065';
import * as BP01_066 from './BP01-066';
import * as BP01_069 from './BP01-069';
import * as BP01_070 from './BP01-070';
import * as BP01_072 from './BP01-072';
import * as BP01_073 from './BP01-073';
import * as BP01_074 from './BP01-074';
import * as BP01_077 from './BP01-077';
import * as BP01_078 from './BP01-078';
import * as BP01_081 from './BP01-081';
import * as BP01_085 from './BP01-085';
import * as BP01_087 from './BP01-087';
import * as BP01_090 from './BP01-090';
import * as BP01_091 from './BP01-091';
import * as BP01_092 from './BP01-092';
import * as BP01_093 from './BP01-093';
import * as BP01_095 from './BP01-095';
import * as BP01_096 from './BP01-096';
import * as BP01_099 from './BP01-099';
import * as BP01_102 from './BP01-102';
import * as BP01_103 from './BP01-103';
import * as BP01_104 from './BP01-104';
import * as BP01_105 from './BP01-105';
import * as BP01_106 from './BP01-106';
import * as BP01_107 from './BP01-107';
import * as BP01_108 from './BP01-108';
import * as BP01_109 from './BP01-109';
import * as BP01_111 from './BP01-111';
import * as BP01_112 from './BP01-112';
import * as BP01_113 from './BP01-113';
import * as BP01_114 from './BP01-114';
import * as BP01_116 from './BP01-116';
import * as BP01_118 from './BP01-118';
import * as BP01_119 from './BP01-119';
import * as BP01_120 from './BP01-120';
import * as EB01_006 from './EB01-006';
import * as EB01_007 from './EB01-007';
import * as EB01_008 from './EB01-008';
import * as EB01_009 from './EB01-009';
import * as EB01_010 from './EB01-010';
import * as EB01_012 from './EB01-012';
import * as EB01_013 from './EB01-013';
import * as PB01_001 from './PB01-001';
import * as PB01_002 from './PB01-002';
import * as PB01_003 from './PB01-003';
import * as PB01_005 from './PB01-005';
import * as PB01_007 from './PB01-007';
import * as PB01_009 from './PB01-009';
import * as PB01_010 from './PB01-010';
import * as PB01_011 from './PB01-011';
import * as SD01_001 from './SD01-001';
import * as SD01_003 from './SD01-003';
import * as SD01_005 from './SD01-005';
import * as SD01_006 from './SD01-006';
import * as SD01_007 from './SD01-007';
import * as SD01_009 from './SD01-009';
import * as SD01_010 from './SD01-010';
import * as SD01_014 from './SD01-014';
import * as SD01_015 from './SD01-015';
import * as SD01_016 from './SD01-016';
import * as SD01_018 from './SD01-018';
import * as SD02_005 from './SD02-005';
import * as SD02_008 from './SD02-008';
import * as SD02_006 from './SD02-006';
import * as SD02_007 from './SD02-007';
import * as SD02_009 from './SD02-009';
import * as SD02_010 from './SD02-010';
import * as SD02_011 from './SD02-011';
import * as SD02_014 from './SD02-014';
import * as SD02_015 from './SD02-015';
import * as SD02_016 from './SD02-016';
import * as SD02_017 from './SD02-017';
import * as SD03_001 from './SD03-001';
import * as SD03_002 from './SD03-002';
import * as SD03_003 from './SD03-003';
import * as SD03_005 from './SD03-005';
import * as SD03_006 from './SD03-006';
import * as SD03_007 from './SD03-007';
import * as SD03_008 from './SD03-008';
import * as SD03_009 from './SD03-009';
import * as SD03_010 from './SD03-010';
import * as SD03_016 from './SD03-016';
import * as SD03_017 from './SD03-017';
import * as SD03_018 from './SD03-018';
import * as SD04_001 from './SD04-001';
import * as SD04_002 from './SD04-002';
import * as SD04_003 from './SD04-003';
import * as SD04_004 from './SD04-004';
import * as SD04_005 from './SD04-005';
import * as SD04_006 from './SD04-006';
import * as SD04_007 from './SD04-007';
import * as SD04_008 from './SD04-008';
import * as SD04_009 from './SD04-009';
import * as SD04_011 from './SD04-011';
import * as SD04_014 from './SD04-014';
import * as SD04_015 from './SD04-015';
import * as SD04_017 from './SD04-017';
import * as SD04_018 from './SD04-018';
import * as SP01_001 from './SP01-001';
import * as SP01_004 from './SP01-004';
import * as SP01_006 from './SP01-006';
import * as SP01_008 from './SP01-008';
import * as SP01_010 from './SP01-010';
import * as SP01_039 from './SP01-039';
import * as SP01_012 from './SP01-012';
import * as SP01_014 from './SP01-014';
import * as SP01_015 from './SP01-015';
import * as SP01_016 from './SP01-016';
import * as SP01_020 from './SP01-020';
import * as SP01_021 from './SP01-021';
import * as SP01_022 from './SP01-022';
import * as SP01_023 from './SP01-023';
import * as SP01_025 from './SP01-025';
import * as SP01_030 from './SP01-030';
import * as SP01_031 from './SP01-031';
import * as SP01_032 from './SP01-032';
import * as SP01_034 from './SP01-034';
import * as SP01_035 from './SP01-035';
import * as SP01_038 from './SP01-038';
import * as SP01_050 from './SP01-050';
import * as SP01_042 from './SP01-042';
import * as SP01_043 from './SP01-043';
import * as SP01_048 from './SP01-048';
import * as SP01_062 from './SP01-062';

export const CARD_SCRIPTS: Readonly<Record<string, CardScript>> = {
  'BP01-002': BP01_002.script,
  'BP01-003': BP01_003.script,
  'BP01-005': BP01_005.script,
  'BP01-007': BP01_007.script,
  'BP01-008': BP01_008.script,
  'BP01-009': BP01_009.script,
  'BP01-010': BP01_010.script,
  'BP01-011': BP01_011.script,
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
  'BP01-022': BP01_022.script,
  'BP01-023': BP01_023.script,
  'BP01-026': BP01_026.script,
  'BP01-028': BP01_028.script,
  'BP01-030': BP01_030.script,
  'BP01-032': BP01_032.script,
  'BP01-033': BP01_033.script,
  'BP01-034': BP01_034.script,
  'BP01-035': BP01_035.script,
  'BP01-037': BP01_037.script,
  'BP01-038': BP01_038.script,
  'BP01-039': BP01_039.script,
  'BP01-040': BP01_040.script,
  'BP01-041': BP01_041.script,
  'BP01-042': BP01_042.script,
  'BP01-043': BP01_043.script,
  'BP01-045': BP01_045.script,
  'BP01-047': BP01_047.script,
  'BP01-048': BP01_048.script,
  'BP01-050': BP01_050.script,
  'BP01-051': BP01_051.script,
  'BP01-052': BP01_052.script,
  'BP01-053': BP01_053.script,
  'BP01-054': BP01_054.script,
  'BP01-057': BP01_057.script,
  'BP01-059': BP01_059.script,
  'BP01-060': BP01_060.script,
  'BP01-061': BP01_061.script,
  'BP01-063': BP01_063.script,
  'BP01-065': BP01_065.script,
  'BP01-066': BP01_066.script,
  'BP01-069': BP01_069.script,
  'BP01-070': BP01_070.script,
  'BP01-072': BP01_072.script,
  'BP01-073': BP01_073.script,
  'BP01-074': BP01_074.script,
  'BP01-077': BP01_077.script,
  'BP01-078': BP01_078.script,
  'BP01-081': BP01_081.script,
  'BP01-085': BP01_085.script,
  'BP01-087': BP01_087.script,
  'BP01-090': BP01_090.script,
  'BP01-091': BP01_091.script,
  'BP01-092': BP01_092.script,
  'BP01-093': BP01_093.script,
  'BP01-095': BP01_095.script,
  'BP01-096': BP01_096.script,
  'BP01-099': BP01_099.script,
  'BP01-102': BP01_102.script,
  'BP01-103': BP01_103.script,
  'BP01-104': BP01_104.script,
  'BP01-105': BP01_105.script,
  'BP01-106': BP01_106.script,
  'BP01-107': BP01_107.script,
  'BP01-108': BP01_108.script,
  'BP01-109': BP01_109.script,
  'BP01-111': BP01_111.script,
  'BP01-112': BP01_112.script,
  'BP01-113': BP01_113.script,
  'BP01-114': BP01_114.script,
  'BP01-116': BP01_116.script,
  'BP01-118': BP01_118.script,
  'BP01-119': BP01_119.script,
  'BP01-120': BP01_120.script,
  'EB01-006': EB01_006.script,
  'EB01-007': EB01_007.script,
  'EB01-008': EB01_008.script,
  'EB01-009': EB01_009.script,
  'EB01-010': EB01_010.script,
  'EB01-012': EB01_012.script,
  'EB01-013': EB01_013.script,
  'PB01-001': PB01_001.script,
  'PB01-002': PB01_002.script,
  'PB01-003': PB01_003.script,
  'PB01-005': PB01_005.script,
  'PB01-007': PB01_007.script,
  'PB01-009': PB01_009.script,
  'PB01-010': PB01_010.script,
  'PB01-011': PB01_011.script,
  'SD01-001': SD01_001.script,
  'SD01-003': SD01_003.script,
  'SD01-005': SD01_005.script,
  'SD01-006': SD01_006.script,
  'SD01-007': SD01_007.script,
  'SD01-009': SD01_009.script,
  'SD01-010': SD01_010.script,
  'SD01-014': SD01_014.script,
  'SD01-015': SD01_015.script,
  'SD01-016': SD01_016.script,
  'SD01-018': SD01_018.script,
  'SD02-005': SD02_005.script,
  'SD02-006': SD02_006.script,
  'SD02-007': SD02_007.script,
  'SD02-008': SD02_008.script,
  'SD02-009': SD02_009.script,
  'SD02-010': SD02_010.script,
  'SD02-011': SD02_011.script,
  'SD02-014': SD02_014.script,
  'SD02-015': SD02_015.script,
  'SD02-016': SD02_016.script,
  'SD02-017': SD02_017.script,
  'SD03-001': SD03_001.script,
  'SD03-002': SD03_002.script,
  'SD03-003': SD03_003.script,
  'SD03-005': SD03_005.script,
  'SD03-006': SD03_006.script,
  'SD03-007': SD03_007.script,
  'SD03-008': SD03_008.script,
  'SD03-009': SD03_009.script,
  'SD03-010': SD03_010.script,
  'SD03-016': SD03_016.script,
  'SD03-017': SD03_017.script,
  'SD03-018': SD03_018.script,
  'SD04-001': SD04_001.script,
  'SD04-002': SD04_002.script,
  'SD04-003': SD04_003.script,
  'SD04-004': SD04_004.script,
  'SD04-005': SD04_005.script,
  'SD04-006': SD04_006.script,
  'SD04-007': SD04_007.script,
  'SD04-008': SD04_008.script,
  'SD04-009': SD04_009.script,
  'SD04-011': SD04_011.script,
  'SD04-014': SD04_014.script,
  'SD04-015': SD04_015.script,
  'SD04-017': SD04_017.script,
  'SD04-018': SD04_018.script,
  'SP01-001': SP01_001.script,
  'SP01-004': SP01_004.script,
  'SP01-006': SP01_006.script,
  'SP01-008': SP01_008.script,
  'SP01-010': SP01_010.script,
  'SP01-012': SP01_012.script,
  'SP01-014': SP01_014.script,
  'SP01-015': SP01_015.script,
  'SP01-016': SP01_016.script,
  'SP01-020': SP01_020.script,
  'SP01-021': SP01_021.script,
  'SP01-022': SP01_022.script,
  'SP01-023': SP01_023.script,
  'SP01-025': SP01_025.script,
  'SP01-030': SP01_030.script,
  'SP01-031': SP01_031.script,
  'SP01-032': SP01_032.script,
  'SP01-034': SP01_034.script,
  'SP01-035': SP01_035.script,
  'SP01-038': SP01_038.script,
  'SP01-039': SP01_039.script,
  'SP01-042': SP01_042.script,
  'SP01-043': SP01_043.script,
  'SP01-048': SP01_048.script,
  'SP01-050': SP01_050.script,
  'SP01-062': SP01_062.script,
};
