// Catches "policy text changed but the version was not bumped".
//
//   npm run policy:check   -> fails if a policy page's text changed since the last stamp
//                             while its version in src/content/legal.ts stayed the same
//   npm run policy:stamp   -> records the current text + versions (run after bumping,
//                             or after a typo-only fix that needs no re-acceptance)
//
// Terms = terms page + refund policy page (the refund policy is part of the Terms).
// Privacy = privacy page. Versions live in LEGAL.termsVersion / LEGAL.privacyVersion;
// changing one makes every signed-in person accept again (see src/components/legal/policy-gate.tsx).

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { LEGAL } from "../src/content/legal";

const STAMP_FILE = "src/content/legal-stamp.json";

const DOCS = {
  terms: { files: ["src/app/terms/page.tsx", "src/app/refund-policy/page.tsx"], version: LEGAL.termsVersion },
  privacy: { files: ["src/app/privacy/page.tsx"], version: LEGAL.privacyVersion },
} as const;

// Line endings / indentation must not matter (Windows vs the Netlify build).
function hashOf(files: readonly string[]): string {
  const text = files.map((f) => readFileSync(f, "utf8").replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim()).join("\n---\n");
  return createHash("sha256").update(text).digest("hex").slice(0, 16);
}

type Stamp = Record<string, { version: string; hash: string }>;

const current: Stamp = {};
for (const [name, d] of Object.entries(DOCS)) current[name] = { version: d.version, hash: hashOf(d.files) };

if (process.argv.includes("--stamp")) {
  writeFileSync(STAMP_FILE, JSON.stringify(current, null, 2) + "\n");
  console.log("Stamped:", JSON.stringify(current));
  process.exit(0);
}

if (!existsSync(STAMP_FILE)) {
  console.error(`No ${STAMP_FILE}. Run: npm run policy:stamp`);
  process.exit(1);
}
const saved = JSON.parse(readFileSync(STAMP_FILE, "utf8")) as Stamp;

let bad = false;
for (const name of Object.keys(DOCS)) {
  const was = saved[name];
  const now = current[name];
  if (!was) {
    console.error(`${name}: not in the stamp file. Run: npm run policy:stamp`);
    bad = true;
  } else if (was.hash !== now.hash && was.version === now.version) {
    console.error(
      `${name}: the text changed but the version is still "${now.version}". Bump LEGAL.${name}Version in ` +
        `src/content/legal.ts (everyone re-accepts), then run: npm run policy:stamp. ` +
        `(Typo-only fix? Just run policy:stamp.)`
    );
    bad = true;
  } else if (was.hash !== now.hash || was.version !== now.version) {
    console.error(`${name}: changed and version bumped, but the stamp is stale. Run: npm run policy:stamp`);
    bad = true;
  }
}
if (bad) process.exit(1);
console.log("Policy versions OK.");
