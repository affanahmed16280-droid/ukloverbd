import { v2 as cloudinary } from "cloudinary";
import { getFirebaseAdminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary server credentials are not configured.");
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
}

function validPublicId(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value.length <= 500
    && !value.startsWith("http://")
    && !value.startsWith("https://")
    && !value.includes("..");
}

export async function DELETE(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const idToken = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!idToken) return Response.json({ error: "Authentication is required." }, { status: 401 });

    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
    if (decodedToken.admin !== true) {
      return Response.json({ error: "Administrator access is required." }, { status: 403 });
    }

    const body: unknown = await request.json();
    const publicId = typeof body === "object" && body !== null && "publicId" in body
      ? (body as { publicId?: unknown }).publicId
      : undefined;
    if (!validPublicId(publicId)) {
      return Response.json({ error: "A valid Cloudinary public ID is required." }, { status: 400 });
    }

    getCloudinaryConfig();
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Cloudinary could not delete the image (${result.result}).`);
    }

    return Response.json({ deleted: result.result === "ok" });
  } catch (error) {
    console.error("Cloudinary image deletion failed", error);
    return Response.json(
      { error: "The image could not be deleted from Cloudinary." },
      { status: 500 },
    );
  }
}
