//! cargo run --release --bin bench
//! Geofence lookups per second with a realistic geofence count:
//! the 24 neighbourhoods plus one 75 m geofence around every GRT bus stop.
use goose_engine::{GeofenceIndex, Polygon};
use std::time::Instant;

fn points(n: usize, seed: u64) -> Vec<(f64, f64)> {
    let mut s = seed;
    (0..n).map(|_| {
        s = s.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        // bias half the points toward the urban core, where geofences are dense
        let spread = if s & 1 == 0 { (0.4, 0.22) } else { (0.12, 0.08) };
        let base = if s & 1 == 0 { (-80.63, 43.32) } else { (-80.55, 43.42) };
        let lon = base.0 + (s >> 33) as f64 / (1u64 << 31) as f64 * spread.0;
        let lat = base.1 + ((s >> 11) & 0xFFFFF) as f64 / (1u64 << 20) as f64 * spread.1;
        (lon, lat)
    }).collect()
}

fn octagon(lon: f64, lat: f64, r_m: f64) -> Vec<[f64; 2]> {
    let dlat = r_m / 110_574.0;
    let dlon = r_m / (111_320.0 * lat.to_radians().cos());
    (0..8).map(|i| { let a = i as f64 * std::f64::consts::PI / 4.0; [lon + dlon * a.cos(), lat + dlat * a.sin()] }).collect()
}

fn time<F: Fn(f64, f64) -> usize>(pts: &[(f64, f64)], f: F) -> (f64, usize) {
    let t = Instant::now();
    let hits: usize = pts.iter().map(|p| f(p.0, p.1)).sum();
    (pts.len() as f64 / t.elapsed().as_secs_f64(), hits)
}

fn main() {
    let json = std::fs::read_to_string(std::env::var("MAP_DATA").unwrap_or_else(|_| "../data/kwc.json".into())).unwrap();
    let v: serde_json::Value = serde_json::from_str(&json).unwrap();
    let base = GeofenceIndex::from_json(&json, 1000.0).unwrap();

    let mut polys: Vec<Polygon> = v["territories"].as_array().unwrap().iter().map(|t| {
        let ring: Vec<[f64; 2]> = serde_json::from_value(t["ring"].clone()).unwrap();
        Polygon::new(t["id"].as_str().unwrap().into(), t["name"].as_str().unwrap().into(), t["city"].as_str().unwrap().into(), &ring)
    }).collect();
    for (i, s) in v["busStops"].as_array().unwrap().iter().enumerate() {
        let (lon, lat) = (s["at"][0].as_f64().unwrap(), s["at"][1].as_f64().unwrap());
        polys.push(Polygon::new(format!("stop-{i}"), s["name"].as_str().unwrap().into(), "stop".into(), &octagon(lon, lat, 75.0)));
    }
    let n_polys = polys.len();
    let idx = GeofenceIndex::build(polys, Vec::new(), 250.0);
    drop(base);

    let n = 1_000_000;
    let pts = points(n, 42);
    let (brute, h1) = time(&pts, |a, b| idx.count_containing_brute(a, b));
    let (grid, h2) = time(&pts, |a, b| idx.count_containing(a, b));
    assert_eq!(h1, h2, "index and brute force disagree");

    let cores = std::thread::available_parallelism().map(|n| n.get()).unwrap_or(1);
    println!("{n_polys} polygon geofences, {n} random points, {h1} geofence matches");
    println!("brute force (check every polygon): {:>11.0} lookups/s per core", brute);
    println!("grid index (250 m cells)         : {:>11.0} lookups/s per core  ({:.0}x faster)", grid, grid / brute);
    println!("one core sustains ~{:.0} billion lookups/day ({} core(s) on this machine)", grid * 86_400.0 / 1e9, cores);
}
