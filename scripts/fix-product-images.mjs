import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

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

async function fixProductImages() {
  try {
    console.log('🔧 Starting product image fix...');
    
    // Get all products
    const snapshot = await getDocs(collection(db, 'products'));
    console.log(`📦 Found ${snapshot.docs.length} products in database`);
    
    let fixedCount = 0;
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const document of snapshot.docs) {
      const productData = document.data();
      const productId = document.id;
      
      console.log(`\n📝 Checking product: ${productData.name || 'Unnamed'} (${productId})`);
      console.log('   Current image:', productData.image);
      
      // Check if image is invalid
      if (!productData.image || productData.image === 'undefined' || productData.image === 'null') {
        console.log('   ❌ Invalid image data - deleting product');
        
        try {
          await deleteDoc(doc(db, 'products', productId));
          console.log('   ✅ Product deleted');
          deletedCount++;
        } catch (error) {
          console.error('   ❌ Failed to delete product:', error.message);
          errorCount++;
        }
      } else {
        console.log('   ✅ Image data looks valid');
        fixedCount++;
      }
    }
    
    console.log('\n🎉 Fix completed!');
    console.log(`✅ Valid products: ${fixedCount}`);
    console.log(`🗑️  Deleted invalid products: ${deletedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixProductImages();