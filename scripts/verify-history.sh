#!/usr/bin/env bash
#
# Pre-push verification of the repository history. Fails (non-zero, one-line
# reason) on any gitleaks or denylist finding, any blob of 1 MiB or more, any
# image/archive/pdf/font path, any path under data/, docs/rules/ or .planning/,
# and any top-level path outside an explicit allowlist. Prints a short redacted
# evidence block; it never prints a finding's matched value.
#
# Needs gitleaks (scripts/install-gitleaks.sh) and git-filter-repo on PATH.

set -uo pipefail

cd "$(dirname "$0")/.."

MAX_BLOB_BYTES=1048576 # 1 MiB
TOP_LEVEL_ALLOW='^(package\.json|pnpm-workspace\.yaml|pnpm-lock\.yaml|tsconfig[A-Za-z0-9._-]*\.json|vitest\.config\.ts|\.nvmrc|\.npmrc|\.gitignore|\.gitleaks\.toml|\.dependency-cruiser\.cjs|\.github|packages|scripts|LICENSE|NOTICE\.md|CONTRIBUTING\.md|README\.md|CHANGELOG\.md)$'
BINARY_EXT='\.(png|jpe?g|webp|gif|avif|bmp|tiff?|svg|ico|zip|gz|tgz|tar|7z|rar|pdf|woff2?|ttf|otf|eot)$'
FORBIDDEN_PREFIX='^(data/|docs/rules/|\.planning/)'

FAILS=0
RESULTS=()

record() { # $1 = PASS|FAIL, $2 = check name, $3 = reason
  RESULTS+=("$1 $2${3:+ - $3}")
  if [ "$1" = FAIL ]; then
    FAILS=$((FAILS + 1))
    echo "FAIL: $2${3:+ - $3}" >&2
  fi
}

command -v gitleaks >/dev/null 2>&1 || { echo "gitleaks missing: bash scripts/install-gitleaks.sh" >&2; exit 2; }
command -v git-filter-repo >/dev/null 2>&1 || { echo "git-filter-repo missing: uv tool install git-filter-repo==2.47.0" >&2; exit 2; }

COMMITS="$(git rev-list --all --count 2>/dev/null || echo 0)"
if [ "$COMMITS" -lt 1 ]; then
  echo "FAIL: repository has no commits" >&2
  exit 1
fi
if [ -n "$(git status --porcelain)" ]; then
  echo "FAIL: working tree is not clean" >&2
  exit 1
fi

# 1. gitleaks over full history (+ image-extension guard)
if bash scripts/gitleaks-scan.sh history >/dev/null 2>&1; then
  record PASS gitleaks-history
else
  record FAIL gitleaks-history "findings or tool error (see gitleaks-report.json, values redacted)"
fi

# 2. member and head-judge denylist over full history
if node scripts/check-denylist.mjs --history >/dev/null 2>&1; then
  record PASS denylist-history
else
  record FAIL denylist-history "hit or error (run: node scripts/check-denylist.mjs --history)"
fi

# 3. filter-repo analysis: blob sizes
ANALYSIS_DIR=".git/filter-repo/analysis"
rm -rf "$ANALYSIS_DIR"
if git filter-repo --analyze >/dev/null 2>&1 && [ -f "$ANALYSIS_DIR/blob-shas-and-paths.txt" ]; then
  BLOB_COUNT="$(grep -cE '^ *[0-9a-f]{40} ' "$ANALYSIS_DIR/blob-shas-and-paths.txt" || true)"
  LARGEST="$(grep -E '^ *[0-9a-f]{40} ' "$ANALYSIS_DIR/blob-shas-and-paths.txt" | awk '{print $2}' | sort -n | tail -1)"
  LARGEST="${LARGEST:-0}"
  if [ "$LARGEST" -ge "$MAX_BLOB_BYTES" ]; then
    record FAIL blob-size "largest blob is $LARGEST bytes (limit under 1048576)"
  else
    record PASS blob-size
  fi
else
  BLOB_COUNT="?"
  LARGEST="?"
  record FAIL filter-repo-analyze "git filter-repo --analyze failed"
fi

# 4. every path ever committed
ALL_PATHS="$(git log --all --name-only --pretty=format: | sed '/^$/d' | sort -u)"

BAD_BINARY="$(printf '%s\n' "$ALL_PATHS" | grep -iE "$BINARY_EXT" | head -5 || true)"
if [ -n "$BAD_BINARY" ]; then
  record FAIL binary-paths "image/archive/pdf/font path in history: $(printf '%s' "$BAD_BINARY" | tr '\n' ' ')"
else
  record PASS binary-paths
fi

BAD_PREFIX="$(printf '%s\n' "$ALL_PATHS" | grep -E "$FORBIDDEN_PREFIX" | head -5 || true)"
if [ -n "$BAD_PREFIX" ]; then
  record FAIL forbidden-prefix "path under data/, docs/rules/ or .planning/: $(printf '%s' "$BAD_PREFIX" | tr '\n' ' ')"
else
  record PASS forbidden-prefix
fi

BAD_TOP="$(printf '%s\n' "$ALL_PATHS" | cut -d/ -f1 | sort -u | grep -vE "$TOP_LEVEL_ALLOW" || true)"
if [ -n "$BAD_TOP" ]; then
  record FAIL top-level-allowlist "unexpected top-level path(s): $(printf '%s' "$BAD_TOP" | tr '\n' ' ')"
else
  record PASS top-level-allowlist
fi

# Evidence block (no matched values)
echo "== verify-history evidence =="
echo "gitleaks: $(gitleaks version)"
echo "git-filter-repo: $(git filter-repo --version)"
echo "commits: $COMMITS"
echo "blobs: $BLOB_COUNT"
echo "largest blob (bytes): $LARGEST"
echo "extension histogram:"
printf '%s\n' "$ALL_PATHS" | sed -E 's/.*\.([A-Za-z0-9]+)$/\1/;t;s/.*/(none)/' | sort | uniq -c | sort -rn | head -10 | sed 's/^/  /'
for r in "${RESULTS[@]}"; do echo "$r"; done

if [ "$FAILS" -gt 0 ]; then
  echo "verify-history: FAIL ($FAILS check(s))"
  exit 1
fi
echo "verify-history: PASS"
