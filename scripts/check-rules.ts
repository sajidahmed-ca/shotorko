import { analyze } from "../lib/analyze";
import { SAMPLE_CASES } from "../lib/test-samples";

let failed = 0;

for (const c of SAMPLE_CASES) {
  const r = analyze(c.text);
  const ok = c.expected === "scam" ? r.level !== "low" : r.level === "low";
  if (!ok) failed++;
  const signals = [...r.hits.map((h) => h.id), ...r.links.map(() => "link")].join(", ");
  console.log(
    `${ok ? "PASS" : "FAIL"}  [${c.expected} -> ${r.level} (${r.total})]  ${c.label}${signals ? "  {" + signals + "}" : ""}`
  );
}

console.log(`\n${SAMPLE_CASES.length - failed}/${SAMPLE_CASES.length} passed`);
process.exit(failed ? 1 : 0);
