//! HTTP service: POST /v1/locate with a batch of [lon, lat] points.
use axum::{extract::State, routing::{get, post}, Json, Router};
use goose_engine::GeofenceIndex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Deserialize)]
struct LocateReq { points: Vec<[f64; 2]> }

#[derive(Serialize)]
struct LocateHit { territory: Option<String>, territory_name: Option<String>, city: Option<String> }

async fn locate(State(idx): State<Arc<GeofenceIndex>>, Json(req): Json<LocateReq>) -> Json<Vec<LocateHit>> {
    Json(req.points.iter().map(|p| {
        let h = idx.locate(p[0], p[1]);
        LocateHit {
            territory: h.territory.map(|t| t.id.clone()),
            territory_name: h.territory.map(|t| t.name.clone()),
            city: h.city.map(|c| c.id.clone()),
        }
    }).collect())
}

#[tokio::main]
async fn main() {
    let path = std::env::var("MAP_DATA").unwrap_or_else(|_| "../data/kwc.json".into());
    let json = std::fs::read_to_string(&path).unwrap_or_else(|e| panic!("cannot read {path}: {e}"));
    let idx = Arc::new(GeofenceIndex::from_json(&json, 1000.0).expect("bad map data"));
    println!("loaded {} territories, {} cities", idx.territories.len(), idx.cities.len());

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/v1/locate", post(locate))
        .with_state(idx);
    let addr = format!("0.0.0.0:{}", std::env::var("PORT").unwrap_or_else(|_| "7070".into()));
    println!("goose-engine listening on {addr}");
    axum::serve(tokio::net::TcpListener::bind(&addr).await.unwrap(), app).await.unwrap();
}
