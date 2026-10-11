# Origin Link — Build 001

A standalone third-person mechanics prototype for Chronicle Clash, developed from the owner's October 11, 2026 direction. This directory does not change the website hub or the separate Evertrail/HOVAGI games.

## Play

Serve the repository with any static HTTP server, then open `/origin-link/`. No bundler, account, backend, or API keys. All runtime dependencies are local. Requires WebGL and JavaScript. Landscape is recommended on phones.

Build identity: `OL-001.20261011` (also exposed as `window.originLink.build`).

## Controls

- WASD / left touch stick: move; forward/back climb while attached.
- Arrow keys / drag scene / right touch stick: camera.
- T / LOCK: choose or cycle visible enemy; charges accrue while visible, within 23 meters.
- Space / ATTACK: release stored whole charges (1–6), one dash hit per charge. Attacks can stop early if the target dies or a wall blocks the route.
- Automatic basic sword attacks within 2.65 meters; disabled in cover, while crouching or climbing. Toggle in Pause.
- C: crouch; E: attach to / leave nearby cover; hold Q: peek.
- Shift: dodge (stamina cost); G: summon allied Guardian.
- F: climb nearby Guardian / drop; forward to reach shoulder.
- Attack on the hostile colossus's upper back: damage its exposed core.
- Escape: pause. Restart restores the training route.

## Training route

Hug cover, release a charged dash, summon the west courtyard Guardian, climb to its shoulder, then climb and disable the northeast hostile colossus. These are test objectives, not approved story events.

## Current limits

- Procedural low-poly characters and scenery, not the illustrated concept-art models. No existing 3D model references were present in this website repository. Model identities remain provisional.
- Simple AI, sword animation and a guided climbing surface rather than arbitrary mesh climbing. Drop places the player safely at ground level; no physically simulated fall animation yet.
- Guardian transformation is not implemented in this build. The newer allied summon and climbing direction is implemented.
- One arena, no campaign, persistence, voice, NPC dialogue, audio, equipment system or network multiplayer.
- Phone performance is not inferred from desktop testing. Physical Samsung testing remains necessary.
- No private artwork or unrelated project files are included.

## Development / validation

`node --test tests/core.test.mjs` checks wall blocking, charge count, stealth attack gating, targeting, guard visibility and climbing stamina. `node --check game.js` checks syntax.

`?test=1` exposes development-only state setup hooks; ordinary URLs expose read-only diagnostics. This is an offline single-player prototype with no authoritative server state.

Three.js 0.160.1 is vendored in `vendor/` with its MIT license. Application code is kept separate in `game.js` and `core.js`; UI in `index.html` / `style.css`.
