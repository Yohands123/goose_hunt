// Loads the territories into MongoDB as GeoJSON with a 2dsphere index, then runs a sample geo query.
import { MongoClient } from "mongodb";
import { mapData } from "./shared";

const url = process.env.MONGO_URL ?? "mongodb://localhost:27017";
const client = await new MongoClient(url).connect();
const col = client.db("goose").collection("geofences");
await col.deleteMany({});
await col.insertMany(mapData.territories.map((t) => ({ _id: t.id as never, name: t.name, city: t.city, geometry: { type: "Polygon", coordinates: [t.ring] } })));
await col.createIndex({ geometry: "2dsphere" });
const uw = await col.findOne({ geometry: { $geoIntersects: { $geometry: { type: "Point", coordinates: [-80.5449, 43.4723] } } } });
console.log(`seeded ${mapData.territories.length} geofences; UW campus point is in: ${uw?.name}`);
await client.close();
