import {
  getIdTokenResult,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { assertFirebaseConfigured, auth } from "./firebase";

export async function isAdmin(user: User): Promise<boolean> {
  const token = await getIdTokenResult(user, true);
  return token.claims.admin === true;
}

export async function signInAsAdmin(email: string, password: string): Promise<User> {
  assertFirebaseConfigured();

  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  if (!(await isAdmin(credential.user))) {
    await signOut(auth);
    throw new Error("This account does not have administrator access.");
  }

  return credential.user;
}
