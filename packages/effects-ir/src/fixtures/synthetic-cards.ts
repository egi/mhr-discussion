/**
 * Invented cards for tests. Names, stats and numbers are made up and correspond to no
 * real card; the `TS01` product prefix satisfies the canonical card-number format so the
 * values can be branded with `asCardNo`. Colours are the values `CardColor` allows.
 */

import { asCardNo, type CardColor, type CardNo } from '@mhr/core';

export type SyntheticCard = {
  readonly cardNo: CardNo;
  readonly name: string;
  readonly color: CardColor;
  readonly level: number;
  readonly power: number;
  readonly feature: string;
};

export const SYNTHETIC_CARDS: readonly SyntheticCard[] = [
  { cardNo: asCardNo('TS01-001'), name: 'Test Hero Alpha', color: 'red', level: 0, power: 1000, feature: 'Tester' },
  { cardNo: asCardNo('TS01-002'), name: 'Test Hero Beta', color: 'blue', level: 1, power: 3000, feature: 'Tester' },
  { cardNo: asCardNo('TS01-003'), name: 'Test Hero Gamma', color: 'green', level: 2, power: 5000, feature: 'Prototype' },
  { cardNo: asCardNo('TS01-004'), name: 'Test Hero Delta', color: 'yellow', level: 3, power: 7000, feature: 'Prototype' },
  { cardNo: asCardNo('TS01-005'), name: 'Test Hero Epsilon', color: 'orange', level: 1, power: 4000, feature: 'Tester' },
  { cardNo: asCardNo('TS01-006'), name: 'Test Hero Zeta', color: 'purple', level: 2, power: 6000, feature: 'Prototype' },
];
