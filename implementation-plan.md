# Deep Reef Implementation Plan

> For agentic workers: use superpowers:executing-plans for native execution with a final independent review.

**Goal:** Deliver the approved B scene as an offline interactive aquarium and reusable open-source Skill.

**Architecture:** A Three.js orthographic composition uses an original background plate and independently deformed fish textures. Pure simulation and preference functions are separated from rendering. A macOS wrapper and portable Skill share the same app assets.

**Tech Stack:** Node.js 20+ for preview/tests, vendored Three.js 0.180.0, WebGL2, Swift/AppKit/WebKit for macOS 13+.

**Spec:** [design.md](design.md)

## Global constraints
- Preserve approved B composition and blue-hour color as default.
- Runtime works offline; no credentials, telemetry or external CDNs.
- Fixed-camera 2.5D must be disclosed accurately.
- Existing Desktop Habitats installation remains untouched.
- Source/skill package must not contain local user paths or secrets.

## Review focus
- Pausing, hiding, resuming must not accumulate animation time or food.
- Unavailable/corrupt browser storage must not prevent opening the scene.
- WebGL or missing assets must provide useful recovery.
- Repeated feeding must remain bounded and fish must stay in view.
- Installer/uninstaller must only affect Deep Reef; preview server must not expose arbitrary files.

## Task 1 — State and simulation
- [ ] Write behavior tests for pause/hidden timestep, settings normalization, bounded feeding, fish movement, pointer avoidance and pellet expiry in `tests/simulation.test.mjs`.
- [ ] Run `node --test tests/simulation.test.mjs`, observe missing behavior.
- [ ] Implement `app/simulation.js`: `createWorld()`, `advance(world, dt, pointer)`, `feed(world,x,y)`; `app/settings.js`: `normalizeSettings()`, `shouldAnimate()`.
- [ ] Run the tests until green. Implement `scripts/serve.mjs` with allowlisted static paths and realpath containment; exercise real HTTP requests in `tests/server.test.mjs`.

## Task 2 — Visual scene
- [ ] Copy approved/generated assets into `app/assets/`, retain original generated files.
- [ ] Implement `app/renderer.js`: initialize Three.js, background displacement shader, independently deformable fish and particle geometry; cap framebuffer pixels.
- [ ] Implement browser lifecycle and Chinese controls in `app/main.js`, `app/index.html`, `app/style.css`.
- [ ] Verify browser render, feed, pause, persistence, hidden controls, lighting and failed asset load in actual browser.

## Task 3 — Native and Skill package
- [ ] Adapt the MIT macOS host under a separate bundle ID, add windowed preview, write scoped build/install/uninstall scripts.
- [ ] Compile and inspect windowed native preview without replacing active wallpaper.
- [ ] Write `SKILL.md`, `agents/openai.yaml`, README, licenses, asset provenance, and portable skill installer.
- [ ] Run tests, compile, validate skill, independent review; fix substantive findings.
- [ ] Package sources and application for user review; report any GitHub publishing limitation accurately.
