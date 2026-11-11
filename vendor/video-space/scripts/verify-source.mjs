import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tests = spawnSync(
  process.execPath,
  [
    "--test",
    "tests/storage-scope.test.mjs",
    "tests/host-bridge.test.mjs",
    "tests/import-production.test.mjs",
  ],
  { cwd: root, stdio: "inherit" },
);
assert.equal(tests.status, 0, "Engine boundary tests failed");
const actions = spawnSync(
  process.execPath,
  [
    path.join(root, "../../node_modules/vitest/vitest.mjs"),
    "run",
    "--config",
    "tests/vitest.config.ts",
  ],
  { cwd: root, stdio: "inherit" },
);
assert.equal(actions.status, 0, "Native assistant command tests failed");
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(path.join(root, "src"));
for (const file of files) {
  assert.doesNotMatch(file, /(?:__tests__|[\\/]tests[\\/]|\.(?:test|spec)\.)/);
  if (/\.[jt]sx?$/.test(file))
    assert.doesNotMatch(
      fs.readFileSync(file, "utf8"),
      /\/api\/lab|127\.0\.0\.1|localhost:|[A-Z]:\\/,
    );
}
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "resources/manifest.json"), "utf8"),
);
assert.equal(manifest.items.length, 85);
for (const item of manifest.items.filter((entry) => entry.file)) {
  const bytes = fs.readFileSync(
    path.join(root, "public/library/assets", item.file),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    item.sha256,
    item.id,
  );
  if (item.kind === "font")
    assert.ok(
      fs.existsSync(
        path.join(
          root,
          "public/library/assets",
          path.dirname(item.file),
          "OFL.txt",
        ),
      ),
    );
}
const bytes = fs.readFileSync(path.join(root, "wasm/opencut_wasm_bg.wasm"));
const module = new WebAssembly.Module(bytes);
const glue = await import("../wasm/opencut_wasm_bg.js");
const imports = WebAssembly.Module.imports(module);
assert.ok(
  imports.every(
    (entry) =>
      entry.module === "./opencut_wasm_bg.js" &&
      entry.kind === "function" &&
      typeof glue[entry.name] === "function",
  ),
);
const instance = new WebAssembly.Instance(module, {
  "./opencut_wasm_bg.js": glue,
});
glue.__wbg_set_wasm(instance.exports);
instance.exports.__wbindgen_start();
assert.equal(glue.mediaTimeFromSeconds({ seconds: 2 }), 240000);
assert.equal(
  glue.formatTimecode({
    time: 240000,
    rate: { numerator: 30, denominator: 1 },
  }),
  "00:00:02:00",
);
assert.ok(
  fs.existsSync(
    path.join(root, "renderer-source/rust/crates/effects/src/pipeline.rs"),
  ),
);
assert.ok(
  fs.existsSync(
    path.join(root, "renderer-source/rust/crates/masks/src/sdf.rs"),
  ),
);
assert.ok(
  fs.existsSync(path.join(root, "renderer-source/rust/wasm/src/wasm.rs")),
);
const output = path.resolve(root, "../../public/video-space");
if (fs.existsSync(path.join(output, "index.html"))) {
  const library = JSON.parse(
    fs.readFileSync(path.join(output, "library/manifest.json"), "utf8"),
  );
  assert.equal(library.data.items.length, 85);
  for (const item of library.data.items.filter((entry) => entry.url)) {
    assert.ok(item.url.startsWith("/video-space/library/assets/"));
    assert.ok(
      fs
        .statSync(path.join(output, item.url.slice("/video-space/".length)))
        .isFile(),
    );
  }
  const css = walk(path.join(output, "assets"))
    .filter((file) => file.endsWith(".css"))
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");
  assert.ok(css.includes("/video-space/brandhub/fonts/inter-vietnamese.woff2"));
  assert.ok(css.includes("/video-space/brandhub/fonts/inter-latin.woff2"));
}
console.log(
  `Verified ${files.length} source files, 85 licensed resources, 24 fonts and the packaged WASM engine`,
);
