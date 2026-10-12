# web/ (TypeScript, Next.js)

You own this folder, including the shared engine code the API imports.

- `src/game/geo.ts`: projection, point-in-polygon, nearest-on-line, `GridIndex` for the Nearby list.
- `src/game/engine.ts`: world building, zones, `Tracker` (GPS smoothing + motion classification). **Shared with api/**:
  keep it free of DOM code, and keep exported signatures stable (api imports them).
- `src/game/game.ts`: the game: SVG map, simulation loop, HUD, modals, input, optional API mirror (`apiBase`).
- `src/game/art.ts`: original goose artwork per state. `styles.css`: all styles, tokens on `:root`.
- `build-demo.mjs`: bundles the game to `public/goose-game.js` and writes `dist/index.html` (single-file demo).
- `app/`: the Next.js shell that loads `public/goose-game.js` and `public/kwc.json`.

## Checks

```bash
npm run typecheck
npm run demo          # then open dist/index.html
npm run dev           # Next.js on :3000
```

## Rules

- Desktop-first website. Small-screen CSS is only a fallback so the layout doesn't break.
- Performance: static map layers are drawn once. Per frame, only the goose transform (and the camera when
  following) is written. HUD text updates at 10 Hz. Screen-sized elements rescale on zoom only.
- All geometry is in metres; strokes use `vector-effect="non-scaling-stroke"`.
- Original art only. No Minecraft/Mario/Risk assets or names, no GRT map artwork (transit *data* is fine with attribution).
- Colours come from CSS variables in `styles.css`; light and dark themes must both work.
- If you change `engine.ts` exports or thresholds, note it in `docs/HANDOFF.md` for the api agent.
