/**
 * The wire schema for an effect IR: the zod mirror of `ir.ts`.
 *
 * An IR value can arrive from outside the kernel, inside a shared scenario link, so it is
 * validated before anything touches it. Every object is a `z.strictObject`, which turns an
 * unexpected key into a parse error instead of stripping it; that is also what rejects a
 * `__proto__` or `constructor` key rather than merging it. Unions are discriminated on
 * `kind`, and every enumerated field is built from the const tables in `ir.ts`, so a value
 * added there is accepted here with no second list to update.
 *
 * `ir.ts` owns the types and this file proves it agrees with them: the two assertions at
 * the bottom are mutual assignability checks, so a drift in either direction is a compile
 * error rather than something a fuzz test finds later.
 */

import { z } from 'zod';
import { CardColorSchema, CardNoSchema } from '@mhr/core';
import {
  EFFECT_AREAS,
  EFFECT_TRIGGER_EVENTS,
  EFFECT_DECK_ENDS,
  EFFECT_DESTINATION_AREAS,
  EFFECT_DIG_REMAINDERS,
  EFFECT_GRANTABLE_ABILITIES,
  EFFECT_MILL_DISPOSALS,
  EFFECT_PICK_NAMES,
  EFFECT_RESTRICTION_LANES,
  EFFECT_RESTRICTIONS,
  EFFECT_SCALE_SOURCES,
  EFFECT_SETTABLE_STATS,
  EFFECT_SIDES,
  EFFECT_STATS,
  EFFECT_STEP_GATES,
  type EffectIR as EffectIRType,
  type EffectOp,
} from './ir';

const SideSchema = z.enum(EFFECT_SIDES);
const AreaSchema = z.enum(EFFECT_AREAS);
const CountSchema = z.number().int().nonnegative();
const OptionalBoundSchema = z.number().int().nullable();
const PickNameSchema = z.enum(EFFECT_PICK_NAMES);

export const EffectFilterSchema = z.strictObject({
  color: CardColorSchema.nullable(),
  lvMin: OptionalBoundSchema,
  lvMax: OptionalBoundSchema,
  powerMin: OptionalBoundSchema,
  powerMax: OptionalBoundSchema,
  feature: z.string().min(1).nullable(),
  characterOnly: z.boolean(),
  faceDown: z.boolean().nullable(),
  exceptSource: z.boolean(),
  nameIncludes: z.string().min(1).optional(),
  nameExcludes: z.string().min(1).optional(),
  differentNameFrom: z.enum(['source', 'selected']).optional(),
  sameNameAsSelected: z.boolean().optional(),
  lvSameAsRevealed: z.boolean().optional(),
  lvOffsetFromSelected: z.number().int().optional(),
  equalLvAcrossSides: z.boolean().optional(),
  extreme: z
    .strictObject({ stat: z.enum(['lv', 'power']), which: z.enum(['highest', 'lowest']) })
    .optional(),
  lvBy: z
    .strictObject({ mode: z.enum(['max', 'exact']), source: z.enum(EFFECT_SCALE_SOURCES) })
    .optional(),
  noEffects: z.boolean().optional(),
  original: z.boolean().optional(),
  hasAutoEffect: z.boolean().optional(),
  ref: PickNameSchema.optional(),
  notAttackedThisTurn: z.boolean().optional(),
});

export const EffectTargetSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('source') }),
  z.strictObject({ kind: z.literal('subject') }),
  z.strictObject({
    kind: z.literal('selected'),
    side: SideSchema,
    area: AreaSchema,
    count: CountSchema.nullable(),
    upTo: z.boolean(),
    filter: EffectFilterSchema,
    random: z.boolean().optional(),
    bind: PickNameSchema.optional(),
  }),
  z.strictObject({ kind: z.literal('host-of-source') }),
  z.strictObject({ kind: z.literal('named'), name: PickNameSchema }),
]);

export const EffectDestinationSchema = z.strictObject({
  side: SideSchema,
  area: z.enum(EFFECT_DESTINATION_AREAS),
  faceDown: z.boolean(),
});

export const EffectConditionSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('have'),
    side: SideSchema,
    area: AreaSchema,
    filter: EffectFilterSchema,
    min: CountSchema,
    max: CountSchema.nullable(),
  }),
  z.strictObject({
    kind: z.literal('fewer-than-opponent'),
    area: AreaSchema,
    filter: EffectFilterSchema,
  }),
  z.strictObject({ kind: z.literal('source-did-not-attack') }),
  z.strictObject({ kind: z.literal('subject-matches'), filter: EffectFilterSchema }),
  z.strictObject({
    kind: z.literal('attack-target-matches'),
    filter: EffectFilterSchema,
    powerAboveSource: z.boolean(),
  }),
  z.strictObject({ kind: z.literal('have-weakness') }),
  z.strictObject({ kind: z.literal('host-did-not-attack') }),
  z.strictObject({ kind: z.literal('more-set-cards-than-opponent') }),
  z.strictObject({ kind: z.literal('no-call-this-turn') }),
  z.strictObject({ kind: z.literal('owner-is-opponent') }),
  z.strictObject({ kind: z.literal('previous-step-retreated') }),
  z.strictObject({ kind: z.literal('set-equals-character-count-in-base') }),
  z.strictObject({ kind: z.literal('target-attacked-before') }),
  z.strictObject({ kind: z.literal('top-card-matches'), filter: EffectFilterSchema }),
  z.strictObject({ kind: z.literal('total-lv-lower-than-opponent') }),
]);

const DurationSchema = z.literal('this-turn');

/**
 * The recursive reference. Sequence steps, a conditional's branches and an optional's body
 * all hold another op, and a schema cannot name itself while it is being built, so the
 * reference is declared against the `ir.ts` type and resolved lazily.
 */
const EffectOpRef: z.ZodType<EffectOp> = z.lazy(() => EffectOpSchema);

const EffectStepSchema = z.strictObject({
  gate: z.enum(EFFECT_STEP_GATES),
  op: EffectOpRef,
});

export const EffectOpSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    kind: z.literal('stat-mod'),
    target: EffectTargetSchema,
    stat: z.enum(EFFECT_STATS),
    delta: z.number().int(),
    scaleBy: z.enum(EFFECT_SCALE_SOURCES),
    scaleFrom: z.strictObject({ name: PickNameSchema, stat: z.enum(['power', 'lv', 'r']) }).optional(),
    scaleCount: z
      .strictObject({
        side: SideSchema,
        area: AreaSchema,
        filter: EffectFilterSchema,
        exceptSource: z.boolean(),
      })
      .optional(),
    duration: DurationSchema,
  }).refine((op) => (op.scaleBy === 'filtered-count') === (op.scaleCount !== undefined), {
    message: 'scaleCount is required with scaleBy "filtered-count" and allowed only there',
  }),
  z.strictObject({
    kind: z.literal('stat-set'),
    target: EffectTargetSchema,
    stat: z.enum(EFFECT_SETTABLE_STATS),
    value: z.number().int(),
    duration: DurationSchema,
  }),
  z.strictObject({ kind: z.literal('draw'), side: SideSchema, count: CountSchema }),
  z.strictObject({ kind: z.literal('discard'), target: EffectTargetSchema }),
  z.strictObject({
    kind: z.literal('mill'),
    side: SideSchema,
    end: z.enum(EFFECT_DECK_ENDS),
    count: CountSchema,
    disposal: z.enum(EFFECT_MILL_DISPOSALS),
  }),
  z.strictObject({ kind: z.literal('prune'), target: EffectTargetSchema }),
  z.strictObject({ kind: z.literal('retreat'), target: EffectTargetSchema }),
  z.strictObject({
    kind: z.literal('relocate'),
    target: EffectTargetSchema,
    to: EffectDestinationSchema,
  }),
  z.strictObject({
    kind: z.literal('attach'),
    card: EffectTargetSchema,
    host: EffectTargetSchema,
  }),
  z.strictObject({ kind: z.literal('cover'), target: EffectTargetSchema }),
  z.strictObject({ kind: z.literal('swap'), a: EffectTargetSchema, b: EffectTargetSchema }),
  z.strictObject({
    kind: z.literal('dig'),
    side: SideSchema,
    count: CountSchema,
    pick: EffectFilterSchema,
    rest: z.enum(EFFECT_DIG_REMAINDERS),
  }),
  z.strictObject({ kind: z.literal('show'), target: EffectTargetSchema }),
  z.strictObject({ kind: z.literal('battle-move'), target: EffectTargetSchema }),
  z.strictObject({
    kind: z.literal('restrict'),
    target: EffectTargetSchema,
    restriction: z.enum(EFFECT_RESTRICTIONS),
    duration: DurationSchema,
    limit: z
      .strictObject({
        lv: OptionalBoundSchema,
        lane: z.enum(EFFECT_RESTRICTION_LANES).nullable(),
      })
      .optional(),
  }),
  z.strictObject({
    kind: z.literal('grant-ability'),
    target: EffectTargetSchema,
    ability: z.enum(EFFECT_GRANTABLE_ABILITIES),
    duration: DurationSchema,
  }),
  z.strictObject({
    kind: z.literal('sequence'),
    steps: z.array(EffectStepSchema).min(1).readonly(),
  }),
  z.strictObject({
    kind: z.literal('conditional'),
    condition: EffectConditionSchema,
    then: EffectOpRef,
    otherwise: EffectOpRef.nullable(),
  }),
  z.strictObject({ kind: z.literal('optional'), op: EffectOpRef }),
  z.strictObject({
    kind: z.literal('retreat-attached-of-host'),
    host: EffectTargetSchema,
    scope: z.enum(['all', 'one']),
    exceptSource: z.boolean(),
  }),
  z.strictObject({ kind: z.literal('rearrange-deck-top'), side: SideSchema, count: CountSchema }),
  z.strictObject({ kind: z.literal('draw-by-board-comparison'), count: CountSchema }),
  z.strictObject({ kind: z.literal('flip'), target: EffectTargetSchema, faceDown: z.boolean() }),
  z.strictObject({ kind: z.literal('retarget-attack'), target: EffectTargetSchema }),
  z.strictObject({
    kind: z.literal('skip-phase'),
    phase: z.literal('battle'),
    duration: DurationSchema,
  }),
  z.strictObject({
    kind: z.literal('grant-second-chance-attack'),
    target: EffectTargetSchema,
    duration: DurationSchema,
  }),
  z.strictObject({
    kind: z.literal('copy-attached-effects'),
    target: EffectTargetSchema,
    duration: DurationSchema,
  }),
]);

export const AttackerFilterSchema = z.strictObject({
  controller: z.literal('self'),
  color: CardColorSchema.optional(),
  feature: z.string().min(1).optional(),
});

export const TriggerSubjectFilterSchema = z.strictObject({
  color: CardColorSchema.optional(),
  feature: z.string().min(1).optional(),
  level: z.number().int().min(0).optional(),
  levelAtLeast: z.number().int().min(0).optional(),
  levelAtMost: z.number().int().min(0).optional(),
  lane: z.enum(['FRONT', 'WING', 'BACK']).optional(),
});

export const EffectTriggerSchema = z
  .strictObject({
    event: z.enum(EFFECT_TRIGGER_EVENTS),
    area: AreaSchema,
    attacker: AttackerFilterSchema.optional(),
    subject: TriggerSubjectFilterSchema.optional(),
  })
  .refine((t) => t.attacker === undefined || t.event === 'attacks', {
    message: 'an attacker filter is valid only on the attacks event',
  })
  .refine(
    (t) =>
      t.subject === undefined ||
      (t.event !== 'attacks' && t.event !== 'activate' && t.event !== 'activate-counter'),
    { message: 'a subject filter is not valid on attacks or the activation events' },
  );

export const EffectIRSchema = z.strictObject({
  cardNo: CardNoSchema,
  rulesVersion: z.string().min(1),
  op: EffectOpSchema,
  trigger: EffectTriggerSchema.optional(),
  oncePerTurn: z.literal(true).optional(),
});

export type EffectIR = z.infer<typeof EffectIRSchema>;

/** Mutual assignability: yields `true` only when both directions hold. */
type Agrees<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;

export const effectOpAgrees: Agrees<EffectOp, z.infer<typeof EffectOpSchema>> = true;
export const effectIRAgrees: Agrees<EffectIRType, EffectIR> = true;
