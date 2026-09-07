const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_preset";

export async function uploadToCloudinary(file: File): Promise<string> {
  console.log('=== Cloudinary Upload Debug ===');
  console.log('Cloud Name:', CLOUD_NAME);
  console.log('Upload Preset:', UPLOAD_PRESET);
  console.log('File:', file.name, file.size, file.type);
  console.log('Environment check:', {
    hasCloudName: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    hasUploadPreset: !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    cloudNameValue: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadPresetValue: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  });

  if (CLOUD_NAME === "demo" || CLOUD_NAME === "undefined") {
    throw new Error('Cloudinary cloud name is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your environment variables.');
  }

  if (UPLOAD_PRESET === "unsigned_preset" || UPLOAD_PRESET === "undefined") {
    throw new Error('Cloudinary upload preset is not configured. Please add NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to your environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    console.log('Upload URL:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudinary upload failed:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }
      
      throw new Error(`Upload failed: ${errorData.error?.message || errorData.message || response.statusText} (Status: ${response.status})`);
    }

    const data = await response.json();
    console.log('Upload response:', data);
    
    if (data.error) {
      throw new Error(`Cloudinary error: ${data.error.message}`);
    }
    
    console.log('Upload successful, public_id:', data.public_id);
    return data.public_id;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    if (error instanceof Error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
    throw new Error('Failed to upload image to Cloudinary');
  }
}