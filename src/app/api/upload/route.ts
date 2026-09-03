import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using a stream
    const result = await new Promise<{
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "uk_brand_lover_products",
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve(result as typeof resolve extends (value: infer T) => void ? T : never);
          else reject(new Error("No result from Cloudinary"));
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
