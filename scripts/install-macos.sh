#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
sh "$root/scripts/build-macos.sh"
app="$HOME/Applications/Deep Reef.app"
label=org.deepreef.wallpaper
agent="$HOME/Library/LaunchAgents/$label.plist"
domain="gui/$(id -u)"
if [ -e "$app" ]; then
 existing=$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$app/Contents/Info.plist" 2>/dev/null || true)
 [ "$existing" = "$label" ] || { echo 'The destination belongs to another application; refusing to replace it.' >&2; exit 1; }
fi
launchctl bootout "$domain/$label" 2>/dev/null || true
mkdir -p "$HOME/Applications" "$HOME/Library/LaunchAgents"
if [ -e "$app" ]; then mv "$app" "$HOME/Applications/Deep Reef.backup.$(date +%Y%m%d%H%M%S).app"; fi
ditto "$root/build/Deep Reef.app" "$app"
# PlistBuddy writes the path safely even when a home directory contains XML characters.
/usr/libexec/PlistBuddy -c Clear -c "Add :Label string $label" -c 'Add :ProgramArguments array' -c "Add :ProgramArguments:0 string $app/Contents/MacOS/Deep Reef" -c 'Add :RunAtLoad bool true' -c 'Add :KeepAlive dict' -c 'Add :KeepAlive:SuccessfulExit bool false' -c 'Add :ProcessType string Interactive' "$agent"
plutil -lint "$agent"
launchctl bootstrap "$domain" "$agent"
launchctl print "$domain/$label" >/dev/null
echo 'Deep Reef is installed and starts at login. Use its fish menu to pause, feed or quit.'
echo 'If another live wallpaper is running, quit that app to see Deep Reef unobstructed.'
