# Decisions

Short records of choices and trade-offs ("80% of the impact for 20% of the cost").

- **Territories are Voronoi cells of neighbourhood anchors, clipped to city outlines.**
  Real neighbourhood boundaries vary by source; this gives believable board-game shapes from a few points.
- **City outlines are hand-traced** and checked against where GRT bus stops fall (96% of stops land in a city).
  Official boundary services weren't reachable from the build environment.
- **Grid index instead of an R-tree.** With ~1,500 geofences the grid is 26x faster than brute force and
  needs no dependency. Revisit past ~100k geofences.
- **Rust does lookups only; Node holds state.** Lookups are the hot, stateless part. State (Redis) and
  events (MongoDB) are easier to evolve in TypeScript, and the smoothing code is shared with the browser.
- **Memory fallbacks** for Redis and MongoDB so anyone can run the API with zero setup.
- **No Spark/Airflow.** The event volume doesn't justify them; a MongoDB aggregation answers "busiest neighbourhood".
- **Simulated time runs 60x** so a demo visitor sees driving, flying and claims within seconds.
