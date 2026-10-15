#!/usr/bin/env bash
#
# Installs the pinned gitleaks release. The checksum is hard-coded: it is never
# fetched at run time, so a tampered release cannot vouch for itself.
#
# Usage: bash scripts/install-gitleaks.sh [install-dir]   (default: $HOME/.local/bin)

set -euo pipefail

GITLEAKS_VERSION=8.30.1
GITLEAKS_SHA256=551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb

INSTALL_DIR="${1:-$HOME/.local/bin}"

if [ "$(uname -s)" != "Linux" ] || [ "$(uname -m)" != "x86_64" ]; then
  echo "install-gitleaks.sh supports linux x86_64 only." >&2
  echo "Alternatives: brew install gitleaks, or Docker:" >&2
  echo '  docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:v8.30.1 git /repo' >&2
  exit 2
fi

if [ -x "$INSTALL_DIR/gitleaks" ] && [[ "$("$INSTALL_DIR/gitleaks" version 2>/dev/null)" == "$GITLEAKS_VERSION" ]]; then
  echo "gitleaks $GITLEAKS_VERSION already installed in $INSTALL_DIR"
  exit 0
fi

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

TARBALL="gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
curl -fsSL -o "$TMP/$TARBALL" \
  "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/${TARBALL}"

echo "$GITLEAKS_SHA256  $TMP/$TARBALL" | sha256sum -c -

mkdir -p "$INSTALL_DIR"
tar -xzf "$TMP/$TARBALL" -C "$TMP" gitleaks
install -m 0755 "$TMP/gitleaks" "$INSTALL_DIR/gitleaks"
"$INSTALL_DIR/gitleaks" version
