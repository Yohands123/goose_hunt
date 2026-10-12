// Territory lookups: the Rust engine when ENGINE_URL is set, otherwise the shared TypeScript code.
import { territoryAt, project, world, type LngLat } from "./shared";

export interface Hit { territory: string | null; territoryName: string | null; city: string | null }

export const engineKind = process.env.ENGINE_URL ? "rust" : "typescript";

export async function locateBatch(points: LngLat[]): Promise<Hit[]> {
  if (process.env.ENGINE_URL) {
    try { return await locateRemote(points); }
    catch (e) { console.warn(`rust engine unavailable (${(e as Error).message}); using TypeScript lookup`); }
  }
  return locateLocal(points);
}

async function locateRemote(points: LngLat[]): Promise<Hit[]> {
  {
    const res = await fetch(`${process.env.ENGINE_URL}/v1/locate`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ points }),
    });
    if (!res.ok) throw new Error(`engine ${res.status}`);
    const rows = (await res.json()) as { territory: string | null; territory_name: string | null; city: string | null }[];
    return rows.map((r) => ({ territory: r.territory, territoryName: r.territory_name, city: r.city }));
  }
}

function locateLocal(points: LngLat[]): Hit[] {
  return points.map((p) => {
    const t = territoryAt(world, project(p));
    return { territory: t?.id ?? null, territoryName: t?.name ?? null, city: t?.city ?? null };
  });
}
