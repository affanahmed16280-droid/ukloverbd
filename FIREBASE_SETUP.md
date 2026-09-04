# Firebase Setup Guide

To make the order system fully functional, you need to set up Firebase. Follow these steps:

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics (optional but recommended)

## 2. Set up Firestore Database

1. In your Firebase project, go to "Build" > "Firestore Database"
2. Click "Create database"
3. Choose your location (recommended: default or closest to your users)
4. Select "Start in test mode" for development
5. Create a collection called "orders"

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Give it a name (e.g., "ukloverbd-web")
5. Copy the configuration values

## 4. Set Environment Variables

Create a `.env.local` file in your project root with the following content:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration (for product images)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

Replace the placeholder values with your actual Firebase configuration.

## 5. Firestore Security Rules

For development, you can use these test rules (in Firestore > Rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Important:** For production, update these rules to be more restrictive:

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

## 6. Restart Development Server

After setting up the environment variables, restart your development server:

```bash
npm run dev
```

## 7. Test the Order System

1. Add products to cart
2. Go to checkout
3. Fill in the form
4. Submit the order
5. Check your Firestore Database to see the new order

## Troubleshooting

**If orders aren't saving:**
- Check that all environment variables are set correctly
- Verify Firestore is in test mode or has proper rules
- Check browser console for errors
- Ensure Firebase is properly initialized

**If you see Firebase errors:**
- Double-check your API key and project ID
- Make sure your Firebase project has Firestore enabled
- Verify the authDomain matches your project format
