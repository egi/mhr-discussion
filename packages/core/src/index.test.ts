/**
 * The shared leaf's public surface, asserted rather than assumed.
 *
 * Runtime names are written out literally, so a removal or an unplanned addition fails
 * here instead of surprising a consumer. The type-only exports are checked by
 * `CoreTypeSurface`, which stops compiling if a named type disappears. Nothing stateful
 * or engine-bound may appear: core holds keys, codes and shapes only.
 */
import { describe, expect, it } from 'vitest';

import * as core from './index';

const RUNTIME_EXPORTS = [
  // card identity
  'asCardNo',
  'CARD_NO_PATTERN',
  'CardNoSchema',
  'isCardNo',
  'normalizeCardNo',
  // card schemas
  'CardColorSchema',
  'CardIndexRowSchema',
  'CardIndexSchema',
  'CardRepairSchema',
  'CardSyncManifestSchema',
  'CardTextEnFileSchema',
  'CardTextEnRowSchema',
  'CardTextIdFileSchema',
  'CardTextIdRowSchema',
  'CardTextProvenanceSchema',
  'CardTranslationStatusSchema',
  'CardTypeSchema',
  'CommunityOverrideFileSchema',
  'ProvenanceFileSchema',
  'ProvenanceRowSchema',
  'QuarantineFileSchema',
  'SnapshotFileSchema',
  'SnapshotRowSchema',
  'TermMapFileSchema',
  'VendorCardRowSchema',
  'VendorEnvelopeSchema',
  'VendorErrorEnvelopeSchema',
  // state
  'ABILITIES',
  'GAME_STATE_LIMITS',
  'limitsForTurn',
  'PHASE_ORDER',
  'PLAYER_IDS',
  'ZONE_NAMES',
  'MODIFIER_LIFETIMES',
  'MODIFIER_MODES',
  'MODIFIER_STATS',
  'BATTLE_SLOT_NAMES',
  // rules vocabulary
  'asRuleKey',
  'asRuleRevision',
  'accept',
  'DiagnosticCodeSchema',
  'reject',
] as const;

/** Engine-only or stateful names that must never be reachable through core. */
const FORBIDDEN_NAMES = [
  'nextEffectSeq',
  'expireModifiers',
  'cite',
  'cardTargets',
  'moveInstance',
] as const;

export type CoreTypeSurface = readonly [
  core.CardColor,
  core.CardDefinition,
  core.CardInstance,
  core.CardNo,
  core.LocalizedText,
  core.Printing,
  core.CardIndexRow,
  core.CardTextEnRow,
  core.CardTextIdRow,
  core.CardTranslationStatus,
  core.Ability,
  core.BattleField,
  core.GameState,
  core.GameStateRng,
  core.Phase,
  core.PlayerId,
  core.Players,
  core.PlayerState,
  core.TurnLimits,
  core.TurnState,
  core.Zone,
  core.AutoActivation,
  core.EffectModifier,
  core.ModifierLifetime,
  core.ModifierMode,
  core.ModifierStat,
  core.PriorityWindow,
  core.BattleSlotName,
  core.RuleKey,
  core.RuleRef,
  core.RuleRevision,
  core.Diagnostic,
  core.DiagnosticCode,
  core.Verdict,
  core.EditTarget,
  core.RulesPort,
];

describe('the core barrel', () => {
  it('exports exactly the documented runtime names', () => {
    expect(Object.keys(core).sort()).toEqual([...RUNTIME_EXPORTS].sort());
  });

  it('exports every documented runtime name as a defined value', () => {
    const surface = core as unknown as Record<string, unknown>;
    expect(RUNTIME_EXPORTS.filter((name) => surface[name] === undefined)).toEqual([]);
  });

  it('keeps stateful and engine-bound names out of the surface', () => {
    expect(Object.keys(core).filter((name) => (FORBIDDEN_NAMES as readonly string[]).includes(name))).toEqual([]);
  });
});
