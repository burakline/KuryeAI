#!/bin/bash
set -euo pipefail

# Only run in remote (web) environments
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"

# Read token from local (untracked) credential file
TOKEN_FILE="${CLAUDE_PROJECT_DIR}/.git/github_token"
if [ -f "$TOKEN_FILE" ]; then
  TOKEN=$(cat "$TOKEN_FILE")
  git remote set-url origin "https://${TOKEN}@github.com/burakline/KuryeAI.git"
  echo "✅ Git remote URL set with auth token"
else
  echo "⚠️  Token file not found: .git/github_token — push may fail"
fi
