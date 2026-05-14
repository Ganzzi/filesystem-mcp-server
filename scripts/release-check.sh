#!/usr/bin/env bash
set -euo pipefail

VERSION=$(node -p "require('./package.json').version")

if ! grep -q "## \[$VERSION\]" CHANGELOG.md; then
  echo "FAIL: CHANGELOG.md missing entry for version $VERSION"
  exit 1
fi

npm test

echo "PASS: release check passed for version $VERSION"
