# Changelog

The format follows Keep a Changelog.

## Unreleased

### Added

- Initial import: `@mhr/core`, `@mhr/effects-ir` with the 43 card scripts, the CI privacy gate, the licence and the notice.

- `@mhr/effects-ir`: optional `EffectIR.trigger` (an append-only event plus the Effect Location the card must stand in) with six events: `enters-field-by-call`, `enters-field`, `attacks`, `base-move`, `activate`, `activate-counter`. Seventeen scripts are tagged (BP01-002, 012, 015, 017, 018, 020, 053, 060, 077, 106, 109, 112, 114, 118, SD01-007, SD02-010, SD04-002). An untagged script is manual only. `EFFECT_RULES_VERSION` is unchanged. Left untagged on purpose: scripts with a per-turn limit (no per-turn use record exists), BP01-003 (turn-end timing), BP01-065 (retreat by losing a fight, no battle-resolution event), BP01-005 (needs an attacker filter), and every script that cannot run yet.

### Removals

Every takedown removal is recorded here with its date and scope, without the removed text.
