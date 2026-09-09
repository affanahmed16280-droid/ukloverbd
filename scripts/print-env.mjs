#!/usr/bin/env node
/**
 * Prints the required NEXT_PUBLIC_FIREBASE_* variables from .env.local in a
 * form you can copy straight into Vercel (Project → Settings → Environment
 * Variables) or any other hosting provider's environment settings.
 *
 * Usage:
 *   node scripts/print-env.mjs            # print KEY=VALUE lines
 *   node scripts/print-env.mjs --check    # only verify presence (no secrets)
 *   node scripts/print-env.mjs --clip     # copy KEY=VALUE lines to clipboard
 *
 * These are public web-app identifiers (like an API key). They are safe to
 * paste into the Vercel dashboard, but never commit them to git.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const REQUIRED = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local in the project root.");
  process.exit(1);
}

const values = new Map();
for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#") || !line.includes("=")) continue;
  const eq = line.indexOf("=");
  const key = line.slice(0, eq).trim();
  let value = line.slice(eq + 1).trim();
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    value = value.slice(1, -1);
  }
  values.set(key, value);
}

const missing = REQUIRED.filter((key) => !(values.get(key) ?? "").trim());

if (missing.length > 0) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  console.error("Fill them in first — see FIREBASE_SETUP.md section 1.");
  process.exit(1);
}

if (process.argv.includes("--check")) {
  for (const key of REQUIRED) {
    console.log(`  OK  ${key}  (length ${values.get(key).length})`);
  }
  console.log("All required Firebase variables are present in .env.local.");
  process.exit(0);
}

const lines = REQUIRED.map((key) => `${key}=${values.get(key)}`);
const block = lines.join("\n");

if (process.argv.includes("--clip")) {
  try {
    if (process.platform === "win32") {
      spawnSync("clip", [], { input: block, stdio: "ignore" });
    } else {
      spawnSync("xclip", ["-selection", "clipboard"], {
        input: block,
        stdio: "ignore",
      });
    }
    console.log(
      "Copied to clipboard. Paste in Vercel → Settings → Environment Variables, then redeploy."
    );
  } catch {
    console.log(block);
  }
} else {
  console.log(block);
}