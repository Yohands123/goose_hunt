// The API reuses the exact geofence + smoothing code that runs in the browser.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { buildWorld, cityZone, streetZone, type MapData, type World, type Zone } from "../../web/src/game/engine";

export * from "../../web/src/game/engine";
export * from "../../web/src/game/geo";

export const MAP_PATH = process.env.MAP_DATA ?? fileURLToPath(new URL("../../data/kwc.json", import.meta.url));
export const mapData: MapData = JSON.parse(readFileSync(MAP_PATH, "utf8"));
export const world: World = buildWorld(mapData);

const zoneCache = new Map<string, Zone>();
export function zoneFor(kind: "city" | "street", id: string): Zone {
  const key = `${kind}:${id}`;
  let z = zoneCache.get(key);
  if (!z) {
    z = kind === "city" ? cityZone(world, id) : streetZone(world, id);
    zoneCache.set(key, z);
  }
  return z;
}
