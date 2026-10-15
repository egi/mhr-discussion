#!/usr/bin/env bash
#
# Proof-of-fire control for .gitleaks.toml.
#
# A gate that never fires is indistinguishable from a clean repository, so each
# custom rule is exercised here with a synthetic violation, and a clean
# repository plus the real tree are shown to pass. Violating values are
# assembled from fragments at run time so that this file's own text never
# contains a complete violation and cannot trip the gate it tests.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG="$ROOT/.gitleaks.toml"

command -v gitleaks >/dev/null 2>&1 || {
  echo "gitleaks is not installed. Run: bash scripts/install-gitleaks.sh" >&2
  exit 2
}

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

run_scan() { # $1 = repo dir, $2 = report path
  gitleaks git "$1" --config "$CONFIG" --redact --no-banner --exit-code 7 \
    --report-format json --report-path "$2" >/dev/null 2>&1
}

init_repo() { # $1 = dir
  mkdir -p "$1"
  git -C "$1" init -q -b main
  git -C "$1" config user.email "control@example.test"
  git -C "$1" config user.name "control"
}

commit_all() { # $1 = dir
  git -C "$1" add -A
  git -C "$1" commit -q -m "control fixtures"
}

# --- Violating repository --------------------------------------------------
BAD="$WORK/bad"
init_repo "$BAD"

printf 'contact %s%s%s\n' "+62" " 812-0000" "-1234" > "$BAD/phone-id.txt"
printf 'contact %s%s%s\n' "+1" " 555 0000" " 1234" > "$BAD/phone-intl.txt"
printf '[%s/%s/2026, 14:03:22] Sender: hello there\n' "12" "09" > "$BAD/wa-line.txt"
printf '%s%s\n' "<media" " omitted>" > "$BAD/wa-marker.txt"
printf 'host %s%s example\n' "marvel-t" "cg." > "$BAD/vendor.txt"
printf 'see https://cdn.fake.test/a?%s%s\n' "tok" "en=abcdef123456" > "$BAD/signed.txt"
printf 'not really an image\n' > "$BAD/art.webp"
printf 'not really an image\n' > "$BAD/art.png"
mkdir -p "$BAD/images/cards"
printf 'x\n' > "$BAD/images/cards/readme.txt"
commit_all "$BAD"

set +e
run_scan "$BAD" "$WORK/bad-report.json"
BAD_EXIT=$?
set -e
if [ "$BAD_EXIT" -ne 7 ]; then
  echo "FAIL: violating repository exited $BAD_EXIT, expected 7" >&2
  exit 1
fi

STATUS=0
for rule in phone-id phone-intl-spaced whatsapp-export-line whatsapp-export-markers \
  vendor-hosts signed-url-query card-art-file card-art-directory; do
  if grep -q "\"RuleID\": \"$rule\"" "$WORK/bad-report.json"; then
    echo "fired: $rule"
  else
    echo "FAIL: rule did not fire: $rule" >&2
    STATUS=1
  fi
done
[ "$STATUS" -eq 0 ] || exit 1

# The extension guard must catch what gitleaks' default allowlist hides (png).
set +e
ART_OUT="$(bash "$ROOT/scripts/check-art-paths.sh" history "$BAD" 2>&1)"
ART_EXIT=$?
set -e
if [ "$ART_EXIT" -ne 7 ] || ! grep -q 'art\.png' <<<"$ART_OUT"; then
  echo "FAIL: check-art-paths.sh did not flag the png fixture (exit $ART_EXIT)" >&2
  exit 1
fi
echo "fired: check-art-paths (png)"

# --- Clean repository ------------------------------------------------------
CLEAN="$WORK/clean"
init_repo "$CLEAN"
printf '# Clean\n\nNothing sensitive here.\n' > "$CLEAN/README.md"
printf 'export const answer = 42;\n' > "$CLEAN/index.ts"
commit_all "$CLEAN"
run_scan "$CLEAN" "$WORK/clean-report.json" || {
  echo "FAIL: clean repository did not pass" >&2
  exit 1
}
echo "clean repository passed"

# --- Real tree (false-positive check) ---------------------------------------
# A throwaway index keeps this read-only with respect to the repository.
export GIT_INDEX_FILE="$WORK/real-index"
git -C "$ROOT" add -A
(
  cd "$ROOT"
  gitleaks git . --config "$CONFIG" --redact --no-banner --exit-code 7 \
    --report-format json --report-path "$WORK/real-report.json" --pre-commit --staged >/dev/null 2>&1
) || {
  echo "FAIL: real tree has findings (see rule ids below)" >&2
  grep -o '"RuleID": "[^"]*"' "$WORK/real-report.json" | sort | uniq -c >&2 || true
  exit 1
}
unset GIT_INDEX_FILE
echo "real tree passed"
