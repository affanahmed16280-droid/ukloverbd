/**
 * Checks Cloudinary Admin API credentials without writing assets or products.
 *
 * Add every candidate pair to .env.local, for example:
 * CLOUDINARY_API_KEY_2=...
 * CLOUDINARY_API_SECRET_2=...
 * CLOUDINARY_API_KEY_3=...
 * CLOUDINARY_API_SECRET_3=...
 *
 * Then run: npm run test-cloudinary
 */
const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ??
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

if (!cloudName) {
  throw new Error(
    "Set CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) in .env.local."
  );
}

const candidates = Object.keys(process.env)
  .filter((name) => /^\uFEFFCLOUDINARY_API_KEY(?:_\d+)?$/.test(name) || /^CLOUDINARY_API_KEY(?:_\d+)?$/.test(name))
  .sort((left, right) => left.localeCompare(right))
  .map((keyName) => {
    const normalizedKeyName = keyName.replace(/^\uFEFF/, "");
    const suffix = normalizedKeyName.slice("CLOUDINARY_API_KEY".length);
    return {
      label: suffix ? `candidate ${suffix.slice(1)}` : "primary candidate",
      key: process.env[keyName],
      secret: process.env[`CLOUDINARY_API_SECRET${suffix}`] ?? process.env[`\uFEFFCLOUDINARY_API_SECRET${suffix}`],
    };
  });

if (!candidates.length) {
  throw new Error("No CLOUDINARY_API_KEY values were found in .env.local.");
}

let validCandidates = 0;

for (const candidate of candidates) {
  if (!candidate.key || !candidate.secret) {
    console.log(`${candidate.label}: skipped (key or secret is missing)`);
    continue;
  }

  const authorization = Buffer.from(`${candidate.key}:${candidate.secret}`).toString(
    "base64"
  );
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/image?max_results=1`,
    { headers: { Authorization: `Basic ${authorization}` } }
  );
  const body = await response.json().catch(() => ({}));
  const keyHint = `…${candidate.key.slice(-4)}`;

  if (response.ok) {
    validCandidates += 1;
    console.log(`${candidate.label} (${keyHint}): VALID for ${cloudName}`);
  } else {
    console.log(
      `${candidate.label} (${keyHint}): invalid for ${cloudName} (${body.error?.message ?? response.statusText})`
    );
  }
}

process.exitCode = validCandidates ? 0 : 1;
