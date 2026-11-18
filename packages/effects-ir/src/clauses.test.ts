import { describe, expect, it } from "vitest";
import { asCardNo } from "@mhr/core";
import { type AnyCardScript, type EffectIR, scriptClauses } from "./ir";
import { assertClausesMatchKey } from "./registry";
import { EFFECT_RULES_VERSION } from "./version";

const ir = (cardNo: string, amount: number): EffectIR => ({
  cardNo: asCardNo(cardNo),
  rulesVersion: EFFECT_RULES_VERSION,
  op: { kind: "draw", side: "self", count: amount },
});

describe("scriptClauses", () => {
  it("returns one element for a single-clause script", () => {
    const script = () => ir("BP01-001", 1);
    expect(scriptClauses(script)).toHaveLength(1);
  });

  it("returns every clause in order for a multi-clause script", () => {
    const a = ir("BP01-001", 1);
    const b = ir("BP01-001", 2);
    const script: AnyCardScript = () => [a, b] as const;
    expect(scriptClauses(script)).toEqual([a, b]);
  });

  it("leaves the IR JSON of a single-clause script unchanged", () => {
    const script = () => ir("BP01-001", 1);
    expect(JSON.stringify(scriptClauses(script)[0])).toBe(
      JSON.stringify(script()),
    );
  });
});

describe("assertClausesMatchKey", () => {
  it("rejects a clause whose cardNo differs from the key", () => {
    const script: AnyCardScript = () =>
      [ir("BP01-001", 1), ir("BP01-002", 1)] as const;
    expect(() => assertClausesMatchKey("BP01-001", script)).toThrow(
      /CARD_SCRIPT_KEY_MISMATCH/,
    );
  });

  it("accepts clauses that all match the key", () => {
    const script: AnyCardScript = () =>
      [ir("BP01-001", 1), ir("BP01-001", 2)] as const;
    expect(() => assertClausesMatchKey("BP01-001", script)).not.toThrow();
  });
});
