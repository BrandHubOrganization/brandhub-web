import * as glue from "../wasm/opencut_wasm_bg.js";
import wasmUrl from "../wasm/opencut_wasm_bg.wasm?url";
import { connectHost } from "./platform/host";

try {
  await connectHost();
  const response = await fetch(wasmUrl);
  if (!response.ok) throw new Error("Could not load the video renderer");
  const { instance } = await WebAssembly.instantiate(await response.arrayBuffer(), { "./opencut_wasm_bg.js": glue });
  glue.__wbg_set_wasm(instance.exports);
  (instance.exports.__wbindgen_start as () => void)();
  await import("./editor-app");
} catch (error) {
  const status = document.querySelector<HTMLElement>(".boot-status");
  if (status) {
    status.setAttribute("role", "alert");
    status.textContent = error instanceof Error ? error.message : "Could not load Video Space";
  }
}
