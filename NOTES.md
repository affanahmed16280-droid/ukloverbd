# UK Brand Lover — Development Notes

## Firebase Firestore Security Rules
Paste these in: Firebase Console → Firestore → Rules → Edit rules → Publish

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      // Allow unauthenticated guest order writes
      allow create: if request.resource.data.keys().hasAll(['name','phone','address','items','total','createdAt'])
                    && request.resource.data.total is number
                    && request.resource.data.total > 0
                    && request.resource.data.name is string
                    && request.resource.data.phone is string
                    && request.resource.data.address is string;
      // Block all reads/updates/deletes from client
      allow read, update, delete: if false;
    }
    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Cloudinary Image URL Format
https://res.cloudinary.com/{cloud_name}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/{public_id}

## Deployment (Vercel)
1. Push to GitHub
2. New Project on vercel.com → Import repo
3. Add all NEXT_PUBLIC_* env vars in Vercel settings
4. Deploy
