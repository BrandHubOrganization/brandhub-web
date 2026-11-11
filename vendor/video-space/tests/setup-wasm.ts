import fs from "node:fs";
import * as glue from "../wasm/opencut_wasm_bg.js";
import { initializeStorageScope } from "../src/platform/storage-scope";
initializeStorageScope("test-user", "test-workspace");
const bytes = fs.readFileSync(
  new URL("../wasm/opencut_wasm_bg.wasm", import.meta.url),
);
const instance = new WebAssembly.Instance(new WebAssembly.Module(bytes), {
  "./opencut_wasm_bg.js": glue,
});
glue.__wbg_set_wasm(instance.exports);
(instance.exports.__wbindgen_start as () => void)();
