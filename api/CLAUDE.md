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
npm run dev            # then: curl localhost:8080/health
npm run loadtest -- 1000 15 8
```

Last measured, everything on one shared core (API + Rust engine + Redis + load generator):
8 in flight → 326 req/s, 1,631 fixes/s, p50 18.6 ms, p99 92 ms. 64 in flight → 1,791 fixes/s.
Update these if you change the hot path.

## Rules

- One engine call per request (batch the points). Never one call per fix.
- Time in this service is simulated seconds; timings in `track.ts` are the browser's real-second values × 60.
- Request/response shapes of `/v1/track` are a contract. Error messages say what was wrong and how to fix it.
- Don't trust client data: validate with the Fastify schema, cap batch sizes.
