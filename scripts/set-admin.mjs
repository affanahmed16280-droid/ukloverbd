import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const email = process.argv[2]?.trim()
if (!email) {
  throw new Error('Usage: npm run set-admin -- admin@example.com')
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : path.join(projectRoot, 'serviceAccountKey.json')

const serviceAccount = JSON.parse(await readFile(serviceAccountPath, 'utf8'))
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) })
}

const adminAuth = getAuth()
const user = await adminAuth.getUserByEmail(email)
await adminAuth.setCustomUserClaims(user.uid, {
  ...(user.customClaims ?? {}),
  admin: true,
})

console.log(`Granted the admin claim to ${email}. Sign out and back in to refresh the ID token.`)
