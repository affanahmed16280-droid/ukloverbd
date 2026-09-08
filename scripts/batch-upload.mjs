import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { initializeApp as initializeClientApp } from "firebase/app";
import { doc, getDoc, getFirestore as getClientFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesFolder = path.join(projectRoot, "product-images");
const serviceAccountPath = path.join(projectRoot, "serviceAccountKey.json");
const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const includeNonProductAssets = process.argv.includes("--include-non-product-assets");

if (!cloudName || !uploadPreset) {
  throw new Error("Set CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local.");
}
if (!fs.existsSync(imagesFolder)) {
  throw new Error("product-images/ must exist in the project root.");
}

let adminDb = null;
let clientDb = null;

if (fs.existsSync(serviceAccountPath) && process.env.FIREBASE_USE_CLIENT !== "true") {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  if (!getApps().length) initializeApp({ credential: cert({ projectId: serviceAccount.project_id, clientEmail: serviceAccount.client_email, privateKey: serviceAccount.private_key }) });
  adminDb = getFirestore();
}

function getClientDb() {
  if (!clientDb) {
    const app = initializeClientApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }, `batch-upload-${Date.now()}`);
    clientDb = getClientFirestore(app);
  }
  return clientDb;
}

async function productExists(documentId) {
  if (adminDb) {
    try {
      return (await adminDb.collection("products").doc(documentId).get()).exists;
    } catch (error) {
      if (!String(error?.message).includes("ACCESS_TOKEN_EXPIRED") && error?.code !== 16) throw error;
      console.warn("Firebase Admin credentials are expired; falling back to the configured client Firestore rules.");
      adminDb = null;
    }
  }
  return (await getDoc(doc(getClientDb(), "products", documentId))).exists();
}

async function saveProduct(documentId, data) {
  if (adminDb) {
    try {
      await adminDb.collection("products").doc(documentId).set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      return;
    } catch (error) {
      if (!String(error?.message).includes("ACCESS_TOKEN_EXPIRED") && error?.code !== 16) throw error;
      console.warn("Firebase Admin credentials are expired; falling back to the configured client Firestore rules.");
      adminDb = null;
    }
  }
  await setDoc(doc(getClientDb(), "products", documentId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

const imageFiles = fs.readdirSync(imagesFolder, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(jpg|jpeg|png|webp|gif)$/i.test(entry.name))
  .map((entry) => entry.name)
  .sort((left, right) => left.localeCompare(right));

function stableId(filename) {
  return createHash("sha256").update(filename).digest("hex").slice(0, 20);
}

function productMetadata(filename) {
  const filenameWithoutExtension = path.parse(filename).name;
  const normalizedName = filenameWithoutExtension.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const comparableName = normalizedName.toLowerCase();
  const category = /(churi|bangle|bracelet|jewelry|jewellery)/.test(comparableName)
    ? "Jewelry"
    : /(makeup|make up|mesta)/.test(comparableName)
      ? "Cosmetics"
      : /(shampoo|hair)/.test(comparableName)
        ? "Haircare"
        : /(shower gel|toothpaste|lotion|body wash)/.test(comparableName)
          ? "Body Care"
          : "Skincare";

  return {
    name: normalizedName.replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Unnamed product",
    brand: "UK Brand Lover",
    variant: "",
    price: 0,
    category,
    badge: "New",
    needsReview: true,
    sourceFilename: filename,
  };
}

function isNonProductAsset(filename) {
  return /^(logo|hero[- ]?cover)/i.test(path.parse(filename).name);
}

async function unsignedUpload(filename) {
  const extension = path.extname(filename).slice(1).toLowerCase();
  const formData = new FormData();
  formData.append("file", new Blob([fs.readFileSync(path.join(imagesFolder, filename))], { type: `image/${extension === "jpg" ? "jpeg" : extension}` }), filename);
  formData.append("upload_preset", uploadPreset);
  formData.append("public_id", `products/${stableId(filename)}`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: "POST", body: formData });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message ?? `Cloudinary upload failed (${response.status})`);
  return body.public_id;
}

let uploaded = 0;
let created = 0;
let skipped = 0;
let failed = 0;
console.log(`Found ${imageFiles.length} images. Uploading to Cloudinary environment ${cloudName}.`);

for (const filename of imageFiles) {
  const documentId = `image-${stableId(filename)}`;

  if (!includeNonProductAssets && isNonProductAsset(filename)) {
    console.log(`Uploading non-product asset without a Firestore product: ${filename}`);
    try { await unsignedUpload(filename); uploaded += 1; } catch (error) { failed += 1; console.error(`Upload failed for ${filename}: ${error.message}`); }
    continue;
  }

  if (await productExists(documentId)) {
    skipped += 1;
    console.log(`Skipping existing product: ${filename}`);
    continue;
  }

  try {
    const publicId = await unsignedUpload(filename);
    uploaded += 1;
    await saveProduct(documentId, { ...productMetadata(filename), image: publicId });
    created += 1;
    console.log(`Uploaded and created product: ${filename}`);
  } catch (error) {
    failed += 1;
    console.error(`Failed for ${filename}: ${error.message}`);
  }
}

console.log({ uploaded, productsCreated: created, skipped, failed });
process.exitCode = failed ? 1 : 0;
