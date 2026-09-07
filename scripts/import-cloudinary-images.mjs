import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDL23dqKxfGBkLcxjGqKfnwInzIpg0235g",
  authDomain: "ukloverbangla.firebaseapp.com",
  projectId: "ukloverbangla",
  storageBucket: "ukloverbangla.firebasestorage.app",
  messagingSenderId: "64007694018",
  appId: "1:64007694018:web:728f3e9969cf670a193d5b"
};

// Cloudinary Configuration
const CLOUD_NAME = "c-6cf15ba3c89242d90ff394122743dc";
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Function to get all images from Cloudinary
async function getCloudinaryImages() {
  if (!API_KEY || !API_SECRET) {
    throw new Error('CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set in environment variables');
  }

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image`,
    {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Cloudinary images: ${response.statusText}`);
  }

  const data = await response.json();
  return data.resources || [];
}

// Function to extract product info from filename
function extractProductInfo(filename) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Split by common separators
  const parts = nameWithoutExt.split(/[-_\s]/);
  
  return {
    name: parts[0] || 'Product',
    brand: parts[1] || 'UK Brand',
    variant: parts.slice(2).join(' ') || 'Standard',
    category: 'Skincare' // Default category
  };
}

// Function to create product in Firestore
async function createProduct(imageResource) {
  const productInfo = extractProductInfo(imageResource.public_id);
  
  const productData = {
    name: productInfo.name,
    brand: productInfo.brand,
    variant: productInfo.variant,
    price: 1500, // Default price
    category: productInfo.category,
    image: imageResource.public_id,
    badge: 'New',
    createdAt: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'products'), productData);
  return { id: docRef.id, ...productData };
}

// Main import function
async function importCloudinaryImages() {
  try {
    console.log('🚀 Starting Cloudinary image import...');
    console.log('📦 Cloud Name:', CLOUD_NAME);
    
    // Get all images from Cloudinary
    console.log('📥 Fetching images from Cloudinary...');
    const images = await getCloudinaryImages();
    console.log(`✅ Found ${images.length} images in Cloudinary`);
    
    if (images.length === 0) {
      console.log('⚠️  No images found in Cloudinary');
      return;
    }

    // Import each image as a product
    console.log('📝 Creating products in Firestore...');
    let successCount = 0;
    let errorCount = 0;
    
    for (const image of images) {
      try {
        const product = await createProduct(image);
        console.log(`✅ Created product: ${product.name} (${image.public_id})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to create product for ${image.public_id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
importCloudinaryImages();