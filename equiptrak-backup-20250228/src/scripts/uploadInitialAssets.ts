import { uploadCompanyAsset } from "@/utils/uploadCompanyAsset";

// Function to convert base64 to File object
function base64ToFile(base64String: string, filename: string) {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export async function uploadInitialAssets() {
  try {
    // Upload logo
    const logoFile = await fetch('/lovable-uploads/b9303b49-864d-499f-bd95-bdd482e58141.png')
      .then(r => r.blob())
      .then(blob => new File([blob], 'bws-logo.png', { type: 'image/png' }));
    
    await uploadCompanyAsset(logoFile, 'logo', 'BWS Company Logo');

    // Upload signature
    const signatureFile = await fetch('/lovable-uploads/29e67d0b-d109-475f-b30f-3f2b3673a5e2.png')
      .then(r => r.blob())
      .then(blob => new File([blob], 'signature.png', { type: 'image/png' }));
    
    await uploadCompanyAsset(signatureFile, 'signature', 'Digital Signature');

    console.log('Successfully uploaded company assets');
  } catch (error) {
    console.error('Error uploading initial assets:', error);
    throw error;
  }
}

// Execute the upload
uploadInitialAssets();