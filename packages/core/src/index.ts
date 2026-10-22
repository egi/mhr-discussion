/**
 * The shared leaf of the workspace.
 *
 * `@mhr/core` holds leaf types, zod schemas and pure functions only. It imports nothing
 * but zod, and it carries no rule text, card text or art: those stay in `data/` and are
 * read by the engine. Exports are explicit named exports, never wildcards, so adding a
 * name here is a public API decision.
 */

// --- cards: identity ----------------------------------------------------------

export { asCardNo, CARD_NO_PATTERN, CardNoSchema, isCardNo, normalizeCardNo } from './cards/identity';
export type {
  CardColor,
  CardDefinition,
  CardInstance,
  CardNo,
  LocalizedText,
  Printing,
} from './cards/identity';

// --- cards: schemas (shapes only) ---------------------------------------------

export {
  CardColorSchema,
  CardIndexRowSchema,
  CardIndexSchema,
  CardRepairSchema,
  CardSyncManifestSchema,
  CardTextEnFileSchema,
  CardTextEnRowSchema,
  CardTextIdFileSchema,
  CardTextIdRowSchema,
  CardTextProvenanceSchema,
  CardTranslationStatusSchema,
  CardTypeSchema,
  CommunityOverrideFileSchema,
  ProvenanceFileSchema,
  ProvenanceRowSchema,
  QuarantineFileSchema,
  SnapshotFileSchema,
  SnapshotRowSchema,
  TermMapFileSchema,
  VendorCardRowSchema,
  VendorEnvelopeSchema,
  VendorErrorEnvelopeSchema,
} from './cards/schema';
export type {
  CardIndex,
  CardIndexRow,
  CardRepair,
  CardSyncManifest,
  CardTextEnFile,
  CardTextEnRow,
  CardTextIdFile,
  CardTextIdRow,
  CardTextProvenance,
  CardTranslationStatus,
  CardType,
  CommunityOverrideFile,
  ProvenanceFile,
  ProvenanceRow,
  QuarantineFile,
  SnapshotFile,
  SnapshotRow,
  TermMapFile,
  VendorCardRow,
  VendorEnvelope,
  VendorErrorEnvelope,
} from './cards/schema';

// --- state: the board model ----------------------------------------------------

export {
  ABILITIES,
  GAME_STATE_LIMITS,
  limitsForTurn,
  PHASE_ORDER,
  PLAYER_IDS,
  ZONE_NAMES,
} from './state/gameState';
export type {
  Ability,
  BattleField,
  GameState,
  GameStateRng,
  Phase,
  PlayerId,
  Players,
  PlayerState,
  TurnLimits,
  TurnState,
  Zone,
} from './state/gameState';

export { MODIFIER_LIFETIMES, MODIFIER_MODES, MODIFIER_STATS } from './state/modifiers';
export type {
  AutoActivation,
  EffectModifier,
  ModifierLifetime,
  ModifierMode,
  ModifierStat,
} from './state/modifiers';

export type { PriorityWindow } from './state/priority';
export type { OpenBattle } from './state/battle';

export { BATTLE_SLOT_NAMES } from './state/slots';
export type { BattleSlotName } from './state/slots';

// --- rules: identity and verdict vocabulary ---------------------------------------

export { asRuleKey, asRuleRevision } from './rules/ruleKey';
export type { RuleKey, RuleRef, RuleRevision } from './rules/ruleKey';

export { accept, DiagnosticCodeSchema, reject } from './rules/verdict';
export type { Diagnostic, DiagnosticCode, Verdict } from './rules/verdict';

export type { EditTarget } from './rules/editTarget';
export type { RulesPort } from './rules/port';
