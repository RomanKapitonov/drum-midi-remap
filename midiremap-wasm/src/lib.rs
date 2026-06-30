use std::collections::BTreeMap;

use midiremap_core::{BuiltinMaps, Conversion, DefaultFallbacks, LayeredMaps, MapProvider, Report};
use serde::Serialize;
use wasm_bindgen::prelude::*;

/// JS-friendly view of a [`Report`]: every map keyed by a string so it
/// serializes to a plain JS object (the canonical report uses `u8` / `Canon`
/// keys, which can't be JS object keys directly).
#[derive(Serialize)]
struct ReportView {
    unmapped_source: BTreeMap<String, u32>,
    fallback_used: BTreeMap<String, u32>,
    dropped: BTreeMap<String, u32>,
}

impl From<Report> for ReportView {
    fn from(r: Report) -> Self {
        ReportView {
            unmapped_source: r
                .unmapped_source
                .into_iter()
                .map(|(k, v)| (k.to_string(), v))
                .collect(),
            fallback_used: r
                .fallback_used
                .into_iter()
                .map(|(k, v)| (format!("{k:?}"), v))
                .collect(),
            dropped: r
                .dropped
                .into_iter()
                .map(|(k, v)| (format!("{k:?}"), v))
                .collect(),
        }
    }
}

#[derive(Serialize)]
struct Output {
    bytes: Vec<u8>,
    report: ReportView,
}

/// Convert a drum `.mid` from `src_id` to `tgt_id`.
///
/// `user_maps_json`, if present, is a single engine-map JSON document that adds
/// or overrides an engine before the conversion. Returns `{ bytes, report }`.
#[wasm_bindgen]
pub fn remap(
    mid: &[u8],
    src_id: &str,
    tgt_id: &str,
    user_maps_json: Option<String>,
) -> Result<JsValue, JsValue> {
    let mut provider = LayeredMaps::new(BuiltinMaps::new());
    if let Some(json) = user_maps_json {
        provider = provider
            .with_user_json(&json)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
    }

    let src = provider
        .get(src_id)
        .ok_or_else(|| JsValue::from_str("unknown source engine"))?;
    let tgt = provider
        .get(tgt_id)
        .ok_or_else(|| JsValue::from_str("unknown target engine"))?;

    let fb = DefaultFallbacks;
    let conv = Conversion::new(src, tgt, &fb);
    let out = conv
        .run(mid)
        .map_err(|e| JsValue::from_str(&e.to_string()))?;

    let payload = Output {
        bytes: out.bytes,
        report: out.report.into(),
    };
    // Serialize maps as plain JS objects (all keys are strings in ReportView).
    let serializer = serde_wasm_bindgen::Serializer::new().serialize_maps_as_objects(true);
    payload
        .serialize(&serializer)
        .map_err(|e| JsValue::from_str(&e.to_string()))
}

/// List the built-in engine ids available without any user maps.
#[wasm_bindgen]
pub fn list_engines() -> Vec<String> {
    let mut ids: Vec<String> = BuiltinMaps::new()
        .ids()
        .iter()
        .map(|s| s.to_string())
        .collect();
    ids.sort_unstable();
    ids
}
