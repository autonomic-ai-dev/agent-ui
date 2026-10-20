#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$DIR/.." && pwd)"

echo "==> [agent-ui] Starting verification suite..."
cd "$REPO_ROOT"

echo "==> Running bun run check (svelte-check)..."
bun run check

echo "==> Running bun run build..."
bun run build

echo "==> [agent-ui] Verification passed cleanly (exit 0)."
