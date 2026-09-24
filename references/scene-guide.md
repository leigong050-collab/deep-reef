# Scene guide

## Assets
- `app/assets/reef.png`: B composition, fish removed. Preserve rock arch at right, isolated left island, midnight open water, fine white sand. Base artwork is 1672×941, not native 4K. Shader scales it to the screen.
- `app/assets/clownfish.png`: generated right-facing ocellaris, real RGBA.
- `app/assets/chromis.png`: generated right-facing chromis, real RGBA.
- Image editing must produce a sibling candidate and be visually compared before replacement. Keep source imagery out of published artifacts unless licensed/authorized for reuse.

## Runtime
- `app/simulation.js`: normalized top-left coordinates, 21 moving fish across five species, including a cohesive school of 12 small chromis; pellet capacity 32, lifetime 26 simulation seconds, dt cap 80 ms. Chromis follow open-water corridors; clownfish stay near the anemone unless feeding/avoiding the pointer.
- `app/renderer.js`: orthographic 16×9 composition, contain fit on non-wide screens. Shader deforms only elliptical soft-tissue masks near torch coral and anemone. Rocks are static. Fish use subdivided textured meshes with tail bending and eased turns. This is image-based 2.5D, not mesh-based coral geometry.
- `app/settings.js`: `blue`, `moon`, `day`; `eco`, `balanced`, `detail`. A quality profile caps both resolution and frame rate. Browser preferences use `deep-reef.settings` localStorage; storage failures fall back safely.
- `app/main.js`: one cancellable animation loop, resets frame timestamps when paused or hidden, no food injection while stopped. `window.deepReef.status()` is a read-only diagnostics snapshot. `habitatRate`, `habitatPower`, `habitatLight`, `habitatFeed`, `habitatPointer` are the native bridge.
- `wallpaper/Wallpaper.swift`: MIT-derived AppKit host. Native host owns pause, screen coverage/sleep/power and per-screen windows. `--preview` creates one standard window. Native website store is ephemeral. Native lighting and pause live in `UserDefaults` under `org.deepreef.wallpaper`.

## Interaction
Space: pause/resume. F: fullscreen. H: show/hide controls, when focus is outside a control. Browser: click water or Feed. Wallpaper: fish menu → 投喂. Pointer avoidance is subtle; it does not implement fish collisions with volumetric rocks.

## QA
Repository: `npm test`; compile with `sh scripts/build-macos.sh`; run browser and native previews. Check first load, repeated feed, paused feed disabled, refresh persistence, failed asset reload, unusual window sizes, and hide/show. Report runtime visual acceptance separately from tests.

- `yellow.png`, `gramma.png`, `butterfly.png`: generated right-facing RGBA fish assets.
- Pure aquarium by default; H reveals icon-only controls. Screen-reader descriptions remain available.
