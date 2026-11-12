# Upstream and renderer provenance

OpenCut upstream reference: `cf5e79e919144200294fb9fed22a222592a0aeea`.
Upstream project: https://github.com/OpenCut-app/opencut-classic .

This package carries the reviewed BrandHub manual-editor derivative of that source, including the renderer/filter/mask/font changes present at integration. `UPSTREAM_FILES.json` records the original reachable UI source selection; integration adapters replace framework routing, auth/network boundaries and storage names. The natural-language edit planner was removed from this phase. The packaged WASM and generated JavaScript glue were copied as one matching set.

The actual Rust sources and WGSL shaders used by the reviewed renderer are included in `renderer-source/rust`. Its Cargo workspace removes the unrelated desktop application member. `renderer-source/Cargo.lock` preserves the reviewed Rust dependency lock. Normal npm builds consume `wasm/` and require no Rust toolchain.

To rebuild the renderer with Rust supporting edition 2024, the `wasm32-unknown-unknown` target and wasm-pack 0.15.0:

```sh
cd renderer-source
rustup target add wasm32-unknown-unknown
wasm-pack build rust/wasm --target bundler --out-dir pkg --mode no-install --no-opt
```

Copy `rust/wasm/pkg/opencut_wasm_bg.js`, `opencut_wasm_bg.wasm` and `opencut_wasm.d.ts` into this package's `wasm/` directory together, then run the npm verification and build commands. The JS/WASM import namespace is intentionally `./opencut_wasm_bg.js`; bootstrap binds it explicitly before loading editor modules. Rebuilding may produce different bytes across toolchain versions; the included binary is the reviewed distributable.

Licenses:

- OpenCut editor/Rust source: `LICENSE-OpenCut.txt` (MIT).
- Original synthetic audio, sticker artwork and template recipes: `resources/CC0-1.0.txt` and `resources/ORIGINAL-ASSETS.txt`.
- The 24 fonts retain their own `public/library/assets/fonts/<family>/OFL.txt` notices and metadata. Inter UI font notices also remain in `public/brandhub/fonts`.

No environment files, databases, Git metadata, tool installations or test fixtures from the reference workspace are included.
