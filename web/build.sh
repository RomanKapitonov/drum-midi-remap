#!/usr/bin/env bash
# Build the WASM module + JS bindings into web/pkg, then serve.
# Requires: rustup target add wasm32-unknown-unknown; cargo install wasm-bindgen-cli --version 0.2.126
set -euo pipefail
cd "$(dirname "$0")/.."

cargo build -p midiremap-wasm --target wasm32-unknown-unknown --release
wasm-bindgen target/wasm32-unknown-unknown/release/midiremap_wasm.wasm \
  --out-dir web/pkg --target web

echo "Built web/pkg. Serve with:  python -m http.server -d web 8080"
echo "Then open http://localhost:8080"
