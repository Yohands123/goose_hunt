// Device state lives in Redis (fast, short-lived); events go to MongoDB (durable, queryable).
// Without REDIS_URL / MONGO_URL both fall back to memory so the API runs with zero setup.
import { Redis } from "ioredis";
import { MongoClient, type Collection } from "mongodb";
import type { DeviceState, GooseEvent } from "./track";

export interface DeviceStore { kind: string; get(id: string): Promise<DeviceState | null>; set(id: string, s: DeviceState): Promise<void> }
export interface EventStore {
  kind: string;
  insert(events: GooseEvent[]): Promise<void>;
  busiest(limit: number): Promise<{ territory: string; territoryName: string; enters: number; claims: number }[]>;
  recent(deviceId: string, limit: number): Promise<GooseEvent[]>;
}

class MemoryDevices implements DeviceStore {
  kind = "memory";
  private m = new Map<string, string>();
  async get(id: string) { const s = this.m.get(id); return s ? (JSON.parse(s) as DeviceState) : null; }
  async set(id: string, s: DeviceState) { this.m.set(id, JSON.stringify(s)); }
}
class RedisDevices implements DeviceStore {
  kind = "redis";
  constructor(private r: Redis) {}
  async get(id: string) { const s = await this.r.get(`device:${id}`); return s ? (JSON.parse(s) as DeviceState) : null; }
  async set(id: string, s: DeviceState) { await this.r.set(`device:${id}`, JSON.stringify(s), "EX", 3600); }
}

class MemoryEvents implements EventStore {
  kind = "memory";
  private all: GooseEvent[] = [];
  async insert(e: GooseEvent[]) { this.all.push(...e); if (this.all.length > 200_000) this.all.splice(0, 100_000); }
  async busiest(limit: number) {
    const m = new Map<string, { territory: string; territoryName: string; enters: number; claims: number }>();
    for (const e of this.all) {
      if (!e.territory || (e.type !== "enter" && e.type !== "claim")) continue;
      const row = m.get(e.territory) ?? { territory: e.territory, territoryName: e.territoryName ?? "", enters: 0, claims: 0 };
      if (e.type === "enter") row.enters++; else row.claims++;
      m.set(e.territory, row);
    }
    return [...m.values()].sort((a, b) => b.enters - a.enters).slice(0, limit);
  }
  async recent(deviceId: string, limit: number) { return this.all.filter((e) => e.deviceId === deviceId).slice(-limit).reverse(); }
}
class MongoEvents implements EventStore {
  kind = "mongodb";
  constructor(private c: Collection<GooseEvent>) {}
  async insert(e: GooseEvent[]) { if (e.length) await this.c.insertMany(e.map((x) => ({ ...x }))); }
  async busiest(limit: number) {
    return this.c.aggregate<{ territory: string; territoryName: string; enters: number; claims: number }>([
      { $match: { type: { $in: ["enter", "claim"] }, territory: { $ne: null } } },
      { $group: { _id: "$territory", territoryName: { $first: "$territoryName" },
        enters: { $sum: { $cond: [{ $eq: ["$type", "enter"] }, 1, 0] } }, claims: { $sum: { $cond: [{ $eq: ["$type", "claim"] }, 1, 0] } } } },
      { $sort: { enters: -1 } }, { $limit: limit },
      { $project: { _id: 0, territory: "$_id", territoryName: 1, enters: 1, claims: 1 } },
    ]).toArray();
  }
  async recent(deviceId: string, limit: number) {
    return this.c.find({ deviceId }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(limit).toArray();
  }
}

export async function openStores(): Promise<{ devices: DeviceStore; events: EventStore }> {
  const devices: DeviceStore = process.env.REDIS_URL ? new RedisDevices(new Redis(process.env.REDIS_URL)) : new MemoryDevices();
  let events: EventStore = new MemoryEvents();
  if (process.env.MONGO_URL) {
    const client = await new MongoClient(process.env.MONGO_URL).connect();
    const col = client.db("goose").collection<GooseEvent>("events");
    await col.createIndex({ deviceId: 1, createdAt: -1 });
    await col.createIndex({ type: 1, territory: 1 });
    events = new MongoEvents(col);
  }
  return { devices, events };
}
