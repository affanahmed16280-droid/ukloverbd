import { initializeApp, getApps, getApp } from "firebase/app";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const firebaseConfig = {
  apiKey: "AIzaSyDL23dqKxfGBkLcxGqjKfnwInzIpg0235g",
  authDomain: "ukloverbangla.firebaseapp.com",
  projectId: "ukloverbangla",
  storageBucket: "ukloverbangla.firebasestorage.app",
  messagingSenderId: "64007694018",
  appId: "1:64007694018:web:728f3e9969cf670a193d5b",
};

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY || process.env["\uFEFFCLOUDINARY_API_KEY"];
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const includeNonProductAssets = process.argv.includes("--include-non-product-assets");
const imagesFolder = path.resolve(process.cwd(), "product-images");

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set.");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

function normalizeAssetName(value) {
  return value.toLowerCase().replace(/[ _()\-]+/g, "");
}

function stableId(filename) {
  return createHash("sha256").update(filename).digest("hex").slice(0, 20);
}

function isNonProductAsset(filename) {
  return /^(logo|hero[- ]?cover)/i.test(path.parse(filename).name);
}

function productMetadata(filename) {
  const baseName = path.parse(filename).name.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const comparable = baseName.toLowerCase();
  const category = /(churi|bangle|bracelet|jewelry|jewellery)/.test(comparable)
    ? "Jewelry"
    : /(makeup|make up|mesta)/.test(comparable)
      ? "Cosmetics"
      : /(shampoo|hair)/.test(comparable)
        ? "Haircare"
        : /(shower gel|toothpaste|lotion|body wash)/.test(comparable)
          ? "Body Care"
          : "Skincare";

  return {
    name: baseName.replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Unnamed product",
    brand: "UK Brand Lover",
    variant: "",
    price: 0,
    category,
    badge: "New",
    needsReview: true,
    sourceFilename: filename,
  };
}

async function getCloudinaryImages() {
  const authorization = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/resources/image?max_results=500`,
    { headers: { Authorization: `Basic ${authorization}` } }
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error?.message || `Cloudinary request failed (${response.status})`);

  const localFiles = fs.readdirSync(imagesFolder).filter((filename) => /\.(jpg|jpeg|png|webp|gif)$/i.test(filename));
  const localByName = new Map(localFiles.map((filename) => [normalizeAssetName(path.parse(filename).name), filename]));
  return (body.resources || [])
    .filter((resource) => !resource.public_id.includes("/"))
    .map((resource) => ({ resource, filename: localByName.get(normalizeAssetName(resource.public_id)) }))
    .filter((item) => item.filename);
}

async function createOrUpdateProduct(imageResource, filename) {
  const documentId = `image-${stableId(filename)}`;
  const productData = {
    ...productMetadata(filename),
    image: imageResource.public_id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, "products", documentId), productData, { merge: true });
  return documentId;
}

async function importCloudinaryImages() {
  console.log(`Fetching project assets from Cloudinary environment ${cloudName}...`);
  const images = await getCloudinaryImages();
  console.log(`Matched ${images.length} of the local project images.`);

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  for (const { resource, filename } of images) {
    if (!includeNonProductAssets && isNonProductAsset(filename)) {
      skippedCount += 1;
      console.log(`Skipped non-product asset: ${filename}`);
      continue;
    }
    try {
      const id = await createOrUpdateProduct(resource, filename);
      console.log(`Saved ${filename} (${id})`);
      successCount += 1;
    } catch (error) {
      errorCount += 1;
      console.error(`Failed to save ${filename}: ${error.message}`);
    }
  }
  console.log({ matched: images.length, productsSaved: successCount, skipped: skippedCount, failed: errorCount });
  process.exitCode = errorCount ? 1 : 0;
}

importCloudinaryImages().catch((error) => {
  console.error(`Import failed: ${error.message}`);
  process.exitCode = 1;
});
