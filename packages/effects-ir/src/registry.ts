/**
 * The card-script registry: `cardScript(cardNo)` resolves an authored effect script, or
 * answers `undefined` when the card has none.
 *
 * ## A miss returns `undefined`; it never throws
 *
 * This is the DELIBERATE INVERSION of `rules/registry.ts`, which throws on an unknown key.
 * A rule citation that cannot be resolved has no safe fallback, so that registry stops.
 * An unscripted card is the opposite: the expected, common case, and the engine's answer to
 * it is the manual path where the players apply the printed effect themselves. A throw here
 * would turn "no script yet" into a crash at the board. Do not add one, and do not log: a
 * miss is not an error.
 *
 * ## What is checked, and when
 *
 * The manifest is validated once at module load, so a malformed entry fails at startup and
 * not at the first lookup: the key must be a canonical card number, and the script must
 * produce an effect that passes the strict wire schema and names the same card as its key.
 * Scripts are pure and take no arguments, so running them once here is side-effect free.
 */
import { CARD_SCRIPTS } from './scripts';
import { asCardNo, type CardNo } from '@mhr/core';
import { scriptClauses, type AnyCardScript, type CardScript } from './ir';
import { EffectIRSchema } from './schema';

export type { CardScript };

/** Parses every clause of a script and requires each to name the card the script is keyed under. */
export function assertClausesMatchKey(key: string, script: AnyCardScript): void {
  const cardNo = asCardNo(key);
  for (const clause of scriptClauses(script)) {
    const ir = EffectIRSchema.parse(clause);
    if (ir.cardNo !== cardNo) {
      throw new Error(`CARD_SCRIPT_KEY_MISMATCH: ${key} produced an effect for ${ir.cardNo}`);
    }
  }
}

const scripts: ReadonlyMap<CardNo, AnyCardScript> = (() => {
  const map = new Map<CardNo, AnyCardScript>();
  for (const [key, script] of Object.entries(CARD_SCRIPTS)) {
    assertClausesMatchKey(key, script);
    map.set(asCardNo(key), script);
  }
  return map;
})();

/** The authored script for a card, or `undefined` when the card is unscripted. */
export function cardScript(cardNo: CardNo): AnyCardScript | undefined {
  return scripts.get(cardNo);
}

/** Every card number with an authored script, in manifest order. */
export function scriptedCardNumbers(): readonly CardNo[] {
  return [...scripts.keys()];
}
