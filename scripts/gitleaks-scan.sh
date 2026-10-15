#!/usr/bin/env bash
#
# Runs gitleaks with the repo's rules. --redact is mandatory so a log never
# echoes a finding's value. Usage: gitleaks-scan.sh history|staged

set -euo pipefail

cd "$(dirname "$0")/.."

MODE="${1:-}"
if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks is not installed. Run: bash scripts/install-gitleaks.sh" >&2
  exit 2
fi

COMMON=(--config .gitleaks.toml --redact --no-banner --exit-code 7 --report-format json --report-path gitleaks-report.json)

case "$MODE" in
  history) gitleaks git . "${COMMON[@]}"; bash scripts/check-art-paths.sh history ;;
  staged) gitleaks git . "${COMMON[@]}" --pre-commit --staged; bash scripts/check-art-paths.sh staged ;;
  *) echo "usage: gitleaks-scan.sh history|staged" >&2; exit 64 ;;
esac
