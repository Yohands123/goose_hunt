# engine/ (Rust)

You own this folder. Polygon geofence lookups, served over HTTP, plus a benchmark.

- `src/lib.rs`: projection, `Polygon`, `GeofenceIndex` (uniform grid of cells → candidate polygons),
  `LookupStats` (atomic counters behind `/v1/stats`).
- `src/main.rs`: axum server, `POST /v1/locate`, `GET /v1/stats`, `GET /health`. Port from `PORT` (7070), data from `MAP_DATA`.
  `/v1/stats` counts per point and times per batch (one `Instant` + three relaxed atomic adds per request, never per point);
  see `docs/CONTRACTS.md` §2 for what each number means.
- `src/bin/bench.rs`: 24 neighbourhoods + a 75 m geofence per bus stop (~1,500 total), indexed vs brute force.

## Checks (run before finishing)

```bash
cargo build --release && cargo test --release && ./target/release/bench
```

Last measured on 1 core (2026-10-12): brute force ~280k lookups/s, grid index ~8.2M lookups/s (29x).
If you change the index, rerun the bench and update this line and the README.

## Rules

- Toolchain is Rust 1.75. Dependencies are pinned in Cargo.toml/Cargo.lock; check MSRV before upgrading
  (`hyper-util` was pinned to 0.1.10 for this reason).
- The projection constants must match `web/src/game/geo.ts` exactly.
- The response shape of `/v1/locate` is a contract (`docs/CONTRACTS.md`). Additive fields only.
- No allocations inside the lookup loop; keep `locate` returning references.
- Keep `index_matches_brute_force` passing; it's the safety net for any index change.
