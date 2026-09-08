import { v2 as cloudinary } from "cloudinary";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesFolder = path.join(projectRoot, "product-images");
const serviceAccountPath = path.join(projectRoot, "serviceAccountKey.json");

const requiredEnvironment = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missingEnvironment = requiredEnvironment.filter((name) => !process.env[name]);

if (missingEnvironment.length > 0) {
  throw new Error(`Missing environment variables: ${missingEnvironment.join(", ")}`);
}

if (!fs.existsSync(imagesFolder)) {
  throw new Error(`Folder not found: ${imagesFolder}`);
}

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Firebase service account not found: ${serviceAccountPath}`);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env["\uFEFFCLOUDINARY_API_KEY"],
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

if (!getApps().length) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  initializeApp({
    credential: cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });
}

const db = getFirestore();
const imageFiles = fs
  .readdirSync(imagesFolder, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name));

for (const entry of imageFiles) {
  const filePath = path.join(imagesFolder, entry.name);
  const productName = path.parse(entry.name).name;

  console.log(`Uploading ${entry.name} to Cloudinary...`);

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: "products",
      use_filename: true,
      unique_filename: false,
    });

    await db.collection("products").add({
      name: productName,
      price: 0,
      sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
      image: uploadResult.public_id,  // Store public ID instead of URL
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log(`Successfully added to Firestore: ${productName}`);
  } catch (error) {
    console.error(`Error processing ${entry.name}:`, error instanceof Error ? error.message : error);
  }
}

console.log(`Bulk upload complete. Processed ${imageFiles.length} image(s).`);
