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

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// Sample products with your existing Cloudinary images
const sampleProducts = [
  {
    name: "CeraVe Hydrating Cleanser",
    brand: "CeraVe",
    variant: "236ml",
    price: 1850,
    category: "Skincare",
    image: "samples/ecommerce/leather-bag-gray",
    badge: "Best Seller"
  },
  {
    name: "The Ordinary Niacinamide",
    brand: "The Ordinary",
    variant: "30ml",
    price: 1200,
    category: "Skincare",
    image: "samples/ecommerce/accessories-bag",
    badge: "Popular"
  },
  {
    name: "Vitamin E Moisture Cream",
    brand: "The Body Shop",
    variant: "50ml",
    price: 2100,
    category: "Skincare",
    image: "samples/food/spices",
    badge: "New"
  },
  {
    name: "Deep Moisture Body Wash",
    brand: "Dove",
    variant: "500ml",
    price: 980,
    category: "Body Care",
    image: "samples/ecommerce/shoes",
    badge: "Sale"
  },
  {
    name: "Q10 Anti-Wrinkle Cream",
    brand: "Nivea",
    variant: "50ml SPF 15",
    price: 1650,
    category: "Skincare",
    image: "samples/bike",
    badge: "Popular"
  },
  {
    name: "Micellar Cleansing Water",
    brand: "Garnier",
    variant: "400ml",
    price: 1100,
    category: "Skincare",
    image: "samples/animals/reindeer",
    badge: "New"
  },
  {
    name: "Revitalift Anti-Wrinkle Serum",
    brand: "L'Oréal Paris",
    variant: "30ml",
    price: 2400,
    category: "Skincare",
    image: "samples/people/smiling-man",
    badge: "Best Seller"
  },
  {
    name: "Kind to Skin Moisturiser",
    brand: "Simple",
    variant: "125ml",
    price: 1450,
    category: "Skincare",
    image: "samples/landscapes/nature-italy",
    badge: ""
  }
];

async function addSampleProducts() {
  try {
    console.log('🚀 Adding sample products...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const product of sampleProducts) {
      try {
        const productData = {
          name: product.name,
          brand: product.brand,
          variant: product.variant,
          price: product.price,
          category: product.category,
          image: product.image,
          badge: product.badge,
          createdAt: new Date().toISOString()
        };
        
        await addDoc(collection(db, 'products'), productData);
        console.log(`✅ Added: ${product.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to add ${product.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully added: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
addSampleProducts();
