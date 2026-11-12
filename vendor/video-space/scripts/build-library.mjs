import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = JSON.parse(fs.readFileSync(path.join(root, "resources/manifest.json"), "utf8"));
const publicFields = new Set(["id", "kind", "name", "category", "tags", "description", "duration", "license", "author", "fontFamily", "template"]);
const fontUrls = {};
const items = source.items.map((item) => {
  const result = Object.fromEntries(Object.entries(item).filter(([key]) => publicFields.has(key)));
  if (item.file) {
    const asset = path.resolve(root, "public/library/assets", item.file);
    assert.ok(asset.startsWith(path.join(root, "public/library/assets") + path.sep));
    assert.ok(fs.statSync(asset).isFile(), `Missing ${item.id}`);
    result.url = `/video-space/library/assets/${item.file}`;
    if (item.kind === "sticker") result.previewUrl = result.url;
    if (item.kind === "font") fontUrls[item.id] = result.url;
  }
  return result;
});
assert.equal(items.length, 85);
assert.equal(Object.keys(fontUrls).length, 24);
fs.mkdirSync(path.join(root, "public/library"), { recursive: true });
fs.writeFileSync(path.join(root, "public/library/manifest.json"), JSON.stringify({ data: { version: 1, items } }));
fs.writeFileSync(path.join(root, "resources/font-urls.json"), JSON.stringify(fontUrls, null, 2) + "\n");
console.log("Prepared 85 library entries and 24 local font URLs");
