---
name: deep-reef
description: Build, preview, install and customize the bundled Deep Reef saltwater aquarium wallpaper on macOS, or preview it in a WebGL2 browser. Use for Deep Reef scenes, lighting, fish motion and wallpaper controls; not for unrelated desktop settings or real aquarium husbandry.
---

# Deep Reef

Create a refined blue-hour reef from the bundled offline app. The scene is a **fixed-camera 2.5D composition**: generated background plate, independently swimming fish, masked soft-coral distortion and subtle light animation. Do not call it full 3D or promise freely orbitable coral geometry.

## Locate and preview

Resolve this directory from the path of this SKILL.md, never a developer's machine path. All commands below run from this directory.

- Browser: `node scripts/serve.mjs`, then open the exact localhost URL printed. Node.js 20+; no npm install or network asset fetch required. Port defaults to 4783; `PORT=4784` selects another. If busy, choose a free port; do not kill an unrelated process.
- macOS build: `sh scripts/build-macos.sh`. macOS 13+, Swift command-line tools. The script can use the separately installed Command Line Tools when selected Xcode is unavailable. Never accept an SDK license on the user's behalf.
- Windowed native preview: open `build/Deep Reef.app` with `--preview`. A compiled app is machine-architecture specific and ad hoc signed, not notarized.
- Desktop installation, when requested: `sh scripts/install-macos.sh`. It installs only Deep Reef and a per-user login agent. Explain if another active wallpaper covers it; only quit that other app when the requested switch authorizes doing so.
- Removal, when requested: `sh scripts/uninstall-macos.sh`. Only Deep Reef artifacts move to Trash; other wallpapers and preferences stay intact.

## Customize deliberately

First identify which aspect the user wants changed. Preserve all unrelated approved composition and behavior. For asset replacement or a new visual style, present a still reference for approval before changing production assets, unless the user has already approved the specific image.

Read [scene-guide.md](references/scene-guide.md) for asset roles, animation boundaries, light presets and species motion. Fish may never be painted into the background and also rendered as actors. Render realistic scale and limited population; avoid neon overbloom or constant exaggerated motion.

Use an image-generation/editing tool for raster asset edits if available. Do not silently substitute unrelated artwork or transmit private reference images to external services. If no image tool is available, retain the existing plate and adjust supported settings. New fish sprites need verified alpha; a visible checkerboard is not transparency.

## Verify the outcome

Observe the actual preview after changes: correct assets, independent fish movement, feeding response, pause/resume, intended lighting and no visible loading/error overlay. A successful build or static screenshot does not establish animation quality. For simulation changes, use the repository's behavior tests if present; the installable Skill omits the development test suite.

Keep wall-clock pauses from advancing the simulation. Honor low power, screen sleep and user pause. Reduced-motion behavior and persistent preferences are part of the feature, not optional decoration.

Distinguish technical verification from the user's visual acceptance. Report unsupported runtime/platform tests accurately. Before GitHub publishing, include third-party notices and asset provenance, exclude build directories, local logs, credentials and machine paths, and use the user's intended account/repository. A local commit or ZIP is not a published repository.
