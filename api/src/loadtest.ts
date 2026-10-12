// Simulates many geese hitting POST /v1/track at once.
// npx tsx src/loadtest.ts [devices=1000] [seconds=20] [inFlight=64] [fixesPerRequest=5]
const [devices = 1000, seconds = 20, inFlight = 64, perReq = 5] = process.argv.slice(2).map(Number);
const API = process.env.API_URL ?? "http://localhost:8080";

const geese = Array.from({ length: devices }, (_, i) => ({
  id: `load-${i}`, lat: 43.40 + Math.random() * 0.1, lon: -80.56 + Math.random() * 0.14, t: 8 * 3600,
  heading: Math.random() * Math.PI * 2, zone: { kind: "city", id: ["waterloo", "kitchener", "cambridge"][i % 3] },
}));
const lat: number[] = [];
let fixes = 0, errors = 0, cursor = 0;
const end = Date.now() + seconds * 1000;

async function worker() {
  while (Date.now() < end) {
    const g = geese[cursor++ % geese.length];
    const batch = [];
    for (let k = 0; k < perReq; k++) {
      g.heading += (Math.random() - 0.5) * 0.6;
      g.lat += Math.sin(g.heading) * 0.0015; g.lon += Math.cos(g.heading) * 0.002; g.t += 12;
      batch.push({ lat: g.lat, lon: g.lon, t: g.t });
    }
    const t0 = performance.now();
    try {
      const r = await fetch(`${API}/v1/track`, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ deviceId: g.id, zone: g.zone, fixes: batch }) });
      await r.arrayBuffer();
      if (r.ok) { fixes += perReq; lat.push(performance.now() - t0); } else errors++;
    } catch { errors++; }
  }
}
const t0 = Date.now();
await Promise.all(Array.from({ length: inFlight }, worker));
const secs = (Date.now() - t0) / 1000;
lat.sort((a, b) => a - b);
const pct = (p: number) => lat[Math.min(lat.length - 1, Math.floor(lat.length * p))]?.toFixed(1);
console.log(`${devices} devices, ${inFlight} requests in flight, ${perReq} fixes per request, ${secs.toFixed(1)} s`);
console.log(`requests: ${lat.length} ok, ${errors} failed -> ${(lat.length / secs).toFixed(0)} req/s, ${(fixes / secs).toFixed(0)} fixes/s`);
console.log(`latency ms: p50 ${pct(0.5)}  p95 ${pct(0.95)}  p99 ${pct(0.99)}`);
export {};
