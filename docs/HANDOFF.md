# Handoff notes

Agents write here when they need something from a folder they don't own, or want to change a contract.
Newest at the top. Mark items done instead of deleting them.

Format:
- [ ] **from → to**: what's needed and why. (date)

## Open

- [ ] **engine → api, web (FYI)**: new additive engine route `GET /v1/stats` → `{ requests, lookups, total_lookup_ns, avg_lookup_ns }`
  (std atomics, no new dependencies; `/v1/locate` unchanged). Documented in `CONTRACTS.md` §2. Nothing required;
  the api could surface it next to `/v1/stats/busiest` or the load test could print it. (2026-10-12)
- [ ] **web → data**: add a real Grand River polyline for the map (needs a licensed source).
- [ ] **api → web**: show server events in the feed when `apiBase` is set (wired, needs a visual tag).

## Done
