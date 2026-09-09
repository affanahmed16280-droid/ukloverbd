import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, assertFirebaseConfigured, storage } from "./firebase";

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function fileExtension(file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension && /^[a-z0-9]+$/.test(extension) ? `.${extension}` : "";
}

export async function uploadProductImage(file: File): Promise<string> {
  assertFirebaseConfigured();

  if (!auth.currentUser) {
    throw new Error("Please sign in before uploading an image.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files can be uploaded.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Images must be 10 MB or smaller.");
  }

  const uniqueId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const path = `products/${Date.now()}-${uniqueId}${fileExtension(file)}`;
  const imageRef = ref(storage, path);

  await uploadBytes(imageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(imageRef);
}
