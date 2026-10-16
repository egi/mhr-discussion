#!/usr/bin/env bash
#
# Negative controls for scripts/check-errata.mjs.
#
# Every rule is exercised with a violating fixture, and each control asserts on
# the NAMED code in the output: a non-zero exit on its own can mean the checker
# crashed, which is not the same as the rule firing.

set -euo pipefail

cd "$(dirname "$0")/.."
CHECK="$(pwd)/scripts/check-errata.mjs"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

INDEX_HEAD='# Errata

| # | Date | Rule key | Authority tier | Entry | Discussion |
|---|------|----------|----------------|-------|------------|'

entry() {
  # $1 root, $2 number, $3 date, $4 rule key, $5 tier, $6 discussion
  cat > "$1/errata/$2.md" <<EOT
# Erratum $2: control entry
**Date:** $3
**Rule key:** $4
**Authority tier:** $5
**Discussion:** $6

## Old behaviour

old

## New behaviour

new

## Affected scripts

BP01-002

## Action required

none
EOT
}

row() {
  # $1 root, $2 number, $3 date, $4 rule key, $5 tier, $6 discussion
  printf '| %s | %s | %s | %s | [errata/%s.md](errata/%s.md) | %s |\n' \
    "$((10#$2))" "$3" "$4" "$5" "$2" "$2" "$6" >> "$1/ERRATA.md"
}

fixture() {
  # $1 name; builds a minimal root and prints its path
  local root="$WORK/$1"
  mkdir -p "$root/rules" "$root/discussions" "$root/errata"
  printf '[{"ruleKey":"101","revision":"1.03","textHash":"a"},{"ruleKey":"303.2","revision":"1.03","textHash":"b"}]\n' > "$root/rules/rule-key-snapshot.json"
  : > "$root/discussions/01-sample.md"
  printf '%s\n' "$INDEX_HEAD" > "$root/ERRATA.md"
  printf '%s' "$root"
}

add_valid() {
  # $1 root, $2 number, $3 date
  entry "$1" "$2" "$3" 101 RULEBOOK 01-sample.md
  row "$1" "$2" "$3" 101 RULEBOOK 01-sample.md
}

expect_ok() {
  # $1 label, $2 root, remaining args passed to the checker
  local label="$1" root="$2" out status=0
  shift 2
  out="$(node "$CHECK" --root "$root" "$@" 2>&1)" || status=$?
  if [ "$status" -ne 0 ]; then
    printf 'FATAL: %s should pass but failed:\n%s\n' "$label" "$out" >&2
    exit 1
  fi
  printf 'control OK: %s passes\n' "$label"
}

expect_fail() {
  # $1 label, $2 code, $3 root, remaining args passed to the checker
  local label="$1" code="$2" root="$3" out status=0
  shift 3
  out="$(node "$CHECK" --root "$root" "$@" 2>&1)" || status=$?
  if [ "$status" -eq 0 ]; then
    printf 'FATAL: checker accepted the %s fixture.\n' "$label" >&2
    exit 1
  fi
  if ! grep -q "$code" <<<"$out"; then
    printf 'FATAL: checker failed the %s fixture but never named %s:\n%s\n' "$label" "$code" "$out" >&2
    exit 1
  fi
  printf 'control OK: %s fired %s\n' "$label" "$code"
}

gitc() {
  git -C "$1" -c user.name=control -c user.email=control@example.test -c commit.gpgsign=false "${@:2}"
}

# --- positive controls --------------------------------------------------------
r="$(fixture empty)"
expect_ok 'empty errata directory' "$r"

r="$(fixture valid)"
add_valid "$r" 001 2026-10-01
expect_ok 'a single valid entry' "$r"

# --- structural rules ---------------------------------------------------------
r="$(fixture gap)"
add_valid "$r" 001 2026-10-01
add_valid "$r" 003 2026-10-03
expect_fail 'numbering gap' ERRATA_GAP "$r"

r="$(fixture date)"
add_valid "$r" 001 2026-10-05
add_valid "$r" 002 2026-10-01
expect_fail 'date going backwards' ERRATA_DATE_ORDER "$r"

r="$(fixture field)"
add_valid "$r" 001 2026-10-01
sed -i '/^\*\*Rule key:\*\*/d' "$r/errata/001.md"
expect_fail 'missing rule key line' ERRATA_BAD_FIELD "$r"

r="$(fixture baddate)"
add_valid "$r" 001 2026-10-01
sed -i 's/^\*\*Date:\*\* .*/**Date:** 1 Oct 2026/' "$r/errata/001.md"
expect_fail 'malformed date' ERRATA_BAD_FIELD "$r"

r="$(fixture rule)"
entry "$r" 001 2026-10-01 999.9 RULEBOOK 01-sample.md
row "$r" 001 2026-10-01 999.9 RULEBOOK 01-sample.md
expect_fail 'rule key outside the snapshot' ERRATA_UNKNOWN_RULE "$r"

r="$(fixture tier)"
entry "$r" 001 2026-10-01 101 WHATEVER 01-sample.md
row "$r" 001 2026-10-01 101 WHATEVER 01-sample.md
expect_fail 'unknown authority tier' ERRATA_UNKNOWN_TIER "$r"

r="$(fixture discussion)"
entry "$r" 001 2026-10-01 101 RULEBOOK 99-missing.md
row "$r" 001 2026-10-01 101 RULEBOOK 99-missing.md
expect_fail 'discussion that is not published' ERRATA_BAD_DISCUSSION "$r"

r="$(fixture index)"
add_valid "$r" 001 2026-10-01
printf '%s\n' "$INDEX_HEAD" > "$r/ERRATA.md"
expect_fail 'index missing a row' ERRATA_INDEX_MISMATCH "$r"

r="$(fixture indexcell)"
add_valid "$r" 001 2026-10-01
sed -i 's/RULEBOOK/CARD-TEXT/' "$r/ERRATA.md"
expect_fail 'index row disagreeing with its entry' ERRATA_INDEX_MISMATCH "$r"

r="$(fixture nosnap)"
add_valid "$r" 001 2026-10-01
rm "$r/rules/rule-key-snapshot.json"
expect_fail 'entries without a snapshot' ERRATA_SNAPSHOT_MISSING "$r"

# --- history rules (throwaway git repos) --------------------------------------
history_repo() {
  local r
  r="$(fixture "$1")"
  add_valid "$r" 001 2026-10-01
  add_valid "$r" 002 2026-10-02
  gitc "$r" init -q -b main
  gitc "$r" add -A
  gitc "$r" commit -q -m base
  printf '%s' "$r"
}

r="$(history_repo hist-append)"
add_valid "$r" 003 2026-10-03
expect_ok 'appending entry 003 after the base' "$r" --base HEAD

r="$(history_repo hist-mod)"
printf '\nedited\n' >> "$r/errata/001.md"
expect_fail 'modified entry' ERRATA_MUTATED "$r" --base HEAD

r="$(history_repo hist-del)"
rm "$r/errata/002.md"
sed -i '$d' "$r/ERRATA.md"
expect_fail 'deleted entry' ERRATA_MUTATED "$r" --base HEAD

r="$(history_repo hist-idx)"
sed -i '/^| 1 |/d' "$r/ERRATA.md"
expect_fail 'deleted index line' ERRATA_INDEX_REWRITTEN "$r" --base HEAD

printf 'all errata controls passed\n'
