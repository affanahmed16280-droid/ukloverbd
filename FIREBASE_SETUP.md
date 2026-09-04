# Firebase Setup Guide

✅ **Firebase is already configured!** Your backend is ready to take orders.

## Current Configuration

Your Firebase project is already set up with:
- **Project ID:** ukloverbangla
- **Database:** Firestore (enabled)
- **Authentication:** Configured
- **Configuration:** Applied to `src/lib/firebase.ts`

## Order System Status

✅ **Fully Functional Components:**
- Cart system (Zustand state management)
- Product catalog with images
- Checkout form with validation
- Order submission to Firestore
- WhatsApp integration for order confirmation
- Responsive design for mobile/desktop

## How to Test Your Order System

### Option 1: Test via Web Interface
1. Open your browser to `http://localhost:3000`
2. Add products to cart by clicking on them
3. Click the cart icon and proceed to checkout
4. Fill in the form (name, phone, address)
5. Submit the order
6. Check your Firebase Console to see the order

### Option 2: Use the Test File
Open `test-order.html` in your browser to test Firebase connection and order submission directly.

## Firebase Console Access

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `ukloverbangla`
3. Navigate to "Firestore Database" to view orders
4. Check "Build" > "Firestore Database" > "orders" collection

## Firestore Security Rules

Your current rules allow order creation. For production, consider updating to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{document=**} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

## Environment Variables

Your Firebase configuration is hardcoded in `src/lib/firebase.ts`. For production deployment, consider moving these to environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDL23dqKxfGBkLcxjGqKfnwInzIpgO235g
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ukloverbangla.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ukloverbangla
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ukloverbangla.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=64007694018
NEXT_PUBLIC_FIREBASE_APP_ID=1:64007694018:web:728f3e9969cf670a193d5b
```

## Troubleshooting

**If orders aren't appearing in Firestore:**
1. Check Firebase Console > Firestore Database
2. Verify the "orders" collection exists
3. Check browser console for errors
4. Ensure Firestore is in test mode or has proper rules

**If you see permission errors:**
1. Go to Firebase Console > Firestore Database > Rules
2. Ensure rules allow write access
3. Consider using test mode for development

## Order Flow

1. Customer browses products
2. Adds items to cart
3. Proceeds to checkout
4. Fills delivery details
5. Submits order → saves to Firestore
6. Gets confirmation with WhatsApp link
7. You receive order in Firebase Console
8. Contact customer via WhatsApp to confirm
