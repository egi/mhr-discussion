#!/usr/bin/env bash
#
# Negative controls for the package boundary gates.
#
# A rule that never fires is indistinguishable from a clean codebase, so every
# gate is exercised with a deliberate violation before the real check runs.
# Each control asserts on the RULE NAME appearing in the tool output: a
# non-zero exit on its own can mean "the tool could not find the file", which is
# not the same thing as "the rule fired".
#
# Fixtures are written inside the real tree rather than /tmp, because module
# resolution must be the production one; under pnpm the two differ. A single
# EXIT trap removes every fixture, so a failure cannot leave a violation behind.

set -euo pipefail

cd "$(dirname "$0")/.."

CORE_REACT="packages/core/src/__core_control_react__.ts"
CORE_IR="packages/core/src/__core_control_ir__.ts"
CORE_UNKNOWN="packages/core/src/__core_control_unknown__.ts"
CORE_TEST_OK="packages/core/src/__core_control__.test.ts"
CORE_VITEST_PROD="packages/core/src/__core_control_vitest__.ts"
IR_JSON="packages/effects-ir/src/__ir_control_json__.ts"
IR_NODE="packages/effects-ir/src/__ir_control_node__.ts"
IR_UNKNOWN="packages/effects-ir/src/__ir_control_unknown__.ts"
IR_OK="packages/effects-ir/src/__ir_control_ok__.ts"

cleanup() {
  rm -f "$CORE_REACT" "$CORE_IR" "$CORE_UNKNOWN" "$CORE_TEST_OK" "$CORE_VITEST_PROD" \
    "$IR_JSON" "$IR_NODE" "$IR_UNKNOWN" "$IR_OK"
}
trap cleanup EXIT

cruise() {
  pnpm exec depcruise -c .dependency-cruiser.cjs -T err-long "$1"
}

# The JSON reporter, used where a control has to inspect a *resolved* dependency
# rather than the absence of a violation: `err-long` prints nothing at all for a
# clean cruise, so it cannot distinguish "the rule spared this" from "the
# specifier never resolved and no path clause could match it".
cruise_json() {
  pnpm exec depcruise -c .dependency-cruiser.cjs -T json "$1"
}

expect_violation() {
  # $1 label, $2 fixture, $3 rule-name regex
  local status=0 output
  output="$(cruise "$2" 2>&1)" || status=$?
  if [ "$status" -eq 0 ]; then
    printf 'FATAL: depcruise accepted the %s fixture.\n' "$1" >&2
    printf '%s\n' "$output" >&2
    exit 1
  fi
  if ! grep -Eq "$3" <<<"$output"; then
    printf 'FATAL: depcruise exited non-zero for the %s fixture but never named %s.\n' "$1" "$3" >&2
    printf '%s\n' "$output" >&2
    exit 1
  fi
}

# --- Control 0: the compiler gate's preconditions ---------------------------
for tsconfig_file in tsconfig.base.json packages/core/tsconfig.json packages/effects-ir/tsconfig.json; do
  if [ ! -f "$tsconfig_file" ]; then
    printf 'FATAL: %s is missing; the package boundary cannot be checked.\n' "$tsconfig_file" >&2
    exit 1
  fi
done

if grep -q '"DOM"' tsconfig.base.json packages/core/tsconfig.json packages/effects-ir/tsconfig.json; then
  printf 'FATAL: a DOM lib is declared in the package tsconfig chain.\n' >&2
  printf '       `extends` is transitive, so this would silently legalise document/window in package source.\n' >&2
  exit 1
fi

for types_owner in packages/core packages/effects-ir; do
  types_declaration="$(grep -o '"types": *\[[^]]*\]' "$types_owner/tsconfig.json" || true)"
  if [ -z "$types_declaration" ]; then
    printf 'FATAL: %s/tsconfig.json declares no "types" allow-list.\n' "$types_owner" >&2
    printf '       Without one, @types/node from the root install is auto-included.\n' >&2
    exit 1
  fi
  if grep -q 'node' <<<"$types_declaration"; then
    printf 'FATAL: the %s "types" allow-list admits node globals (%s).\n' "$types_owner" "$types_declaration" >&2
    exit 1
  fi
done
printf 'control 0 OK: core and effects-ir tsconfig chains have no DOM lib and no ambient @types (allow-list: %s)\n' "$types_declaration"

# --- Controls A-E: the @mhr/core boundary -----------------------------------
printf '%s\n' "import React from 'react';" 'export const coreReactControl = React;' > "$CORE_REACT"
expect_violation 'core react' "$CORE_REACT" 'core-only-zod|core-no-unknown-modules'
rm -f "$CORE_REACT"
printf 'control A OK: core-only-zod fired on a non-zod package import inside core\n'

printf '%s\n' "import type { EffectIR } from '../../effects-ir/src/ir';" 'export type CoreIrControl = EffectIR;' > "$CORE_IR"
expect_violation 'core effects-ir' "$CORE_IR" 'core-no-effects-ir-import'
rm -f "$CORE_IR"
printf 'control B OK: core-no-effects-ir-import fired on a deliberate import of effects-ir\n'

printf '%s\n' "import { missing } from './__does_not_exist__';" 'export const coreUnknownControl = missing;' > "$CORE_UNKNOWN"
expect_violation 'core unknown' "$CORE_UNKNOWN" 'core-no-unknown-modules'
rm -f "$CORE_UNKNOWN"
printf 'control C OK: core-no-unknown-modules fired on an unresolvable import\n'

printf '%s\n' "import { it } from 'vitest';" "it('control', () => undefined);" > "$CORE_TEST_OK"
test_status=0
test_output="$(cruise "$CORE_TEST_OK" 2>&1)" || test_status=$?
if [ "$test_status" -ne 0 ]; then
  printf 'FATAL: a core rule fired on a vitest import inside a core test file.\n' >&2
  printf '%s\n' "$test_output" >&2
  exit 1
fi
rm -f "$CORE_TEST_OK"
printf 'control D OK: vitest is spared in core test files\n'

printf '%s\n' "import { it } from 'vitest';" "export const coreVitestControl = it;" > "$CORE_VITEST_PROD"
expect_violation 'core production vitest' "$CORE_VITEST_PROD" 'core-only-zod'
rm -f "$CORE_VITEST_PROD"
printf 'control E OK: core-only-zod fired on vitest in core production source\n'

# --- Controls F-I: the @mhr/effects-ir boundary ------------------------------
# A resolvable JSON import stands in for a card-data file.
printf '%s\n' "import pkg from '../package.json';" 'export const irJsonControl = pkg;' > "$IR_JSON"
expect_violation 'effects-ir json' "$IR_JSON" 'effects-ir-only-core-zod'
rm -f "$IR_JSON"
printf 'control F OK: effects-ir-only-core-zod fired on a JSON import\n'

printf '%s\n' "import { readFileSync } from 'node:fs';" 'export const irNodeControl = readFileSync;' > "$IR_NODE"
expect_violation 'effects-ir node builtin' "$IR_NODE" 'effects-ir-only-core-zod'
rm -f "$IR_NODE"
printf 'control G OK: effects-ir-only-core-zod fired on a Node builtin import\n'

printf '%s\n' "import { missing } from './__does_not_exist__';" 'export const irUnknownControl = missing;' > "$IR_UNKNOWN"
expect_violation 'effects-ir unknown' "$IR_UNKNOWN" 'effects-ir-no-unknown-modules'
rm -f "$IR_UNKNOWN"
printf 'control H OK: effects-ir-no-unknown-modules fired on an unresolvable import\n'

# Positive control: only @mhr/core and zod. The imports must resolve, or the pass
# would be vacuous (an unresolved specifier matches no path clause).
printf '%s\n' \
  "import { z } from 'zod';" \
  "import { asCardNo } from '@mhr/core';" \
  'export const irOkControl = [z.string(), asCardNo];' \
  > "$IR_OK"

ir_ok_status=0
ir_ok_json="$(cruise_json "$IR_OK" 2>&1)" || ir_ok_status=$?
if grep -q '"couldNotResolve": true' <<<"$ir_ok_json"; then
  printf 'FATAL: an import in the effects-ir positive control did not resolve, so the permit is vacuous.\n' >&2
  printf '%s\n' "$ir_ok_json" >&2
  exit 1
fi
if ! grep -q '"resolved": "node_modules/.pnpm/zod@' <<<"$ir_ok_json" \
  || ! grep -q '"resolved": "packages/core/' <<<"$ir_ok_json"; then
  printf 'FATAL: the effects-ir positive control did not resolve both zod and @mhr/core.\n' >&2
  printf '%s\n' "$ir_ok_json" >&2
  exit 1
fi
if [ "$ir_ok_status" -ne 0 ]; then
  printf 'FATAL: an effects-ir rule fired on imports of only @mhr/core and zod.\n' >&2
  printf '%s\n' "$ir_ok_json" >&2
  exit 1
fi
rm -f "$IR_OK"
printf 'control I OK: an effects-ir file importing only @mhr/core and zod is spared\n'
