const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(file: File): Promise<string> {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('Cloudinary Upload Debug:', {
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      file: file ? { name: file.name, size: file.size, type: file.type } : undefined
    });
  }

  if (!CLOUD_NAME || CLOUD_NAME === "undefined") {
    throw new Error('Cloudinary cloud name is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your environment variables.');
  }

  if (!UPLOAD_PRESET || UPLOAD_PRESET === "unsigned_preset" || UPLOAD_PRESET === "undefined") {
    throw new Error('Cloudinary upload preset is not configured. Please add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      const message = errorData.error?.message || errorData.message || response.statusText;
      throw new Error(`Upload failed: ${message}. Check that '${UPLOAD_PRESET}' is an active unsigned Cloudinary upload preset.`);
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(`Cloudinary error: ${data.error.message}`);
    }
    
    return data.public_id;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error instanceof Error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
    throw new Error('Failed to upload image to Cloudinary');
  }
}
