const { execSync } = require("child_process");
let raw;
try {
  raw = execSync("npx eslint . -f json", {
    cwd: __dirname,
    stdio: ["ignore", "pipe", "ignore"],
    maxBuffer: 64 * 1024 * 1024,
  }).toString();
} catch (e) {
  raw = e.stdout.toString();
}
const report = JSON.parse(raw);
const rows = [];
const counts = {};
for (const f of report) {
  for (const m of f.messages) {
    if (m.severity !== 2) continue;
    counts[m.ruleId] = (counts[m.ruleId] || 0) + 1;
    rows.push({
      file: f.filePath.replace(/.*brandhub-web-dashboard[\\/]/, "").replace(/\\/g, "/"),
      line: m.line,
      rule: m.ruleId,
      msg: m.message,
    });
  }
}
const skip = new Set([
  "@typescript-eslint/no-unused-vars",
  "react-hooks/set-state-in-effect",
  "react-refresh/only-export-components",
]);
console.log("total errors:", rows.length);
for (const r of rows) {
  if (skip.has(r.rule)) continue;
  console.log(r.file + ":" + r.line, "|", r.rule, "|", r.msg);
}
