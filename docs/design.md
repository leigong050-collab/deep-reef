# Deep Reef / 深蓝珊瑚缸

用户已选择 B 深蓝展缸概念。目标是保留深蓝留白、右侧礁石拱洞、荧光珊瑚与白沙，制作可离线运行的动态桌面与可复用 Codex Skill。

## Rendering contract

Fixed camera 2.5D scene. AI-generated fish-free background plate, separately textured animated fish, locally masked coral refraction, gentle caustics and sparse particles. This is not volumetric coral geometry or a freely orbitable 3D scene. All assets ship locally; runtime has no cloud, telemetry, accounts, or image-generation requirement.

Twenty-one fish across five species: two clownfish, four independent chromis, one yellow tang, one royal gramma, one copperband butterflyfish, and a school of twelve small chromis. The school uses irregular spacing and shared steering with individual drift. Independent steering, continuous turns, tail deformation, pointer avoidance, food pursuit and bounded pellet lifetime. Keep movement slow and fish small. Do not animate rocks with coral sway.

Browser controls: pause/resume, feed, moonlight/blue-hour/daylight, 20/30/60 fps profiles, hide controls, fullscreen. Remember preferences, respect Reduce Motion on first use, stop rendering when hidden. Explicit error and reload state if WebGL/assets fail.

Mac wrapper: separately named Deep Reef.app, desktop windows, menu-bar control, offline scheme, power/screen sleep policy. No changes to Desktop Habitats. Build and preview before any desktop switch. Installer/uninstaller are scoped to Deep Reef only.

Open source package: MIT code with upstream notices, generated-assets provenance, portable scripts and a self-contained Skill. Public GitHub publication is optional and requires an available destination/account; never publish machine-specific paths, logs, or credentials.

Acceptance: compare running preview to B, see independent fish motion, exercise feed/pause/lighting, verify missing-assets recovery, long simulation bounds, offline assets, native build and skill validation. Static concept approval is not runtime artistic acceptance.

The aquarium contains no visible text. Controls are hidden by default and reveal as icons with H or the bottom-right hover button.
