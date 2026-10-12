# api/ (Node.js + TypeScript)

You own this folder. Fastify service that turns GPS fixes into game events.

- `src/server.ts`: routes and request validation.
- `src/track.ts`: per-device logic in two passes: `smooth()` then `applyHits()` (territory hysteresis, claims, zone health).
- `src/locate.ts`: batch territory lookup via the Rust engine (`ENGINE_URL`), TypeScript fallback if it's down.
- `src/stores.ts`: device state in Redis (`REDIS_URL`), events in MongoDB (`MONGO_URL`); both fall back to memory.
- `src/shared.ts`: imports the shared engine from `web/src/game/`. **Do not edit files in web/.** Ask in `docs/HANDOFF.md`.
- `src/seed.ts`: loads territories into MongoDB with a 2dsphere index. `src/loadtest.ts`: concurrent load generator.

## Checks

```bash
npm run typecheck
npm test               # src/*.test.ts (track.ts game logic); needs no Redis, Mongo or engine
npm run dev            # then: curl localhost:8080/health
npm run loadtest -- 1000 15 8
```

Last measured 2026-10-12, warm runs, everything pinned to one core under Docker
(`docker update --cpuset-cpus 0 $(docker compose ps -q)`; API + Rust engine + Redis + MongoDB + load generator):
8 in flight → ~915 req/s, ~4,600 fixes/s, p50 7.5 ms, p99 26 ms. 64 in flight → ~1,060 req/s, ~5,300 fixes/s, p50 53 ms, p99 ~140 ms.
Each run uses fresh device ids; reusing ids replays old timestamps, which the API skips without calling the engine.
Sanity check: the engine's `GET /v1/stats` requests count should rise by the run's ok count.
Update these if you change the hot path.

## Rules

- One engine call per request (batch the points). Never one call per fix.
- Time in this service is simulated seconds; timings in `track.ts` are the browser's real-second values × 60.
- Request/response shapes of `/v1/track` are a contract. Error messages say what was wrong and how to fix it.
- Don't trust client data: validate with the Fastify schema, cap batch sizes.
