#!/bin/sh
set -eu
[ "$(uname -s)" = Darwin ] || { echo 'This uninstaller is for macOS.' >&2; exit 1; }
app="$HOME/Applications/Deep Reef.app"
label=org.deepreef.wallpaper
if [ -e "$app" ]; then
 existing=$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$app/Contents/Info.plist" 2>/dev/null || true)
 [ "$existing" = "$label" ] || { echo 'Destination is not Deep Reef; nothing removed.' >&2; exit 1; }
fi
launchctl bootout "gui/$(id -u)/$label" 2>/dev/null || true
mkdir -p "$HOME/.Trash"
stamp=$(date +%Y%m%d%H%M%S)
if [ -e "$app" ]; then mv "$app" "$HOME/.Trash/Deep Reef.$stamp.app"; fi
agent="$HOME/Library/LaunchAgents/$label.plist"
if [ -e "$agent" ]; then mv "$agent" "$HOME/.Trash/$label.$stamp.plist"; fi
echo 'Deep Reef moved to Trash. Other wallpaper applications and saved preferences were left in place.'
