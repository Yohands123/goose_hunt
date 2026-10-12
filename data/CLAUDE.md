# data/ (TypeScript)

You own this folder. Produces `kwc.json`, the single map file every other part reads.

- `fetch-gtfs.sh`: downloads the current GRT GTFS (bus + ION) into `./gtfs`.
- `build-map.ts`: city outlines (hand-traced), neighbourhood anchors → Voronoi territories,
  GRT routes → street lines, ION line and stations, bus stops, landmarks.

## Checks

```bash
npx tsx build-map.ts ./gtfs ./kwc.json   # prints counts; expect 24 territories, 9 streets, 19 stations
```

After rebuilding, run `cargo test` in engine/ (it reads this file) and reload the web demo.

## Rules

- The output shape is a contract (`docs/CONTRACTS.md`). Additive changes only without agreement.
- Keep the attribution string: GTFS "contains information provided by the Regional Municipality of Waterloo under licence".
- When moving a city outline, check it against bus stop locations (most stops should land inside a city).
- Keep coordinates rounded to 5 decimals (~1 m) to keep the file small.
