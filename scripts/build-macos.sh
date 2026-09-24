#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
[ "$(uname -s)" = Darwin ] || { echo 'macOS 13 or later is required.' >&2; exit 1; }
if ! swiftc --version >/dev/null 2>&1; then
 if [ -x /Library/Developer/CommandLineTools/usr/bin/swiftc ]; then
  export DEVELOPER_DIR=/Library/Developer/CommandLineTools
 else
  echo 'Install Xcode Command Line Tools with xcode-select --install, then retry.' >&2; exit 1
 fi
fi
mkdir -p "$root/build"
stage=$(mktemp -d "$root/build/stage.XXXXXX")
trap 'rm -rf "$stage"' EXIT HUP INT TERM
app="$stage/Deep Reef.app"
mkdir -p "$app/Contents/MacOS" "$app/Contents/Resources/scene"
swiftc -O -target "$(uname -m)-apple-macos13.0" "$root/wallpaper/Wallpaper.swift" -o "$app/Contents/MacOS/Deep Reef" -framework Cocoa -framework WebKit -framework IOKit
cp "$root/wallpaper/Info.plist" "$app/Contents/Info.plist"
cp -R "$root/app" "$root/vendor" "$app/Contents/Resources/scene/"
cp "$root/wallpaper/UPSTREAM-LICENSE" "$app/Contents/Resources/"
codesign --force --sign - "$app"
codesign --verify --deep --strict "$app"
if [ -e "$root/build/Deep Reef.app" ]; then rm -rf "$root/build/Deep Reef.app"; fi
mv "$app" "$root/build/Deep Reef.app"
echo "Built: $root/build/Deep Reef.app"
