//! Polygon geofence index for Goose Turf.
//!
//! Territories are stored in a uniform grid: each cell lists the polygons whose
//! bounding box touches it. A lookup hashes the point to its cell, then runs the
//! exact point-in-polygon test only on those few candidates.

use serde::Deserialize;
use std::collections::HashMap;

const LAT0: f64 = 43.43;
const LON0: f64 = -80.45;
const M_PER_DEG_LAT: f64 = 110_574.0;

/// Same local projection as the web app: metres east/south of (LAT0, LON0).
pub fn project(lon: f64, lat: f64) -> (f64, f64) {
    let m_per_deg_lon = 111_320.0 * LAT0.to_radians().cos();
    ((lon - LON0) * m_per_deg_lon, (LAT0 - lat) * M_PER_DEG_LAT)
}

#[derive(Deserialize)]
struct RawCity { id: String, name: String, ring: Vec<[f64; 2]> }
#[derive(Deserialize)]
struct RawTerritory { id: String, name: String, city: String, ring: Vec<[f64; 2]> }
#[derive(Deserialize)]
struct RawMap { cities: Vec<RawCity>, territories: Vec<RawTerritory> }

#[derive(Debug, Clone, Copy)]
pub struct BBox { pub min_x: f64, pub min_y: f64, pub max_x: f64, pub max_y: f64 }
impl BBox {
    fn of(ring: &[(f64, f64)]) -> Self {
        ring.iter().fold(
            BBox { min_x: f64::MAX, min_y: f64::MAX, max_x: f64::MIN, max_y: f64::MIN },
            |b, &(x, y)| BBox { min_x: b.min_x.min(x), min_y: b.min_y.min(y), max_x: b.max_x.max(x), max_y: b.max_y.max(y) },
        )
    }
    #[inline]
    fn contains(&self, x: f64, y: f64) -> bool { x >= self.min_x && x <= self.max_x && y >= self.min_y && y <= self.max_y }
}

pub struct Polygon { pub id: String, pub name: String, pub city: String, pub ring: Vec<(f64, f64)>, pub bbox: BBox }

impl Polygon {
    pub fn new(id: String, name: String, city: String, ring: &[[f64; 2]]) -> Self {
        let ring: Vec<(f64, f64)> = ring.iter().map(|p| project(p[0], p[1])).collect();
        let bbox = BBox::of(&ring);
        Polygon { id, name, city, ring, bbox }
    }
    /// Ray casting; exact test, only called after the bbox check passes.
    #[inline]
    pub fn contains(&self, x: f64, y: f64) -> bool {
        if !self.bbox.contains(x, y) { return false; }
        let r = &self.ring;
        let mut inside = false;
        let mut j = r.len() - 1;
        for i in 0..r.len() {
            let (xi, yi) = r[i];
            let (xj, yj) = r[j];
            if (yi > y) != (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi { inside = !inside; }
            j = i;
        }
        inside
    }
}

pub struct GeofenceIndex {
    pub territories: Vec<Polygon>,
    pub cities: Vec<Polygon>,
    cells: HashMap<(i32, i32), Vec<u32>>,
    cell_m: f64,
}

pub struct Hit<'a> { pub territory: Option<&'a Polygon>, pub city: Option<&'a Polygon> }

impl GeofenceIndex {
    pub fn from_json(json: &str, cell_m: f64) -> Result<Self, serde_json::Error> {
        let raw: RawMap = serde_json::from_str(json)?;
        let cities = raw.cities.into_iter().map(|c| Polygon::new(c.id.clone(), c.name, c.id, &c.ring)).collect();
        let territories: Vec<Polygon> = raw.territories.into_iter().map(|t| Polygon::new(t.id, t.name, t.city, &t.ring)).collect();
        Ok(Self::build(territories, cities, cell_m))
    }

    /// Build an index over any set of polygons (the benchmark adds thousands of small ones).
    pub fn build(territories: Vec<Polygon>, cities: Vec<Polygon>, cell_m: f64) -> Self {
        let mut cells: HashMap<(i32, i32), Vec<u32>> = HashMap::new();
        for (i, t) in territories.iter().enumerate() {
            let (x0, y0) = ((t.bbox.min_x / cell_m).floor() as i32, (t.bbox.min_y / cell_m).floor() as i32);
            let (x1, y1) = ((t.bbox.max_x / cell_m).floor() as i32, (t.bbox.max_y / cell_m).floor() as i32);
            for cx in x0..=x1 { for cy in y0..=y1 { cells.entry((cx, cy)).or_default().push(i as u32); } }
        }
        GeofenceIndex { territories, cities, cells, cell_m }
    }

    /// Number of geofences containing the point (geofences may overlap).
    pub fn count_containing(&self, lon: f64, lat: f64) -> usize {
        let (x, y) = project(lon, lat);
        let key = ((x / self.cell_m).floor() as i32, (y / self.cell_m).floor() as i32);
        self.cells.get(&key).map_or(0, |ids| ids.iter().filter(|&&i| self.territories[i as usize].contains(x, y)).count())
    }
    pub fn count_containing_brute(&self, lon: f64, lat: f64) -> usize {
        let (x, y) = project(lon, lat);
        self.territories.iter().filter(|t| t.contains(x, y)).count()
    }

    /// Indexed lookup: hash to a grid cell, test only the polygons listed there.
    pub fn locate(&self, lon: f64, lat: f64) -> Hit<'_> {
        let (x, y) = project(lon, lat);
        let key = ((x / self.cell_m).floor() as i32, (y / self.cell_m).floor() as i32);
        let territory = self.cells.get(&key)
            .and_then(|ids| ids.iter().map(|&i| &self.territories[i as usize]).find(|t| t.contains(x, y)));
        let city = match territory {
            Some(t) => self.cities.iter().find(|c| c.id == t.city),
            None => self.cities.iter().find(|c| c.contains(x, y)),
        };
        Hit { territory, city }
    }

    /// Baseline for the benchmark: test every polygon.
    pub fn locate_brute(&self, lon: f64, lat: f64) -> Option<&Polygon> {
        let (x, y) = project(lon, lat);
        self.territories.iter().find(|t| t.contains(x, y))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn idx() -> GeofenceIndex {
        GeofenceIndex::from_json(&std::fs::read_to_string("../data/kwc.json").unwrap(), 1000.0).unwrap()
    }
    #[test]
    fn known_places_land_in_the_right_city() {
        let g = idx();
        // UW campus, Kitchener City Hall, Cambridge Centre, and the airport (outside all three)
        assert_eq!(g.locate(-80.5449, 43.4723).city.map(|c| c.id.as_str()), Some("waterloo"));
        assert_eq!(g.locate(-80.492, 43.452).city.map(|c| c.id.as_str()), Some("kitchener"));
        assert_eq!(g.locate(-80.323, 43.393).city.map(|c| c.id.as_str()), Some("cambridge"));
        assert!(g.locate(-80.384, 43.457).city.is_none());
    }
    #[test]
    fn index_matches_brute_force() {
        let g = idx();
        let mut s: u64 = 7;
        for _ in 0..20_000 {
            s = s.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
            let lon = -80.63 + (s >> 33) as f64 / (1u64 << 31) as f64 * 0.4;
            let lat = 43.32 + (s >> 11 & 0xFFFFF) as f64 / (1u64 << 20) as f64 * 0.22;
            assert_eq!(g.locate(lon, lat).territory.map(|t| &t.id), g.locate_brute(lon, lat).map(|t| &t.id));
        }
    }
}
