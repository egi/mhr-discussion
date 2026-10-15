#!/usr/bin/env bash
#
# Image-extension guard. gitleaks' default configuration allowlists several image
# extensions (png, jpg, gif, bmp, tif), which silently switches off the
# card-art-file path rule for them. This guard covers every image extension by
# path alone. Prints offending paths only (paths are not sensitive).
#
# Usage: check-art-paths.sh history|staged [repo-dir]

set -euo pipefail

MODE="${1:-}"
REPO="${2:-$(cd "$(dirname "$0")/.." && pwd)}"
PATTERN='\.(png|jpe?g|webp|gif|avif|bmp|tiff?)$|(^|/)images?/cards(/|$)'

case "$MODE" in
  history) PATHS="$(git -C "$REPO" log --all --name-only --pretty=format: --diff-filter=ACMR 2>/dev/null || true)" ;;
  staged) PATHS="$(git -C "$REPO" diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true)" ;;
  *) echo "usage: check-art-paths.sh history|staged [repo-dir]" >&2; exit 64 ;;
esac

HITS="$(printf '%s\n' "$PATHS" | grep -iE "$PATTERN" | sort -u || true)"
if [ -n "$HITS" ]; then
  echo "ART_PATH_HIT: image or card-image path committed:" >&2
  printf '%s\n' "$HITS" >&2
  exit 7
fi
echo "art paths ok ($MODE)"
