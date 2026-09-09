import { uploadToCloudinary } from "./cloudinary";
import { auth } from "./firebase";

export async function uploadProductImage(file: File): Promise<string> {
  return uploadToCloudinary(file);
}

export async function deleteProductImage(image: string): Promise<void> {
  const publicId = image.trim();
  if (!publicId || publicId.startsWith("http://") || publicId.startsWith("https://")) return;

  const user = auth.currentUser;
  if (!user) throw new Error("Please sign in before deleting an image.");

  const response = await fetch("/api/cloudinary/images", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${await user.getIdToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ publicId }),
  });

  if (response.ok) return;

  const payload = await response.json().catch(() => null) as { error?: unknown } | null;
  throw new Error(typeof payload?.error === "string" ? payload.error : "Cloudinary could not delete the image.");
}
