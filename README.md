This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔧 **IMPORTANT: Cloudinary Setup for Image Upload**

### Step 1: Create Cloudinary Account
1. Go to [cloudinary.com](https://cloudinary.com) and sign up
2. Navigate to your Dashboard
3. Note your **Cloud Name** (found in the dashboard URL)

### Step 2: Create Upload Preset (CRITICAL)
1. Go to Settings → Upload
2. Click "Add upload preset"
3. Name it something like `unsigned_upload`
4. **IMPORTANT**: Set "Signing Mode" to "Unsigned"
5. Under "Allowed formats", select images (jpg, png, etc.)
6. Save the preset
7. Copy the **Upload Preset Name**

### Step 3: Add Environment Variables

#### For Local Development (.env.local):
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

#### For Vercel Deployment:
Add these environment variables in your Vercel project settings:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_name
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

### Step 4: Firebase Firestore Rules (CRITICAL)
**This is REQUIRED for the site to work!**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `ukloverbangla`
3. Go to **Firestore Database** → **Rules**
4. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish**

**Note:** This allows public read/write access. For production, implement proper authentication.

## Admin Panel

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin) for:

- **Bulk Image Upload**: Upload multiple product images at once
- **Product Management**: Edit product names, prices, categories, and images
- **Easy for Non-Technical Users**: Simple forms - no coding knowledge needed

### Admin Login

The admin panel is password protected. Set your admin password in `.env.local`:

```env
NEXT_PUBLIC_ADMIN_PASSWORD=your_secure_password
```

Default password is `admin123`. Change this for security!

## Upload Product Images

The bulk uploader reads images from `product-images`, uploads them to the
`products` folder in Cloudinary, and creates matching documents in Firestore.

Set the Cloudinary credentials in PowerShell before running it:

```powershell
$env:CLOUDINARY_CLOUD_NAME = "your-cloud-name"
$env:CLOUDINARY_API_KEY = "your-api-key"
$env:CLOUDINARY_API_SECRET = "your-api-secret"
npm run upload
```

The uploader also requires `serviceAccountKey.json` in the project root. This
file is ignored by Git and must not be committed. Rotate the Cloudinary and
Firebase credentials if they have been shared publicly or committed before.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🔥 **CRITICAL: Fix Firebase Permissions**

If you see "Missing or insufficient permissions" error:

1. Go to Firebase Console → Firestore Database → Rules
2. Change rules to allow read/write:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click "Publish"

## 🔧 **Fix Cloudinary Upload Issues**

If you see "Unknown API key" or 401 errors:

1. **Check Environment Variables in Vercel:**
   - Go to Vercel → Settings → Environment Variables
   - Ensure these are set for **Production**:
     - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=c-6cf15ba3c89242d90ff394122743dc`
     - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned_upload`

2. **Redeploy Manually:**
   - Go to Vercel → Deployments
   - Click the three dots on latest deployment
   - Select "Redeploy"

3. **Verify Upload Preset:**
   - Go to Cloudinary → Settings → Upload
   - Ensure `unsigned_upload` preset exists
   - Check it's set to "Unsigned" mode

## Troubleshooting Image Upload Issues

If image upload fails:

1. **Check Cloudinary Credentials**: Ensure cloud name and upload preset are correct
2. **Upload Preset Must Be Unsigned**: The upload preset must be set to "Unsigned" mode for client-side uploads
3. **File Size Limits**: Cloudinary free tier has file size limits
4. **Allowed Formats**: Ensure your upload preset allows the image formats you're uploading
5. **CORS Issues**: Make sure your domain is whitelisted in Cloudinary settings if needed
6. **Environment Variables**: Ensure they're added to BOTH Preview and Production in Vercel
