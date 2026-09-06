import { v2 as cloudinary } from "cloudinary";
import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount as FirebaseServiceAccount,
} from "firebase-admin/app";
import { FieldValue, getFirestore, type Firestore } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type ServiceAccountJson = {
  project_id: string;
  client_email: string;
  private_key: string;
};

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesFolder = path.join(projectRoot, "product-images");
const serviceAccountPath = path.join(projectRoot, "serviceAccountKey.json");

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function loadServiceAccount(): FirebaseServiceAccount {
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(`Firebase service account not found: ${serviceAccountPath}`);
  }

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8")) as ServiceAccountJson;

    return {
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    };
  } catch (error) {
    throw new Error(
      `Unable to parse ${serviceAccountPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function initializeFirebase(): Firestore {
  if (!getApps().length) {
    initializeApp({
      credential: cert(loadServiceAccount()),
    });
  }

  return getFirestore();
}

async function processUploads(): Promise<void> {
  if (!fs.existsSync(imagesFolder)) {
    throw new Error(`Product image folder not found: ${imagesFolder}`);
  }

  cloudinary.config({
    cloud_name: getRequiredEnvironmentVariable("CLOUDINARY_CLOUD_NAME"),
    api_key: getRequiredEnvironmentVariable("CLOUDINARY_API_KEY"),
    api_secret: getRequiredEnvironmentVariable("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  const db = initializeFirebase();
  const imageFiles = fs
    .readdirSync(imagesFolder, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name));

  for (const imageFile of imageFiles) {
    const filePath = path.join(imagesFolder, imageFile.name);
    const productName = path.parse(imageFile.name).name;

    console.log(`Uploading ${imageFile.name} to Cloudinary...`);

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
        imageUrl: uploadResult.secure_url,
        createdAt: FieldValue.serverTimestamp(),
      });

      console.log(`Successfully added to Firestore: ${productName}`);
    } catch (error) {
      console.error(
        `Error processing ${imageFile.name}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  console.log(`Bulk upload complete. Processed ${imageFiles.length} image(s).`);
}

processUploads().catch((error: unknown) => {
  console.error("Bulk upload failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
