# Firebase production setup

The storefront uses Firestore for products and orders, Firebase Authentication for administrator sign-in, and Firebase Storage for product images. Firebase web configuration values are expected in `.env.local` locally and in the deployment environment when building the app.

## 1. Configure the web app

Copy `.env.local.example` to `.env.local` and fill in the Firebase web-app values from Firebase Console → Project settings → Your apps. The `NEXT_PUBLIC_FIREBASE_*` values identify a Firebase web app; they are not administrator credentials. Never put a Firebase service-account JSON value or an admin password in a `NEXT_PUBLIC_` variable.

In Firebase Console → Authentication → Sign-in method, enable **Email/Password** and create the administrator's user account.

## 2. Grant administrator access

Keep a Firebase service-account key outside version control. By default, the included helper reads the ignored `serviceAccountKey.json` in the repository root; alternatively, point `FIREBASE_SERVICE_ACCOUNT_PATH` to a file outside the repository.

```powershell
npm run set-admin -- admin@example.com
```

The command adds the Firebase custom claim `admin: true`. The administrator must sign out and back in after the claim is set. The app checks this claim in the browser, while Firestore and Storage rules enforce it on the backend.

## 3. Deploy the security rules

The repository contains the production rules in `firestore.rules` and `storage.rules`, referenced by `firebase.json`.

```powershell
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,storage
```

These rules provide the following access:

- Everyone can read products and submit a schema-validated pending order.
- Only an authenticated user with the `admin` claim can create, update, or delete products; read and manage orders; or upload/delete product images.
- Product images are publicly readable and limited to image files below 10 MB.

## 4. Verify before launch

1. Open the storefront in a private browser window: products should load and a guest order should submit.
2. Visit `/admin`: a normal Firebase user must be denied.
3. Sign in with the claimed administrator: product editing and image upload should work.
4. Confirm that a direct unauthenticated Firestore product write and a Storage upload are rejected by Firebase.

If a service-account key has ever been committed or shared outside a trusted environment, revoke it in Google Cloud Console and create a new one.
