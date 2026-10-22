# Changelog

The format follows Keep a Changelog.

## Unreleased

### Added

- Initial import: `@mhr/core`, `@mhr/effects-ir` with the 43 card scripts, the CI privacy gate, the licence and the notice.

- `@mhr/effects-ir`: optional `EffectIR.trigger` (an append-only event plus the Effect Location the card must stand in) with six events: `enters-field-by-call`, `enters-field`, `attacks`, `base-move`, `activate`, `activate-counter`. Seventeen scripts are tagged (BP01-002, 012, 015, 017, 018, 020, 053, 060, 077, 106, 109, 112, 114, 118, SD01-007, SD02-010, SD04-002). An untagged script is manual only. `EFFECT_RULES_VERSION` is unchanged. Left untagged on purpose: scripts with a per-turn limit (no per-turn use record exists), BP01-003 (turn-end timing), BP01-065 (retreat by losing a fight, no battle-resolution event), BP01-005 (needs an attacker filter; since tagged, see the attacker filter entry below), and every script that cannot run yet.

- `@mhr/effects-ir`: seven wave-2 scripts (BP01-016, BP01-026, BP01-059, EB01-010, EB01-013, SD01-018, SD02-016); the registry holds 50. BP01-059 and SD02-016 use `grant-ability`, which the interpreter does not run yet, so they stay manual. None is trigger-tagged. `EFFECT_RULES_VERSION` is unchanged.

- `@mhr/effects-ir`: optional `EffectFilter.nameIncludes` (a case-insensitive name substring, rule 201.7.b), omitted when unused, so earlier scripts read and hash as before. Five wave-2 backfill scripts (BP01-014, BP01-030, BP01-032, BP01-033, BP01-034); the registry holds 67. BP01-014 and BP01-030 are trigger-tagged; BP01-032 and BP01-034 use ops the interpreter does not run yet. `EFFECT_RULES_VERSION` is unchanged.

- `@mhr/effects-ir`: wave-2 scripts, summarised. 24 scripts added over four batches and a backfill (BP01-007, 008, 010, 014, 016, 026, 028, 030, 032, 033, 034, 059, 066, 111, 119, EB01-010, 012, 013, SD01-018, SD02-016, 017, SD03-018, SD04-014, 015); the registry holds 67. Every script carries a rule declaration and the consistency report shows 67 declared, 0 undeclared, 0 withDrift, 0 failing (32 scripts carry a ruling flag, each tied to an open discussion). Two interpreter ops were promoted after clearing the three-card gate: `battle-move` (BP01-085, 111, SD03-018, SD04-015) and `relocate` into the field (BP01-007, 066, EB01-012); every other candidate op was held below the gate. No new IR op kind was added to this package. `EFFECT_RULES_VERSION` is unchanged at `1.03`.

### Removals

Every takedown removal is recorded here with its date and scope, without the removed text.

- `@mhr/effects-ir`: optional `EffectTrigger.attacker` (append-only; `controller: 'self'`, optional `color`), valid only on the `attacks` event and omitted when unused, so earlier scripts read and hash as before. BP01-005 is now tagged `attacks` / HAND with the same-player red filter. `EFFECT_RULES_VERSION` is unchanged at `1.03`.
