# Verification — 2026-09-24

- `npm test`: 15 tests passed. Covers ten-minute simulated bounds, schooling cohesion and travel, five-species feeding, pellet limits, pause/host acknowledgements, settings and preview-server path/method boundaries.
- Browser preview inspected after final fish and text changes: no visible headings, captions, status or toast; hidden icon controls open correctly; feed acknowledgement, pause disabling feed and resume verified. No browser warnings or errors observed.
- Five species / 21 fish loaded, including the 12-fish school. Observed irregular school formation and movement between captures; retained approved reef composition.
- macOS app rebuilt and ad hoc signature verified by build script. Native preview rendered the revised scene in WebGL2; native snapshot inspected. Host reported visible page, uncovered window and WebGL2 support.
- Skill metadata validator passed.

Local deployment: Deep Reef is installed as a running per-user login agent, and the bundled Codex Skill passed metadata validation after installation. Existing Desktop Habitats was stopped and its login agent disabled, while retaining its application and files. A snapshot was taken from the installed desktop process. Long-running battery consumption, multi-monitor changes and every sleep/lock transition have not been tested. Final visual acceptance belongs to the user. GitHub publication is tracked separately from local verification.
