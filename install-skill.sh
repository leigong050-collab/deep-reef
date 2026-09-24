#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
destination="${CODEX_HOME:-$HOME/.codex}/skills/deep-reef"
if [ -e "$destination" ]; then echo "Skill already exists at $destination; compare versions before updating." >&2; exit 1; fi
mkdir -p "$destination"
for entry in SKILL.md agents app vendor scripts wallpaper references LICENSE THIRD_PARTY_NOTICES.md package.json; do cp -R "$root/$entry" "$destination/"; done
echo "Installed skill: $destination"
