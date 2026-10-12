//! HTTP service: POST /v1/locate with a batch of [lon, lat] points, GET /v1/stats for counters.
use axum::{extract::State, routing::{get, post}, Json, Router};
use goose_engine::{GeofenceIndex, LookupStats, StatsSnapshot};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::Instant;

#[derive(Deserialize)]
struct LocateReq { points: Vec<[f64; 2]> }

#[derive(Serialize)]
struct LocateHit { territory: Option<String>, territory_name: Option<String>, city: Option<String> }

#[derive(Clone)]
struct AppState { idx: Arc<GeofenceIndex>, stats: Arc<LookupStats> }

/// Times the whole batch (lookups plus building the response rows), then records it once.
/// JSON parsing, serialization and network time are not included.
async fn locate(State(app): State<AppState>, Json(req): Json<LocateReq>) -> Json<Vec<LocateHit>> {
    let started = Instant::now();
    let hits: Vec<LocateHit> = req.points.iter().map(|p| {
        let h = app.idx.locate(p[0], p[1]);
        LocateHit {
            territory: h.territory.map(|t| t.id.clone()),
            territory_name: h.territory.map(|t| t.name.clone()),
            city: h.city.map(|c| c.id.clone()),
        }
    }).collect();
    app.stats.record_batch(req.points.len(), started.elapsed());
    Json(hits)
}

async fn stats(State(app): State<AppState>) -> Json<StatsSnapshot> {
    Json(app.stats.snapshot())
}

fn router(idx: Arc<GeofenceIndex>) -> Router {
    Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/v1/locate", post(locate))
        .route("/v1/stats", get(stats))
        .with_state(AppState { idx, stats: Arc::new(LookupStats::default()) })
}

#[tokio::main]
async fn main() {
    let path = std::env::var("MAP_DATA").unwrap_or_else(|_| "../data/kwc.json".into());
    let json = std::fs::read_to_string(&path).unwrap_or_else(|e| panic!("cannot read {path}: {e}"));
    let idx = Arc::new(GeofenceIndex::from_json(&json, 1000.0).expect("bad map data"));
    println!("loaded {} territories, {} cities", idx.territories.len(), idx.cities.len());

    let app = router(idx);
    let addr = format!("0.0.0.0:{}", std::env::var("PORT").unwrap_or_else(|_| "7070".into()));
    println!("goose-engine listening on {addr}");
    axum::serve(tokio::net::TcpListener::bind(&addr).await.unwrap(), app).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{Read, Write};

    /// Minimal HTTP/1.1 client over std (no extra dependencies). Returns the response body.
    fn http(addr: std::net::SocketAddr, method: &str, path: &str, body: &str) -> String {
        let mut s = std::net::TcpStream::connect(addr).unwrap();
        write!(s, "{method} {path} HTTP/1.1\r\nHost: test\r\nContent-Type: application/json\r\n\
                   Content-Length: {}\r\nConnection: close\r\n\r\n{body}", body.len()).unwrap();
        let mut out = String::new();
        s.read_to_string(&mut out).unwrap();
        assert!(out.starts_with("HTTP/1.1 200"), "unexpected response: {out}");
        out.split("\r\n\r\n").nth(1).unwrap_or("").to_string()
    }

    #[tokio::test(flavor = "multi_thread")]
    async fn stats_endpoint_counts_points_from_locate() {
        let json = std::fs::read_to_string("../data/kwc.json").unwrap();
        let app = router(Arc::new(GeofenceIndex::from_json(&json, 1000.0).unwrap()));
        let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
        let addr = listener.local_addr().unwrap();
        tokio::spawn(async move { axum::serve(listener, app).await.unwrap() });

        let body = tokio::task::spawn_blocking(move || {
            let before: serde_json::Value = serde_json::from_str(&http(addr, "GET", "/v1/stats", "")).unwrap();
            assert_eq!(before["requests"], 0);
            assert_eq!(before["lookups"], 0);
            assert_eq!(before["avg_lookup_ns"], 0.0);

            // /v1/locate keeps its contract: same length and order, same fields.
            let hits: serde_json::Value = serde_json::from_str(&http(addr, "POST", "/v1/locate",
                r#"{"points":[[-80.5449,43.4723],[-80.492,43.452],[-80.384,43.457]]}"#)).unwrap();
            assert_eq!(hits.as_array().unwrap().len(), 3);
            assert_eq!(hits[0]["city"], "waterloo");
            assert_eq!(hits[1]["city"], "kitchener");
            assert_eq!(hits[2], serde_json::json!({ "territory": null, "territory_name": null, "city": null }));
            http(addr, "POST", "/v1/locate", r#"{"points":[[-80.323,43.393]]}"#);

            http(addr, "GET", "/v1/stats", "")
        }).await.unwrap();

        let after: serde_json::Value = serde_json::from_str(&body).unwrap();
        assert_eq!(after["requests"], 2);
        assert_eq!(after["lookups"], 4);
        let total = after["total_lookup_ns"].as_u64().unwrap();
        let avg = after["avg_lookup_ns"].as_f64().unwrap();
        assert!((avg - total as f64 / 4.0).abs() < 1e-6, "avg {avg} should be total {total} / 4");
    }
}
